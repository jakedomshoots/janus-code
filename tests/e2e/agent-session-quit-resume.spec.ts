import { existsSync, readFileSync } from 'fs'
import path from 'path'
import type { ElectronApplication } from '@stablyai/playwright-test'
import { test, expect } from './helpers/orca-app'
import { TEST_REPO_PATH_FILE } from './global-setup'
import {
  execInTerminal,
  waitForActivePaneHookDescriptor,
  waitForActivePanePtyId,
  waitForActiveTerminalManager,
  waitForPaneCount,
  waitForTerminalOutput
} from './helpers/terminal'
import { ensureTerminalVisible, waitForActiveWorktree, waitForSessionReady } from './helpers/store'
import { attachRepoAndOpenTerminal, createRestartSession } from './helpers/orca-restart'
import { PROTOCOL_VERSION } from '../../src/main/daemon/types'
import { getPtyWrites, installMainProcessPtyWriteSpy } from './helpers/agent-workspace'

const PROVIDER_SESSION_ID = 'e2e-quit-resume-session'

function readPersistedSleepingSessions(userDataDir: string): Record<string, unknown> {
  const raw = readFileSync(path.join(userDataDir, 'orca-data.json'), 'utf8')
  const parsed = JSON.parse(raw) as {
    workspaceSession?: { sleepingAgentSessionsByPaneKey?: Record<string, unknown> }
    workspaceSessionsByHostId?: Record<
      string,
      { sleepingAgentSessionsByPaneKey?: Record<string, unknown> }
    >
  }
  return Object.assign(
    {},
    parsed.workspaceSession?.sleepingAgentSessionsByPaneKey ?? {},
    ...Object.values(parsed.workspaceSessionsByHostId ?? {}).map(
      (session) => session.sleepingAgentSessionsByPaneKey ?? {}
    )
  ) as Record<string, unknown>
}

function readDaemonPid(userDataDir: string): number {
  const raw = readFileSync(
    path.join(userDataDir, 'daemon', `daemon-v${PROTOCOL_VERSION}.pid`),
    'utf8'
  )
  const parsed = JSON.parse(raw) as { pid?: unknown }
  if (typeof parsed.pid !== 'number') {
    throw new Error(`Daemon pid file did not contain a numeric pid: ${raw}`)
  }
  return parsed.pid
}

test.describe.configure({ mode: 'serial' })

test('resumes an agent session after quit when its daemon PTY died while the app was closed', async (// oxlint-disable-next-line no-empty-pattern -- Playwright's second fixture arg is testInfo; the first must be an object destructure to opt out of the default fixture set.
{}, testInfo) => {
  const repoPath = readFileSync(TEST_REPO_PATH_FILE, 'utf-8').trim()
  if (!repoPath || !existsSync(repoPath)) {
    test.skip(true, 'Global setup did not produce a seeded test repo')
    return
  }
  test.skip(process.platform === 'win32', 'Uses POSIX SIGKILL to simulate daemon death')

  const session = createRestartSession(testInfo)
  let firstApp: ElectronApplication | null = null
  let secondApp: ElectronApplication | null = null

  try {
    const firstLaunch = await session.launch()
    firstApp = firstLaunch.app
    const page = await firstApp.firstWindow()
    const worktreeId = await attachRepoAndOpenTerminal(page, repoPath)
    await waitForSessionReady(page)
    await waitForActiveWorktree(page)
    await ensureTerminalVisible(page)
    await waitForActiveTerminalManager(page, 30_000)
    await waitForPaneCount(page, 1, 30_000)

    const marker = `AGENT_QUIT_RESUME_${Date.now()}`
    const descriptor = await waitForActivePaneHookDescriptor(page)
    const firstPtyId = await waitForActivePanePtyId(page)
    await execInTerminal(page, firstPtyId, `echo ${marker}`)
    await waitForTerminalOutput(page, marker)

    // Why: a real agent run reports its provider session id over the hook
    // server; seeding the same store entry keeps this test hermetic (no agent
    // CLI install or auth) while exercising the identical persistence path.
    await page.evaluate(
      ({ paneKey, worktreeId: wtId, providerSessionId }) => {
        window.__store
          ?.getState()
          .setAgentStatus(
            paneKey,
            { state: 'working', prompt: 'finish the task', agentType: 'codex' },
            'Codex',
            { updatedAt: Date.now() + 60_000, stateStartedAt: Date.now() },
            { worktreeId: wtId },
            { providerSession: { key: 'session_id', id: providerSessionId } }
          )
      },
      {
        paneKey: descriptor.paneKey,
        worktreeId: descriptor.worktreeId,
        providerSessionId: PROVIDER_SESSION_ID
      }
    )
    await expect
      .poll(() =>
        page.evaluate(
          (paneKey) =>
            window.__store?.getState().agentStatusByPaneKey[paneKey]?.providerSession?.id ?? null,
          descriptor.paneKey
        )
      )
      .toBe(PROVIDER_SESSION_ID)
    await page.evaluate(() => {
      window.__store?.getState().captureAllSleepingAgentSessions()
    })
    await expect
      .poll(() =>
        page.evaluate(
          (providerSessionId) =>
            Object.values(window.__store?.getState().sleepingAgentSessionsByPaneKey ?? {}).some(
              (record) => record.providerSession.id === providerSessionId
            ),
          PROVIDER_SESSION_ID
        )
      )
      .toBe(true)

    const daemonPid = readDaemonPid(session.userDataDir)

    await session.close(firstApp)
    firstApp = null
    await expect
      .poll(
        () =>
          Object.values(readPersistedSleepingSessions(session.userDataDir)).some(
            (record) =>
              typeof record === 'object' &&
              record !== null &&
              'providerSession' in record &&
              (record.providerSession as { id?: unknown }).id === PROVIDER_SESSION_ID
          ),
        {
          timeout: 5_000,
          message: 'quit close should persist a sleeping agent session for cold resume'
        }
      )
      .toBe(true)

    // Why: simulates the daemon (and the agent CLI inside it) dying while the
    // app is closed — reboot, crash, or update kill. SIGKILL leaves history
    // checkpoints unclean so the relaunch takes the cold-restore path.
    process.kill(daemonPid, 'SIGKILL')

    const secondLaunch = await session.launch()
    secondApp = secondLaunch.app
    await installMainProcessPtyWriteSpy(secondApp)
    await waitForSessionReady(secondLaunch.page)
    await expect
      .poll(
        async () => secondLaunch.page.evaluate(() => window.__store?.getState().activeWorktreeId),
        { timeout: 15_000 }
      )
      .toBe(worktreeId)
    await ensureTerminalVisible(secondLaunch.page)
    await waitForActiveTerminalManager(secondLaunch.page, 30_000)
    await waitForPaneCount(secondLaunch.page, 1, 30_000)
    await expect
      .poll(
        async () =>
          (await getPtyWrites(secondLaunch.app)).some((data) => data.includes(PROVIDER_SESSION_ID)),
        { timeout: 15_000 }
      )
      .toBe(true)

    // The quit-captured provider session id must drive a resume command into
    // the cold-restored pane. Assert the PTY write directly because shells do
    // not consistently echo startup input during cold restore.

    // No duplicate resume tab: the quit-origin record must not be consumed by
    // worktree activation on top of the pane-level cold-restore.
    const terminalTabCount = await secondLaunch.page.evaluate(
      (wtId) => (window.__store?.getState().tabsByWorktree[wtId] ?? []).length,
      worktreeId
    )
    expect(terminalTabCount).toBe(1)
  } finally {
    if (secondApp) {
      await session.close(secondApp)
    }
    if (firstApp) {
      await session.close(firstApp)
    }
    await session.dispose()
  }
})
