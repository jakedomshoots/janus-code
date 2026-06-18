import { describe, expect, it, afterEach } from 'vitest'
import {
  _resetAgentWorkspaceBrowserTabSessionForTest,
  clearTrackedAgentWorkspaceBrowserTabs,
  getAgentWorkspaceBrowserTabSessionRevision,
  isAgentWorkspaceBrowserTabTracked,
  listTrackedAgentWorkspaceBrowserTabIds,
  subscribeAgentWorkspaceBrowserTabSession,
  trackAgentWorkspaceBrowserTab,
  untrackAgentWorkspaceBrowserTab
} from './agent-workspace-browser-tab-session'

describe('agent-workspace-browser-tab-session', () => {
  afterEach(() => {
    _resetAgentWorkspaceBrowserTabSessionForTest()
  })

  it('tracks browser tabs opened from the agent workspace', () => {
    trackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')
    trackAgentWorkspaceBrowserTab('worktree-1', 'browser-b')

    expect(isAgentWorkspaceBrowserTabTracked('worktree-1', 'browser-a')).toBe(true)
    expect(listTrackedAgentWorkspaceBrowserTabIds('worktree-1')).toEqual(['browser-a', 'browser-b'])
  })

  it('untracks closed browser tabs and clears per-worktree state', () => {
    trackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')
    untrackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')

    expect(isAgentWorkspaceBrowserTabTracked('worktree-1', 'browser-a')).toBe(false)
    clearTrackedAgentWorkspaceBrowserTabs('worktree-1')
    expect(listTrackedAgentWorkspaceBrowserTabIds('worktree-1')).toEqual([])
  })

  it('notifies subscribers when tracked browser tabs change', () => {
    const revisions: number[] = []
    const unsubscribe = subscribeAgentWorkspaceBrowserTabSession(() => {
      revisions.push(getAgentWorkspaceBrowserTabSessionRevision())
    })

    trackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')
    trackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')
    untrackAgentWorkspaceBrowserTab('worktree-1', 'browser-a')
    unsubscribe()

    expect(revisions).toEqual([1, 2])
  })
})
