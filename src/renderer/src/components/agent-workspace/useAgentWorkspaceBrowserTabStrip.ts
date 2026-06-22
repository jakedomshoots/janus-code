import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { getBrowserTabLabel } from '@/components/tab-bar/BrowserTab'
import {
  useTabGroupWorkspaceModel,
  type GroupBrowserItem
} from '@/components/tab-group/useTabGroupWorkspaceModel'
import { useAppStore } from '@/store'
import {
  getAgentWorkspaceBrowserTabSessionRevision,
  isAgentWorkspaceBrowserTabTracked,
  listTrackedAgentWorkspaceBrowserTabIds,
  subscribeAgentWorkspaceBrowserTabSession,
  untrackAgentWorkspaceBrowserTab
} from './agent-workspace-browser-tab-session'
import { sortUnifiedTabsByGroupOrder } from './agent-workspace-group-tab-order'
import { resolveAgentBrowserPageId } from './agent-browser-workbench-tabs'

export type AgentWorkspaceBrowserTabEntry = {
  id: string
  label: string
  tab: GroupBrowserItem
}

export function useAgentWorkspaceBrowserTabStrip({
  worktreeId,
  groupId,
  browserWorkbenchActive,
  onOpenBrowserWorkbench,
  onDismissWorkbenchSurface
}: {
  worktreeId: string | null
  groupId: string | null
  browserWorkbenchActive: boolean
  onOpenBrowserWorkbench: (options?: {
    createNewTab?: boolean
    browserTabId?: string
    keepAgentSessionVisible?: boolean
  }) => void
  onDismissWorkbenchSurface: () => void
}): {
  browserTabs: readonly AgentWorkspaceBrowserTabEntry[]
  activeBrowserTabId: string | null
  selectBrowserTab: (browserTabId: string) => void
  createBrowserTab: () => void
  closeBrowserTab: (browserTabId: string) => void
} {
  const resolvedWorktreeId = worktreeId ?? ''
  const resolvedGroupId = groupId ?? ''
  const model = useTabGroupWorkspaceModel({
    worktreeId: resolvedWorktreeId,
    groupId: resolvedGroupId
  })
  const storeActiveBrowserTabId = useAppStore((state) =>
    worktreeId ? (state.activeBrowserTabIdByWorktree[worktreeId] ?? null) : null
  )
  const focusBrowserTabInWorktree = useAppStore((state) => state.focusBrowserTabInWorktree)
  const closeBrowserTabInStore = useAppStore((state) => state.closeBrowserTab)
  useSyncExternalStore(
    subscribeAgentWorkspaceBrowserTabSession,
    getAgentWorkspaceBrowserTabSessionRevision,
    getAgentWorkspaceBrowserTabSessionRevision
  )

  const browserTabs = useMemo<readonly AgentWorkspaceBrowserTabEntry[]>(() => {
    if (!worktreeId || !groupId) {
      return []
    }
    const browserUnifiedTabs = sortUnifiedTabsByGroupOrder(
      model.groupTabs.filter((tab) => tab.contentType === 'browser'),
      model.group?.tabOrder ?? []
    )
    const browserById = new Map(model.browserItems.map((tab) => [tab.id, tab]))
    const orderedBrowserTabIds: string[] = []
    for (const unifiedTab of browserUnifiedTabs) {
      if (
        isAgentWorkspaceBrowserTabTracked(worktreeId, unifiedTab.entityId) &&
        !orderedBrowserTabIds.includes(unifiedTab.entityId)
      ) {
        orderedBrowserTabIds.push(unifiedTab.entityId)
      }
    }
    for (const browserTabId of listTrackedAgentWorkspaceBrowserTabIds(worktreeId)) {
      if (!orderedBrowserTabIds.includes(browserTabId) && browserById.has(browserTabId)) {
        orderedBrowserTabIds.push(browserTabId)
      }
    }
    return orderedBrowserTabIds
      .map((browserTabId) => {
        const tab = browserById.get(browserTabId)
        if (!tab) {
          return null
        }
        return {
          id: tab.id,
          label: getBrowserTabLabel(tab),
          tab
        }
      })
      .filter((entry): entry is AgentWorkspaceBrowserTabEntry => entry !== null)
  }, [groupId, model.browserItems, model.group?.tabOrder, model.groupTabs, worktreeId])

  const activeBrowserTabId = browserWorkbenchActive
    ? ((model.activeTab?.contentType === 'browser' ? model.activeTab.entityId : null) ??
      storeActiveBrowserTabId ??
      browserTabs[0]?.id ??
      null)
    : null

  const selectBrowserTab = useCallback(
    (browserTabId: string) => {
      if (!worktreeId || !groupId) {
        return
      }
      model.commands.activateBrowser(browserTabId)
      if (!browserWorkbenchActive) {
        onOpenBrowserWorkbench({ browserTabId })
        return
      }
      const browserTab = model.browserItems.find((tab) => tab.id === browserTabId)
      const browserPageId = browserTab
        ? resolveAgentBrowserPageId(useAppStore.getState(), browserTab)
        : browserTabId
      focusBrowserTabInWorktree(worktreeId, browserPageId, { surfacePane: true })
    },
    [
      browserWorkbenchActive,
      focusBrowserTabInWorktree,
      groupId,
      model.browserItems,
      model.commands,
      onOpenBrowserWorkbench,
      worktreeId
    ]
  )

  const createBrowserTab = useCallback(() => {
    if (!worktreeId || !groupId) {
      return
    }
    onOpenBrowserWorkbench({
      createNewTab: true,
      keepAgentSessionVisible: false
    })
  }, [groupId, onOpenBrowserWorkbench, worktreeId])

  const closeBrowserTab = useCallback(
    (browserTabId: string) => {
      if (!worktreeId || !groupId) {
        return
      }
      const remainingBrowserTabs = browserTabs.filter((tab) => tab.id !== browserTabId)
      const unifiedTab =
        model.groupTabs.find(
          (candidate) => candidate.entityId === browserTabId && candidate.contentType === 'browser'
        ) ??
        (useAppStore.getState().unifiedTabsByWorktree[worktreeId] ?? []).find(
          (candidate) => candidate.entityId === browserTabId && candidate.contentType === 'browser'
        )
      if (unifiedTab) {
        model.commands.closeItem(unifiedTab.id)
      } else {
        closeBrowserTabInStore(browserTabId)
      }
      untrackAgentWorkspaceBrowserTab(worktreeId, browserTabId)
      if (remainingBrowserTabs.length === 0) {
        onDismissWorkbenchSurface()
        return
      }
      if (browserWorkbenchActive && browserTabId === activeBrowserTabId) {
        selectBrowserTab(remainingBrowserTabs[0]?.id ?? browserTabId)
      }
    },
    [
      activeBrowserTabId,
      browserTabs,
      browserWorkbenchActive,
      closeBrowserTabInStore,
      groupId,
      model.commands,
      model.groupTabs,
      onDismissWorkbenchSurface,
      selectBrowserTab,
      worktreeId
    ]
  )

  return {
    browserTabs,
    activeBrowserTabId,
    selectBrowserTab,
    createBrowserTab,
    closeBrowserTab
  }
}
