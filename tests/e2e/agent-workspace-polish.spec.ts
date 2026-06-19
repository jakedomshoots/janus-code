import type { Page } from '@stablyai/playwright-test'
import { test, expect } from './helpers/orca-app'
import {
  agentWorkspaceRegion,
  agentWorkspaceRightPanel,
  clearPtyWriteLog,
  enableGuiAgentWorkspace,
  waitForAgentRightPanelActions,
  getPtyWrites,
  installMainProcessPtyWriteSpy,
  seedAgentWorkspaceThread,
  selectAgentThreadTab
} from './helpers/agent-workspace'
import {
  ensureTerminalVisible,
  getWorktreeTabs,
  waitForActiveWorktree,
  waitForSessionReady
} from './helpers/store'
import {
  waitForActivePaneHookDescriptor,
  waitForActiveTerminalManager,
  waitForPaneCount
} from './helpers/terminal'

async function prepareGuiWorkspaceTerminal(page: Page): Promise<{
  worktreeId: string
  paneKey: string
  tabId: string
}> {
  await waitForSessionReady(page)
  await waitForActiveWorktree(page)
  await ensureTerminalVisible(page)
  await waitForActiveTerminalManager(page, 30_000)
  await waitForPaneCount(page, 1, 30_000)
  await enableGuiAgentWorkspace(page)
  const descriptor = await waitForActivePaneHookDescriptor(page)
  return {
    worktreeId: descriptor.worktreeId,
    paneKey: descriptor.paneKey,
    tabId: descriptor.paneKey.split(':')[0] ?? ''
  }
}

test.describe.configure({ mode: 'serial' })

test.describe('Agent workspace polish', () => {
  test('closes an agent thread from the workspace tab strip', async ({ orcaPage }) => {
    const { worktreeId, paneKey, tabId } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E close thread ${Date.now()}`

    await seedAgentWorkspaceThread(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Close this thread from the GUI'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    const threadTab = workspace.getByRole('tab', { name: new RegExp(threadTitle) })
    await expect(threadTab).toBeVisible()

    const tabsBefore = await getWorktreeTabs(orcaPage, worktreeId)
    await threadTab.getByRole('button', { name: 'Close thread', exact: true }).click()

    await expect(threadTab).not.toBeVisible()
    await expect
      .poll(async () => (await getWorktreeTabs(orcaPage, worktreeId)).map((tab) => tab.id))
      .not.toContain(tabId)
    expect(tabsBefore.some((tab) => tab.id === tabId)).toBe(true)
    await expect
      .poll(() =>
        orcaPage.evaluate(
          (targetPaneKey) =>
            window.__store?.getState().agentStatusByPaneKey[targetPaneKey] === undefined,
          paneKey
        )
      )
      .toBe(true)
  })

  test('sends an approve decision through the right panel', async ({ orcaPage, electronApp }) => {
    await installMainProcessPtyWriteSpy(electronApp)
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E approve thread ${Date.now()}`

    await seedAgentWorkspaceThread(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Approve the shell command',
      approval: {
        id: 'approval-e2e-approve',
        status: 'requested',
        title: 'Approve Bash',
        toolName: 'Bash',
        toolInput: 'pnpm test',
        fallbackText: 'Approve Bash: pnpm test'
      }
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)
    await waitForAgentRightPanelActions(orcaPage, 'Approve')

    await clearPtyWriteLog(electronApp)
    await agentWorkspaceRightPanel(orcaPage)
      .getByRole('button', { name: 'Approve', exact: true })
      .click()

    const drawer = orcaPage.locator('[data-agent-terminal-drawer="true"][data-state="open"]')
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveAttribute('aria-label', 'Terminal drawer')
    await expect(workspace.getByText(/Approval sent to the agent terminal/i)).toBeVisible()
    await expect
      .poll(async () => (await getPtyWrites(electronApp)).some((data) => data.includes('\r')))
      .toBe(true)
  })

  test('sends a deny decision through the right panel', async ({ orcaPage, electronApp }) => {
    await installMainProcessPtyWriteSpy(electronApp)
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E deny thread ${Date.now()}`

    await seedAgentWorkspaceThread(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Deny the shell command',
      approval: {
        id: 'approval-e2e-deny',
        status: 'requested',
        title: 'Approve Bash',
        toolName: 'Bash',
        toolInput: 'pnpm test',
        fallbackText: 'Approve Bash: pnpm test'
      }
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)
    await waitForAgentRightPanelActions(orcaPage, 'Deny')

    await clearPtyWriteLog(electronApp)
    await agentWorkspaceRightPanel(orcaPage)
      .getByRole('button', { name: 'Deny', exact: true })
      .click()

    const drawer = orcaPage.locator('[data-agent-terminal-drawer="true"][data-state="open"]')
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveAttribute('aria-label', 'Terminal drawer')
    await expect
      .poll(async () => (await getPtyWrites(electronApp)).some((data) => data.includes('n\r')), {
        timeout: 15_000
      })
      .toBe(true)
  })

  test('persists thinking mode across GUI workspace remount', async ({ orcaPage }) => {
    const { worktreeId } = await prepareGuiWorkspaceTerminal(orcaPage)
    const workspace = agentWorkspaceRegion(orcaPage)

    await workspace.getByRole('button', { name: 'Agent settings' }).click()
    await orcaPage.getByRole('option', { name: 'Set reasoning: High' }).click()
    await expect
      .poll(() =>
        orcaPage.evaluate(() => window.__store?.getState().settings.agentThinkingMode ?? null)
      )
      .toBe('deep')

    await orcaPage.evaluate(async () => {
      const store = window.__store
      if (!store) {
        throw new Error('window.__store is not available')
      }
      await store.getState().updateSettings({ guiAgentWorkspaceEnabled: false })
    })
    await expect(agentWorkspaceRegion(orcaPage)).not.toBeVisible()

    await orcaPage.evaluate(async (targetWorktreeId) => {
      const store = window.__store
      if (!store) {
        throw new Error('window.__store is not available')
      }
      await store.getState().updateSettings({ guiAgentWorkspaceEnabled: true })
      store.getState().setActiveWorktree(targetWorktreeId)
      store.getState().setActiveView('terminal')
    }, worktreeId)
    await expect(agentWorkspaceRegion(orcaPage)).toBeVisible({ timeout: 30_000 })
    await agentWorkspaceRegion(orcaPage).getByRole('button', { name: 'Agent settings' }).click()
    await expect(orcaPage.getByRole('option', { name: 'Set reasoning: High' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
