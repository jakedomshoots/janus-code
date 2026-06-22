import { createWebRuntimeSessionBrowserTab } from '@/runtime/web-runtime-session'
import { useAppStore } from '@/store'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { ensureBrowserUnifiedTabRegistered } from './agent-browser-workbench-tabs'
import type { AppStoreState, OpenAgentBrowserWorkbenchParams } from './agent-browser-workbench-open'
import {
  activateAgentBrowserTab,
  selectNewlyOpenedBrowserTab
} from './agent-browser-workbench-activation'

export async function createAndActivateAgentBrowserTab({
  state,
  worktreeId,
  targetGroupId,
  runtimeEnvironmentId,
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
}: {
  state: AppStoreState
  worktreeId: string
  targetGroupId: string
  runtimeEnvironmentId: string
  webRuntimeActive: boolean
  defaultUrl: string
  newBrowserTabTitle: string
  keepAgentSessionVisible: boolean
  trackOpenedAgentWorkspaceBrowserTab: (worktreeId: string, browserTabId: string) => void
} & Pick<
  OpenAgentBrowserWorkbenchParams,
  | 'createBrowserTab'
  | 'createUnifiedTab'
  | 'activateTab'
  | 'setActiveBrowserTab'
  | 'setActiveTabType'
  | 'focusBrowserTabInWorktree'
  | 'openNewBrowserTabInActiveWorkspace'
> & {
    onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  }): Promise<void> {
  const beforeBrowserTabIds = new Set(
    (state.browserTabsByWorktree[worktreeId] ?? []).map((tab) => tab.id)
  )
  await openNewBrowserTabInActiveWorkspace(targetGroupId, {
    activate: !keepAgentSessionVisible,
    worktreeId
  })
  let nextState = useAppStore.getState()
  let browserTab = selectNewlyOpenedBrowserTab(
    nextState,
    worktreeId,
    beforeBrowserTabIds,
    targetGroupId,
    webRuntimeActive
  )

  if (!browserTab && webRuntimeActive) {
    const created = await createWebRuntimeSessionBrowserTab({
      worktreeId,
      environmentId: runtimeEnvironmentId,
      url: defaultUrl,
      targetGroupId,
      activate: !keepAgentSessionVisible
    })
    if (created) {
      nextState = useAppStore.getState()
      browserTab = selectNewlyOpenedBrowserTab(
        nextState,
        worktreeId,
        beforeBrowserTabIds,
        targetGroupId,
        webRuntimeActive
      )
    }
  }

  if (!browserTab && !webRuntimeActive) {
    browserTab = createBrowserTab(worktreeId, defaultUrl, {
      title: newBrowserTabTitle,
      focusAddressBar: !keepAgentSessionVisible,
      activate: !keepAgentSessionVisible,
      targetGroupId
    })
  }

  if (!browserTab) {
    return
  }
  trackOpenedAgentWorkspaceBrowserTab(worktreeId, browserTab.id)
  ensureBrowserUnifiedTabRegistered({
    readState: () => useAppStore.getState(),
    worktreeId,
    browserTabId: browserTab.id,
    targetGroupId,
    activate: !keepAgentSessionVisible,
    createUnifiedTab
  })
  if (!keepAgentSessionVisible) {
    activateAgentBrowserTab({
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
}
