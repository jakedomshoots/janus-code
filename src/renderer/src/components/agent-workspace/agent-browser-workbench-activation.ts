import { useAppStore } from '@/store'
import type { BrowserWorkspace } from '../../../../shared/types'
import {
  ensureBrowserUnifiedTabActive,
  resolveAgentBrowserPageId,
  selectAgentBrowserTab,
  selectNewestAssignedAgentBrowserTab
} from './agent-browser-workbench-tabs'
import type { OpenAgentBrowserWorkbenchParams, AppStoreState } from './agent-browser-workbench-open'

export function selectNewlyOpenedBrowserTab(
  state: AppStoreState,
  worktreeId: string,
  beforeBrowserTabIds: ReadonlySet<string>,
  targetGroupId: string,
  webRuntimeActive: boolean
): BrowserWorkspace | null {
  return (
    (state.browserTabsByWorktree[worktreeId] ?? []).find(
      (tab) => !beforeBrowserTabIds.has(tab.id)
    ) ??
    selectNewestAssignedAgentBrowserTab(state, worktreeId, targetGroupId, webRuntimeActive) ??
    selectAgentBrowserTab(state, worktreeId, webRuntimeActive)
  )
}

export function activateAgentBrowserTab({
  worktreeId,
  browserTab,
  targetGroupId,
  activateTab,
  createUnifiedTab,
  setActiveBrowserTab,
  setActiveTabType,
  focusBrowserTabInWorktree
}: {
  worktreeId: string
  browserTab: BrowserWorkspace
  targetGroupId: string
} & Pick<
  OpenAgentBrowserWorkbenchParams,
  | 'activateTab'
  | 'createUnifiedTab'
  | 'setActiveBrowserTab'
  | 'setActiveTabType'
  | 'focusBrowserTabInWorktree'
>): void {
  const browserPageId = resolveAgentBrowserPageId(useAppStore.getState(), browserTab)
  focusBrowserTabInWorktree(worktreeId, browserPageId, { surfacePane: true })
  ensureBrowserUnifiedTabActive({
    readState: () => useAppStore.getState(),
    worktreeId,
    browserTabId: browserTab.id,
    targetGroupId,
    activateTab,
    createUnifiedTab,
    setActiveBrowserTab,
    setActiveTabType
  })
}
