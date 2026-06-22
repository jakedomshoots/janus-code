import { createWebRuntimeSessionBrowserTab } from '@/runtime/web-runtime-session'
import { useAppStore } from '@/store'
import type { BrowserWorkspace } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import {
  browserTabIsAssignedToGroup,
  consolidateAgentBrowserTabs,
  selectAgentBrowserTab
} from './agent-browser-workbench-tabs'
import { listTrackedAgentWorkspaceBrowserTabIds } from './agent-workspace-browser-tab-session'
import type { AppStoreState, OpenAgentBrowserWorkbenchParams } from './agent-browser-workbench-open'
import { activateAgentBrowserTab } from './agent-browser-workbench-activation'
import { isBlankBrowserUrl, shouldUseDevFakeProject } from '@/web/web-dev-fake-project'

export async function openExistingAgentBrowserTab({
  state,
  worktreeId,
  targetGroupId,
  runtimeEnvironmentId,
  webRuntimeActive,
  defaultUrl,
  newBrowserTabTitle,
  browserWorkbenchActive,
  browserTabId,
  createBrowserTab,
  closeBrowserTab,
  createUnifiedTab,
  activateTab,
  setActiveBrowserTab,
  setActiveTabType,
  focusBrowserTabInWorktree,
  onOpenTerminalDrawer,
  selectTrackedAgentBrowserTab,
  trackOpenedAgentWorkspaceBrowserTab
}: {
  state: AppStoreState
  worktreeId: string
  targetGroupId: string
  runtimeEnvironmentId: string
  webRuntimeActive: boolean
  defaultUrl: string
  newBrowserTabTitle: string
  browserWorkbenchActive: boolean
  browserTabId?: string
  selectTrackedAgentBrowserTab: (
    state: AppStoreState,
    worktreeId: string,
    webRuntimeActive: boolean
  ) => BrowserWorkspace | null
  trackOpenedAgentWorkspaceBrowserTab: (worktreeId: string, browserTabId: string) => void
} & Pick<
  OpenAgentBrowserWorkbenchParams,
  | 'createBrowserTab'
  | 'closeBrowserTab'
  | 'createUnifiedTab'
  | 'activateTab'
  | 'setActiveBrowserTab'
  | 'setActiveTabType'
  | 'focusBrowserTabInWorktree'
> & {
    onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  }): Promise<void> {
  let nextState = state
  const requestedBrowserTab = browserTabId
    ? ((nextState.browserTabsByWorktree[worktreeId] ?? []).find((tab) => tab.id === browserTabId) ??
      null)
    : null
  let browserTab =
    requestedBrowserTab ??
    selectTrackedAgentBrowserTab(nextState, worktreeId, webRuntimeActive) ??
    selectAgentBrowserTab(nextState, worktreeId, webRuntimeActive)

  if (
    browserTab &&
    listTrackedAgentWorkspaceBrowserTabIds(worktreeId).length === 0 &&
    !browserTabId
  ) {
    trackOpenedAgentWorkspaceBrowserTab(worktreeId, browserTab.id)
    consolidateAgentBrowserTabs({
      worktreeId,
      keepTabId: browserTab.id,
      readState: () => useAppStore.getState(),
      closeBrowserTab
    })
    nextState = useAppStore.getState()
    browserTab = selectAgentBrowserTab(nextState, worktreeId, webRuntimeActive)
  }

  if (browserWorkbenchActive && browserTab) {
    trackOpenedAgentWorkspaceBrowserTab(worktreeId, browserTab.id)
    activateExistingBrowserTab({
      worktreeId,
      browserTab,
      targetGroupId,
      activateTab,
      createUnifiedTab,
      setActiveBrowserTab,
      setActiveTabType,
      focusBrowserTabInWorktree
    })
    return
  }

  if (browserTab && !browserTabIsAssignedToGroup(nextState, worktreeId, browserTab.id)) {
    createUnifiedTab(worktreeId, 'browser', {
      entityId: browserTab.id,
      label: browserTab.title,
      targetGroupId,
      activate: true,
      insertAfterActiveTab: true
    })
    browserTab = selectAgentBrowserTab(useAppStore.getState(), worktreeId, webRuntimeActive)
  }

  if (!browserTab) {
    browserTab = await createFallbackBrowserTab({
      worktreeId,
      runtimeEnvironmentId,
      webRuntimeActive,
      defaultUrl,
      targetGroupId,
      newBrowserTabTitle,
      createBrowserTab
    })
  }

  if (!browserTab) {
    return
  }
  browserTab = ensureDevFakeBrowserTabHasUrl(browserTab, defaultUrl)
  trackOpenedAgentWorkspaceBrowserTab(worktreeId, browserTab.id)
  activateExistingBrowserTab({
    worktreeId,
    browserTab,
    targetGroupId,
    activateTab,
    createUnifiedTab,
    setActiveBrowserTab,
    setActiveTabType,
    focusBrowserTabInWorktree
  })
  onOpenTerminalDrawer?.('browser')
}

async function createFallbackBrowserTab({
  worktreeId,
  runtimeEnvironmentId,
  webRuntimeActive,
  defaultUrl,
  targetGroupId,
  newBrowserTabTitle,
  createBrowserTab
}: {
  worktreeId: string
  runtimeEnvironmentId: string
  webRuntimeActive: boolean
  defaultUrl: string
  targetGroupId: string
  newBrowserTabTitle: string
  createBrowserTab: AppStoreState['createBrowserTab']
}): Promise<BrowserWorkspace | null> {
  if (webRuntimeActive) {
    const created = await createWebRuntimeSessionBrowserTab({
      worktreeId,
      environmentId: runtimeEnvironmentId,
      url: defaultUrl,
      targetGroupId
    })
    if (created) {
      return selectAgentBrowserTab(useAppStore.getState(), worktreeId, webRuntimeActive)
    }
    return null
  }
  return createBrowserTab(worktreeId, defaultUrl, {
    title: newBrowserTabTitle,
    focusAddressBar: true,
    activate: true,
    targetGroupId
  })
}

function ensureDevFakeBrowserTabHasUrl(
  browserTab: BrowserWorkspace,
  defaultUrl: string
): BrowserWorkspace {
  if (!shouldUseDevFakeProject() || !isBlankBrowserUrl(browserTab.url)) {
    return browserTab
  }
  const pageId = browserTab.activePageId ?? browserTab.pageIds?.[0] ?? browserTab.id
  useAppStore.getState().setBrowserPageUrl(pageId, defaultUrl)
  return { ...browserTab, url: defaultUrl }
}

function activateExistingBrowserTab(params: Parameters<typeof activateAgentBrowserTab>[0]): void {
  activateAgentBrowserTab(params)
}
