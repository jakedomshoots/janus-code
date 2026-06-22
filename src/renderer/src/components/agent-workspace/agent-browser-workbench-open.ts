import { translate } from '@/i18n/i18n'
import { getRuntimeEnvironmentIdForWorktree } from '@/lib/worktree-runtime-owner'
import { isWebRuntimeSessionActive } from '@/runtime/web-runtime-session'
import { useAppStore } from '@/store'
import { ORCA_BROWSER_BLANK_URL } from '../../../../shared/constants'
import type { BrowserWorkspace } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { isViableAgentBrowserTab, pruneStaleAgentBrowserTabs } from './agent-browser-workbench-tabs'
import {
  listTrackedAgentWorkspaceBrowserTabIds,
  trackAgentWorkspaceBrowserTab
} from './agent-workspace-browser-tab-session'
import { createAndActivateAgentBrowserTab } from './agent-browser-workbench-create'
import { openExistingAgentBrowserTab } from './agent-browser-workbench-existing'

export type AppStoreState = ReturnType<typeof useAppStore.getState>

export type OpenAgentBrowserWorkbenchOptions = {
  createNewTab?: boolean
  browserTabId?: string
  keepAgentSessionVisible?: boolean
}

export type OpenAgentBrowserWorkbenchParams = {
  readonly activeWorktreeId: string | null
  readonly browserWorkbenchActive: boolean
  readonly onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  readonly options?: OpenAgentBrowserWorkbenchOptions
  readonly createBrowserTab: AppStoreState['createBrowserTab']
  readonly closeBrowserTab: AppStoreState['closeBrowserTab']
  readonly createUnifiedTab: AppStoreState['createUnifiedTab']
  readonly activateTab: AppStoreState['activateTab']
  readonly setActiveBrowserTab: AppStoreState['setActiveBrowserTab']
  readonly setActiveTabType: AppStoreState['setActiveTabType']
  readonly focusBrowserTabInWorktree: AppStoreState['focusBrowserTabInWorktree']
  readonly openNewBrowserTabInActiveWorkspace: AppStoreState['openNewBrowserTabInActiveWorkspace']
}

function trackOpenedAgentWorkspaceBrowserTab(worktreeId: string, browserTabId: string): void {
  trackAgentWorkspaceBrowserTab(worktreeId, browserTabId)
}

function selectTrackedAgentBrowserTab(
  state: AppStoreState,
  worktreeId: string,
  webRuntimeActive: boolean
): BrowserWorkspace | null {
  const trackedIds = new Set(listTrackedAgentWorkspaceBrowserTabIds(worktreeId))
  if (trackedIds.size === 0) {
    return null
  }
  const tabs = state.browserTabsByWorktree[worktreeId] ?? []
  const viable = tabs.filter(
    (tab) => trackedIds.has(tab.id) && isViableAgentBrowserTab(state, tab, webRuntimeActive)
  )
  const activeBrowserTabId = state.activeBrowserTabIdByWorktree[worktreeId] ?? null
  if (activeBrowserTabId) {
    const activeTab = viable.find((tab) => tab.id === activeBrowserTabId)
    if (activeTab) {
      return activeTab
    }
  }
  return viable.at(-1) ?? null
}

function resolveTargetGroupId(worktreeId: string): string | undefined {
  const store = useAppStore.getState()
  store.ensureWorktreeRootGroup(worktreeId)
  const refreshed = useAppStore.getState()
  return (
    refreshed.activeGroupIdByWorktree[worktreeId] ?? refreshed.groupsByWorktree[worktreeId]?.[0]?.id
  )
}

export function openAgentBrowserWorkbench({
  activeWorktreeId,
  browserWorkbenchActive,
  onOpenTerminalDrawer,
  options,
  createBrowserTab,
  closeBrowserTab,
  createUnifiedTab,
  activateTab,
  setActiveBrowserTab,
  setActiveTabType,
  focusBrowserTabInWorktree,
  openNewBrowserTabInActiveWorkspace
}: OpenAgentBrowserWorkbenchParams): void {
  if (!activeWorktreeId) {
    return
  }
  void openAgentBrowserWorkbenchAsync({
    activeWorktreeId,
    browserWorkbenchActive,
    onOpenTerminalDrawer,
    options,
    createBrowserTab,
    closeBrowserTab,
    createUnifiedTab,
    activateTab,
    setActiveBrowserTab,
    setActiveTabType,
    focusBrowserTabInWorktree,
    openNewBrowserTabInActiveWorkspace
  })
}

async function openAgentBrowserWorkbenchAsync({
  activeWorktreeId: worktreeId,
  browserWorkbenchActive,
  onOpenTerminalDrawer,
  options,
  createBrowserTab,
  closeBrowserTab,
  createUnifiedTab,
  activateTab,
  setActiveBrowserTab,
  setActiveTabType,
  focusBrowserTabInWorktree,
  openNewBrowserTabInActiveWorkspace
}: OpenAgentBrowserWorkbenchParams & {
  readonly activeWorktreeId: string
}): Promise<void> {
  const createNewTab = options?.createNewTab === true
  const keepAgentSessionVisible = options?.keepAgentSessionVisible === true
  let state = useAppStore.getState()
  const runtimeEnvironmentId = getRuntimeEnvironmentIdForWorktree(state, worktreeId)
  const webRuntimeActive = isWebRuntimeSessionActive(runtimeEnvironmentId)
  if (webRuntimeActive && !runtimeEnvironmentId) {
    return
  }
  const resolvedRuntimeEnvironmentId = runtimeEnvironmentId ?? ''
  if (!createNewTab && !keepAgentSessionVisible && !browserWorkbenchActive) {
    onOpenTerminalDrawer?.('browser')
  }
  const targetGroupId = resolveTargetGroupId(worktreeId)
  if (!targetGroupId) {
    return
  }
  const defaultUrl = state.browserDefaultUrl ?? ORCA_BROWSER_BLANK_URL
  const newBrowserTabTitle = translate(
    'auto.components.agentWorkspace.composer.newBrowserTab',
    'New Browser Tab'
  )

  if (!createNewTab) {
    pruneStaleAgentBrowserTabs({ state, worktreeId, webRuntimeActive, closeBrowserTab })
    state = useAppStore.getState()
  }

  if (createNewTab) {
    await createAndActivateAgentBrowserTab({
      state,
      worktreeId,
      targetGroupId,
      runtimeEnvironmentId: resolvedRuntimeEnvironmentId,
      webRuntimeActive,
      defaultUrl,
      newBrowserTabTitle,
      keepAgentSessionVisible,
      createBrowserTab,
      createUnifiedTab,
      activateTab,
      setActiveBrowserTab,
      setActiveTabType,
      focusBrowserTabInWorktree,
      openNewBrowserTabInActiveWorkspace,
      onOpenTerminalDrawer,
      trackOpenedAgentWorkspaceBrowserTab
    })
    return
  }

  await openExistingAgentBrowserTab({
    state,
    worktreeId,
    targetGroupId,
    runtimeEnvironmentId: resolvedRuntimeEnvironmentId,
    webRuntimeActive,
    defaultUrl,
    newBrowserTabTitle,
    browserWorkbenchActive,
    browserTabId: options?.browserTabId,
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
  })
}
