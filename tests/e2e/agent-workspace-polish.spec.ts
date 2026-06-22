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
  seedAgentWorkspaceReviewSourceControlState,
  seedAgentWorkspaceThread,
  selectAgentThreadTab
} from './helpers/agent-workspace'
import { seedAgentWorkspaceComposerDepthState } from './helpers/agent-workspace-composer-depth-seed'
import { seedAgentWorkspaceCompareState } from './helpers/agent-workspace-compare-seed'
import { seedAgentWorkspaceFailureEmptyState } from './helpers/agent-workspace-failure-empty-seed'
import { seedAgentWorkspacePlanEvidenceState } from './helpers/agent-workspace-plan-evidence-seed'
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

    function isOutsideScrollableViewport(element: HTMLElement, rect: DOMRect): boolean {
      let ancestor = element.parentElement
      while (ancestor && ancestor !== region.parentElement) {
        const style = window.getComputedStyle(ancestor)
        const ancestorRect = ancestor.getBoundingClientRect()
        const scrollsX = style.overflowX === 'auto' || style.overflowX === 'scroll'
        const scrollsY = style.overflowY === 'auto' || style.overflowY === 'scroll'

        if (
          (scrollsX &&
            (rect.right <= ancestorRect.left + 1 || rect.left >= ancestorRect.right - 1)) ||
          (scrollsY && (rect.bottom <= ancestorRect.top + 1 || rect.top >= ancestorRect.bottom - 1))
        ) {
          return true
        }

        if (ancestor === region) {
          break
        }
        ancestor = ancestor.parentElement
      }

      return false
    }

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

        if (isOutsideScrollableViewport(element, rect)) {
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

async function expectAgentWorkspaceShellsWithoutHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await agentWorkspaceRegion(page)
    .locator('.agent-composer-shell, .agent-workspace-right-panel-shell')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const delta = element.scrollWidth - element.clientWidth
        if (delta <= 1) {
          return []
        }

        return [
          {
            className: element.className,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          }
        ]
      })
    )

  expect(overflow).toEqual([])
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

  test('keeps review-only and source-control actions usable at laptop size', async ({
    orcaPage
  }) => {
    await orcaPage.setViewportSize({ width: 1280, height: 720 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E review workspace ${Date.now()}`

    const seededSourceControl = await seedAgentWorkspaceReviewSourceControlState(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Review the current source-control changes'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)

    const rightPanel = agentWorkspaceRightPanel(orcaPage)
    const tabList = rightPanel.getByRole('tablist', { name: /Agent workspace right panel/i })
    await expect(tabList.getByRole('tab', { name: /Changes/i })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: /Review/i })).toBeVisible()

    await tabList.getByRole('tab', { name: /Changes/i }).click()
    const changesPanel = rightPanel.locator('section[aria-label="Changes"]')
    await expect(changesPanel.getByText('2 changes')).toBeVisible()
    await expect(rightPanel.getByText(seededSourceControl.stagedFilePath)).toBeVisible()
    await rightPanel.getByRole('button', { name: /src\/index\.ts/i }).click()
    await expect(rightPanel.getByText(seededSourceControl.unstagedFilePath)).toBeVisible()
    await expect(rightPanel.getByRole('button', { name: /Review only/i })).toBeVisible()
    await expect(rightPanel.getByRole('button', { name: /^Stage$/i })).toBeVisible()
    await expect(rightPanel.getByRole('button', { name: /^Discard$/i })).toBeVisible()
    await expect(rightPanel.getByRole('textbox', { name: /Commit message/i })).toBeVisible()
    await expect(rightPanel.getByRole('button', { name: /^Commit$/i })).toBeDisabled()

    await tabList.getByRole('tab', { name: /Review/i }).click()
    await expect(rightPanel.getByText('Tighten workspace context')).toBeVisible()
    await expect(rightPanel.getByText(/GitLab #42/i)).toBeVisible()
    await expect(rightPanel.getByRole('button', { name: /Review only/i })).toBeVisible()

    await expectAgentWorkspaceControlsInViewport(orcaPage)
  })

  test('keeps plan, replay, and risk evidence usable at smaller desktop size', async ({
    orcaPage
  }) => {
    await orcaPage.setViewportSize({ width: 1100, height: 640 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E evidence workspace ${Date.now()}`

    await seedAgentWorkspacePlanEvidenceState(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Verify the risky deployment evidence'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)

    const rightPanel = agentWorkspaceRightPanel(orcaPage)
    const tabList = rightPanel.getByRole('tablist', { name: /Agent workspace right panel/i })

    await tabList.getByRole('tab', { name: /Output/i }).click()
    const planProgress = rightPanel.locator('section').filter({ hasText: 'Plan progress' })
    await expect(planProgress.getByText('Plan progress')).toBeVisible()
    await expect(planProgress.getByText('1/3', { exact: true })).toBeVisible()
    await expect(rightPanel.getByText(/Now: Verify the run ledger/i)).toBeVisible()

    await tabList.getByRole('tab', { name: /Context/i }).click()
    await expect(rightPanel.getByText(/kubectl apply -f prod\/deploy\.yaml/i).first()).toBeVisible()
    await expect(rightPanel.getByText(/High risk/i).first()).toBeVisible()
    await expect(rightPanel.getByText(/Deploy/i).first()).toBeVisible()
    await expect(rightPanel.getByText(/Protected\s+·\s+Production deploys/i).first()).toBeVisible()

    const replayExport = rightPanel.locator('section[aria-label="Run replay export"]')
    await expect(replayExport.getByRole('button', { name: /Copy replay/i })).toBeVisible()
    await replayExport.getByRole('button', { name: /Copy replay/i }).click()
    await expect(replayExport.getByText('Replay copied.')).toBeVisible()

    const runLedger = rightPanel.locator('section[aria-label="Run ledger"]')
    await runLedger.scrollIntoViewIfNeeded()
    await rightPanel.locator('.scrollbar-sleek').evaluate((scrollArea) => {
      scrollArea.scrollTop += 160
    })
    await expect(runLedger.getByText('Verification running')).toBeVisible()
    await expect(runLedger.getByText('Partial telemetry').first()).toBeVisible()
    await expect(runLedger.getByText('Changed files')).toBeVisible()

    await expectAgentWorkspaceControlsInViewport(orcaPage)
  })

  test('keeps best-of-n compare usable across worktrees below 1100px', async ({ orcaPage }) => {
    await orcaPage.setViewportSize({ width: 1024, height: 640 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const seededCompare = await seedAgentWorkspaceCompareState(orcaPage, {
      paneKey,
      worktreeId,
      titlePrefix: 'E2E compare'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })

    const compare = workspace.getByRole('region', { name: /Best-of-N compare/i })
    await expect(compare).toBeVisible()
    await expect(compare.getByText('1 groups')).toBeVisible()
    await expect(compare.getByText('2 attempts')).toBeVisible()
    await expect(compare.getByText(seededCompare.activeTitle)).toBeVisible()
    await expect(compare.getByText(seededCompare.challengerTitle)).toBeVisible()
    await expect(compare.getByText('Verification passed').first()).toBeVisible()
    await expect(compare.getByText('Verification failed').first()).toBeVisible()
    await expect(compare.getByText(/1 file/).first()).toBeVisible()

    const selectActiveWinner = compare.getByRole('button', {
      name: `Select winner: ${seededCompare.activeTitle}`
    })
    await selectActiveWinner.click()
    await expect(selectActiveWinner).toHaveAttribute('aria-pressed', 'true')

    await compare
      .getByRole('button', { name: `Open attempt: ${seededCompare.challengerTitle}` })
      .click()
    await expect
      .poll(() => orcaPage.evaluate(() => window.__store?.getState().activeWorktreeId ?? null))
      .toBe(seededCompare.challengerWorktreeId)
    await expect(
      workspace.getByRole('tab', { name: new RegExp(seededCompare.challengerTitle) })
    ).toBeVisible()

    await expectAgentWorkspaceControlsInViewport(orcaPage)
  })

  test('keeps composer context, queue, provider, voice, and memory states usable below 1024px', async ({
    orcaPage
  }) => {
    await orcaPage.setViewportSize({ width: 960, height: 620 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E composer depth ${Date.now()}`

    await seedAgentWorkspaceComposerDepthState(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Keep composer states usable at compact width'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)

    const composer = workspace.getByRole('form', { name: /Agent chat composer/i })
    const messageBox = composer.getByRole('textbox', { name: /Message agent/i })
    await messageBox.fill('Queue this after the running command finishes.')
    await composer.getByRole('button', { name: 'Send', exact: true }).click()
    await expect(composer.getByText('Queued follow-up.')).toBeVisible()
    await expect(composer.getByRole('textbox', { name: /Queued follow-up message/i })).toBeVisible()
    await expect(composer.getByRole('button', { name: /Delete queued follow-up/i })).toBeVisible()

    const rightPanel = agentWorkspaceRightPanel(orcaPage)
    const tabList = rightPanel.getByRole('tablist', { name: /Agent workspace right panel/i })
    await tabList.getByRole('tab', { name: /Context/i }).click()
    const memoryInspector = rightPanel.locator('section[aria-label="Memory inspector"]')
    await memoryInspector.scrollIntoViewIfNeeded()
    await expect(memoryInspector.getByText('Janus resource snapshot')).toBeVisible()
    await expect(memoryInspector.getByText('Workspace sessions')).toBeVisible()
    await expect(memoryInspector.getByText('Agent memory not observed')).toBeVisible()

    await composer.getByRole('button', { name: /Delete queued follow-up/i }).click()
    await workspace.getByRole('button', { name: /New session/i }).click()
    await expect(composer.getByRole('button', { name: 'Send', exact: true })).toBeDisabled()
    await expect(
      composer.getByRole('button', { name: /Configure dictation in Settings > Voice/i })
    ).toBeDisabled()
    await composer.getByRole('button', { name: /Agent settings/i }).click()
    await expect(orcaPage.getByText('Reasoning')).toBeVisible()
    await orcaPage.getByLabel('Open provider menu').click()
    await expect(orcaPage.getByRole('option', { name: /Set agent provider: Codex/i })).toBeVisible()
    await orcaPage.getByRole('option', { name: /Set agent provider: Claude/i }).click()
    await expect(composer.getByRole('button', { name: /Agent settings/i })).toContainText('Claude')
    await composer
      .getByRole('textbox', { name: /Verification command/i })
      .fill('pnpm run typecheck:web')
    await messageBox.fill('Use the workspace context and memory command.')
    const contextTray = composer.getByLabel(/Prompt context/i)
    await expect(contextTray).toBeVisible()
    await expect(contextTray.getByText('Workspace', { exact: true })).toBeVisible()
    await expect(contextTray.getByText('Verification', { exact: true })).toBeVisible()
    await expect(contextTray.getByText('Agent memory', { exact: true })).toBeVisible()
    await expect(
      composer.getByRole('button', { name: /Remove verification context/i })
    ).toBeVisible()

    await expectAgentWorkspaceControlsInViewport(orcaPage)
    await expectAgentWorkspaceShellsWithoutHorizontalOverflow(orcaPage)
  })

  test('keeps failed run evidence and empty right-panel states usable at compact height', async ({
    orcaPage
  }) => {
    await orcaPage.setViewportSize({ width: 900, height: 560 })
    const { worktreeId, paneKey } = await prepareGuiWorkspaceTerminal(orcaPage)
    const threadTitle = `E2E failed empty ${Date.now()}`

    await seedAgentWorkspaceFailureEmptyState(orcaPage, {
      paneKey,
      worktreeId,
      title: threadTitle,
      prompt: 'Show failed and empty states clearly'
    })

    const workspace = agentWorkspaceRegion(orcaPage)
    await expect(workspace).toBeVisible({ timeout: 30_000 })
    await expect(workspace.getByRole('tab', { name: new RegExp(threadTitle) })).toBeVisible()
    await selectAgentThreadTab(orcaPage, threadTitle)

    const rightPanel = agentWorkspaceRightPanel(orcaPage)
    const tabList = rightPanel.getByRole('tablist', { name: /Agent workspace right panel/i })

    await tabList.getByRole('tab', { name: /Changes/i }).click()
    await expect(rightPanel.getByText('No changes', { exact: true })).toBeVisible()
    await expect(
      rightPanel.getByText('Git changes from Janus Code source control will appear here.')
    ).toBeVisible()

    await tabList.getByRole('tab', { name: /Review/i }).click()
    await expect(rightPanel.getByText('No review yet')).toBeVisible()

    await tabList.getByRole('tab', { name: /Context/i }).click()
    const runLedger = rightPanel.locator('section[aria-label="Run ledger"]')
    await expect(runLedger.getByText('Verification failed', { exact: true })).toBeVisible()
    await expect(runLedger.getByText('Failure', { exact: true })).toBeVisible()
    await expect(runLedger.getByText('Runtime (runtime-old-server, linux)')).toBeVisible()
    await expect(runLedger.getByText('Changed files')).toBeVisible()
    await expect(runLedger.getByText('0 files changed')).toBeVisible()
    await expect(runLedger.getByText('Partial telemetry').first()).toBeVisible()

    const memoryInspector = rightPanel.locator('section[aria-label="Memory inspector"]')
    await memoryInspector.scrollIntoViewIfNeeded()
    await expect(memoryInspector.getByText('Memory snapshot unavailable')).toBeVisible()
    await expect(memoryInspector.getByText('Resource daemon unavailable')).toBeVisible()
    await expect(memoryInspector.getByText('Agent memory not observed')).toBeVisible()

    await expectAgentWorkspaceControlsInViewport(orcaPage)
    await expectAgentWorkspaceShellsWithoutHorizontalOverflow(orcaPage)
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
