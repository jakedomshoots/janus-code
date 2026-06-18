// Why: host-synced and persisted browser tabs must not populate the agent
// workspace strip until the user explicitly opens browser from that UI.
const trackedBrowserTabIdsByWorktree = new Map<string, Set<string>>()
const sessionListeners = new Set<() => void>()
let sessionRevision = 0

function getTrackedSet(worktreeId: string): Set<string> {
  let tracked = trackedBrowserTabIdsByWorktree.get(worktreeId)
  if (!tracked) {
    tracked = new Set()
    trackedBrowserTabIdsByWorktree.set(worktreeId, tracked)
  }
  return tracked
}

function notifyAgentWorkspaceBrowserTabSession(): void {
  sessionRevision += 1
  for (const listener of sessionListeners) {
    listener()
  }
}

export function subscribeAgentWorkspaceBrowserTabSession(listener: () => void): () => void {
  sessionListeners.add(listener)
  return () => {
    sessionListeners.delete(listener)
  }
}

export function getAgentWorkspaceBrowserTabSessionRevision(): number {
  return sessionRevision
}

export function trackAgentWorkspaceBrowserTab(worktreeId: string, browserTabId: string): void {
  const trimmedTabId = browserTabId.trim()
  if (!worktreeId.trim() || !trimmedTabId) {
    return
  }
  const tracked = getTrackedSet(worktreeId)
  if (tracked.has(trimmedTabId)) {
    return
  }
  tracked.add(trimmedTabId)
  notifyAgentWorkspaceBrowserTabSession()
}

export function untrackAgentWorkspaceBrowserTab(worktreeId: string, browserTabId: string): void {
  const trimmedTabId = browserTabId.trim()
  if (!worktreeId.trim() || !trimmedTabId) {
    return
  }
  const tracked = getTrackedSet(worktreeId)
  if (!tracked.delete(trimmedTabId)) {
    return
  }
  notifyAgentWorkspaceBrowserTabSession()
}

export function isAgentWorkspaceBrowserTabTracked(
  worktreeId: string,
  browserTabId: string
): boolean {
  return getTrackedSet(worktreeId).has(browserTabId)
}

export function listTrackedAgentWorkspaceBrowserTabIds(worktreeId: string): readonly string[] {
  return [...getTrackedSet(worktreeId)]
}

export function clearTrackedAgentWorkspaceBrowserTabs(worktreeId: string): void {
  if (!trackedBrowserTabIdsByWorktree.delete(worktreeId)) {
    return
  }
  notifyAgentWorkspaceBrowserTabSession()
}

export function _resetAgentWorkspaceBrowserTabSessionForTest(): void {
  trackedBrowserTabIdsByWorktree.clear()
  sessionRevision = 0
}
