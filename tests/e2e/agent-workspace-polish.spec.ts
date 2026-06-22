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

async function expectAgentWorkspaceControlsInViewport(page: Page): Promise<void> {
  const clippedControls = await agentWorkspaceRegion(page).evaluate((region) => {
    const interactiveSelector = [
      'button',
      '[role="tab"]',
      '[role="textbox"]',
      'input',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')

    return Array.from(region.querySelectorAll<HTMLElement>(interactiveSelector)).flatMap(
      (element) => {
        const style = window.getComputedStyle(element)
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          element.getAttribute('aria-hidden') === 'true'
        ) {
          return []
        }

        const rect = element.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) {
          return []
        }

        const clipped =
          rect.left < -1 ||
          rect.top < -1 ||
          rect.right > window.innerWidth + 1 ||
          rect.bottom > window.innerHeight + 1

        if (!clipped) {
          return []
        }

        const label =
          element.getAttribute('aria-label') ??
          element.getAttribute('title') ??
          element.textContent ??
          element.tagName.toLowerCase()

        return [
          {
            label: label.trim().replace(/\s+/g, ' ').slice(0, 80),
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom)
          }
        ]
      }
    )
  })

  expect(clippedControls).toEqual([])
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

  test('keeps the run board, composer, and right panel usable at laptop size', async ({
    orcaPage
  }) => {
    await orcaPage.setViewportSize({ width: 1280, height: 720 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E workspace audit ${Date.now()}`

    await seedAgentWorkspaceThread(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Audit the competitive workspace surface',
      approval: {
        id: 'approval-e2e-competitive-workspace',
        status: 'requested',
        title: 'Run verification',
        toolName: 'Bash',
        toolInput: 'pnpm run typecheck:web',
        fallbackText: 'Run verification: pnpm run typecheck:web'
      }
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)

    const runBoard = workspace.getByRole('region', { name: /Agent run board/i })
    await expect(runBoard).toBeVisible()
    await expect(runBoard.getByRole('button', { name: new RegExp(threadTitle) })).toBeVisible()
    await expect(workspace.getByRole('textbox', { name: /Message agent/i })).toBeVisible()

    const rightPanel = agentWorkspaceRightPanel(orcaPage)
    await expect(rightPanel).toBeVisible()
    const tabList = rightPanel.getByRole('tablist', { name: /Agent workspace right panel/i })
    await expect(tabList).toBeVisible()
    for (const label of ['Output', 'Changes', 'Review', 'Context']) {
      await expect(tabList.getByRole('tab', { name: new RegExp(label) })).toBeVisible()
    }
    await waitForAgentRightPanelActions(orcaPage, 'Approve')

    await expectAgentWorkspaceControlsInViewport(orcaPage)
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
