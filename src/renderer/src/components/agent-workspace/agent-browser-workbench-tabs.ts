import type { AppState } from '@/store'
import type { BrowserWorkspace } from '../../../../shared/types'
import { resolveLiveBrowserPageId } from '../browser-pane/browser-live-page-resolution'
import { isAgentWorkspaceBrowserTabTracked } from './agent-workspace-browser-tab-session'

function listWorktreeBrowserTabs(state: AppState, worktreeId: string): readonly BrowserWorkspace[] {
  return state.browserTabsByWorktree[worktreeId] ?? []
}

export function browserTabHasWebRemoteHandle(
  state: AppState,
  browserTab: BrowserWorkspace
): boolean {
  const pageId = resolveAgentBrowserPageId(state, browserTab)
  return Boolean(state.remoteBrowserPageHandlesByPageId[pageId]?.remotePageId)
}

export function resolveAgentBrowserPageId(state: AppState, browserTab: BrowserWorkspace): string {
  return resolveLiveBrowserPageId({
    browserTab,
    browserPages: state.browserPagesByWorkspace?.[browserTab.id] ?? []
  })
}

export function browserTabIsAssignedToGroup(
  state: AppState,
  worktreeId: string,
  browserTabId: string
): boolean {
  return (state.unifiedTabsByWorktree[worktreeId] ?? []).some(
    (tab) => tab.contentType === 'browser' && tab.entityId === browserTabId
  )
}

export function isViableAgentBrowserTab(
  state: AppState,
  browserTab: BrowserWorkspace,
  webRuntimeActive: boolean
): boolean {
  if (!webRuntimeActive) {
    return true
  }
  return browserTabHasWebRemoteHandle(state, browserTab)
}

export function selectNewestAssignedAgentBrowserTab(
  state: AppState,
  worktreeId: string,
  groupId: string,
  webRuntimeActive: boolean
): BrowserWorkspace | null {
  const group = (state.groupsByWorktree[worktreeId] ?? []).find((entry) => entry.id === groupId)
  if (!group) {
    return null
  }
  const browserById = new Map(
    listWorktreeBrowserTabs(state, worktreeId).map((tab) => [tab.id, tab] as const)
  )
  const unifiedById = new Map(
    (state.unifiedTabsByWorktree[worktreeId] ?? []).map((tab) => [tab.id, tab] as const)
  )
  for (let index = group.tabOrder.length - 1; index >= 0; index -= 1) {
    const unifiedTab = unifiedById.get(group.tabOrder[index] ?? '')
    if (!unifiedTab || unifiedTab.contentType !== 'browser' || unifiedTab.groupId !== groupId) {
      continue
    }
    const browserTab = browserById.get(unifiedTab.entityId)
    if (!browserTab || !isViableAgentBrowserTab(state, browserTab, webRuntimeActive)) {
      continue
    }
    return browserTab
  }
  return null
}

export function ensureBrowserUnifiedTabRegistered(args: {
  readState: () => AppState
  worktreeId: string
  browserTabId: string
  targetGroupId: string
  activate?: boolean
  createUnifiedTab: AppState['createUnifiedTab']
}): void {
  const state = args.readState()
  if (browserTabIsAssignedToGroup(state, args.worktreeId, args.browserTabId)) {
    return
  }
  const browserTab = listWorktreeBrowserTabs(state, args.worktreeId).find(
    (tab) => tab.id === args.browserTabId
  )
  if (!browserTab) {
    return
  }
  args.createUnifiedTab(args.worktreeId, 'browser', {
    entityId: args.browserTabId,
    label: browserTab.title,
    targetGroupId: args.targetGroupId,
    activate: args.activate ?? false,
    insertAfterActiveTab: true
  })
}

export function selectAgentBrowserTab(
  state: AppState,
  worktreeId: string,
  webRuntimeActive: boolean
): BrowserWorkspace | null {
  const tabs = listWorktreeBrowserTabs(state, worktreeId)
  const viable = tabs.filter((tab) => isViableAgentBrowserTab(state, tab, webRuntimeActive))
  if (viable.length === 0) {
    return null
  }

  const activeBrowserTabId = state.activeBrowserTabIdByWorktree[worktreeId] ?? null
  if (activeBrowserTabId) {
    const activeTab = viable.find((tab) => tab.id === activeBrowserTabId)
    if (activeTab) {
      return activeTab
    }
  }

  const assigned = viable.filter((tab) => browserTabIsAssignedToGroup(state, worktreeId, tab.id))
  return assigned.at(-1) ?? viable.at(-1) ?? null
}

export function pruneStaleAgentBrowserTabs(args: {
  state: AppState
  worktreeId: string
  webRuntimeActive: boolean
  closeBrowserTab: (tabId: string) => void
}): void {
  if (!args.webRuntimeActive) {
    return
  }
  for (const tab of listWorktreeBrowserTabs(args.state, args.worktreeId)) {
    if (isAgentWorkspaceBrowserTabTracked(args.worktreeId, tab.id)) {
      continue
    }
    if (!browserTabHasWebRemoteHandle(args.state, tab)) {
      args.closeBrowserTab(tab.id)
    }
  }
}

// Why: repeated agent-workbench opens during pairing/debugging can leave many
// host-local browser shells behind — keep one tab and discard the rest.
export function consolidateAgentBrowserTabs(args: {
  worktreeId: string
  keepTabId: string | null
  readState: () => AppState
  closeBrowserTab: (tabId: string) => void
}): void {
  for (const tab of listWorktreeBrowserTabs(args.readState(), args.worktreeId)) {
    if (tab.id !== args.keepTabId) {
      args.closeBrowserTab(tab.id)
    }
  }
}

// Why: focusBrowserTabInWorktree can no-op when page ids are not hydrated yet,
// leaving a simulator/editor tab active in the group while the browser workbench
// is already open — the simulator overlay then paints over the agent pane body.
export function ensureBrowserUnifiedTabActive(args: {
  readState: () => AppState
  worktreeId: string
  browserTabId: string
  targetGroupId: string | undefined
  activateTab: (tabId: string) => void
  createUnifiedTab: AppState['createUnifiedTab']
  setActiveBrowserTab: (tabId: string) => void
  setActiveTabType: (type: 'browser') => void
}): void {
  const state = args.readState()
  const browserTab = listWorktreeBrowserTabs(state, args.worktreeId).find(
    (tab) => tab.id === args.browserTabId
  )
  if (!browserTab) {
    return
  }

  let unifiedTab = (state.unifiedTabsByWorktree[args.worktreeId] ?? []).find(
    (tab) => tab.contentType === 'browser' && tab.entityId === args.browserTabId
  )
  if (!unifiedTab && args.targetGroupId) {
    unifiedTab = args.createUnifiedTab(args.worktreeId, 'browser', {
      entityId: args.browserTabId,
      label: browserTab.title,
      targetGroupId: args.targetGroupId,
      activate: true,
      insertAfterActiveTab: true
    })
  }
  if (!unifiedTab) {
    return
  }

  const group = (state.groupsByWorktree[args.worktreeId] ?? []).find(
    (candidate) => candidate.id === unifiedTab.groupId
  )
  if (group?.activeTabId !== unifiedTab.id) {
    args.activateTab(unifiedTab.id)
  }
  args.setActiveBrowserTab(args.browserTabId)
  args.setActiveTabType('browser')
}
