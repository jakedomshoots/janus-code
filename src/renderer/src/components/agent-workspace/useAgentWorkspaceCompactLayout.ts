import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { useAppStore } from '@/store'
import { getAgentWorkspaceCompactSplitRatioUpdates } from './agent-workspace-compact-tab-layout'
import type { AgentWorkspaceRightPanelState } from './agent-workspace-right-panel-state'

export function useAgentWorkspaceCompactLayout({
  activeWorktreeId,
  compactViewport,
  focusedGroupId,
  setSelectedRightPanelState
}: {
  activeWorktreeId: string | null
  compactViewport: boolean
  focusedGroupId: string | null
  setSelectedRightPanelState: Dispatch<SetStateAction<AgentWorkspaceRightPanelState>>
}): void {
  const previousCompactViewportRef = useRef(compactViewport)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const setRightSidebarOpen = useAppStore((state) => state.setRightSidebarOpen)
  const setTabGroupSplitRatio = useAppStore((state) => state.setTabGroupSplitRatio)

  useEffect(() => {
    const enteredCompactViewport = compactViewport && !previousCompactViewportRef.current
    previousCompactViewportRef.current = compactViewport
    if (!enteredCompactViewport) {
      return
    }
    // Why: below the mobile-like breakpoint, the evidence panel leaves too
    // little room for the active chat; collapse once and let explicit re-open win.
    setSelectedRightPanelState((current) =>
      current.collapsed ? current : { ...current, collapsed: true }
    )
  }, [compactViewport, setSelectedRightPanelState])

  useEffect(() => {
    if (!compactViewport || !activeWorktreeId) {
      return
    }

    // Why: compact agent workspaces are often hosted in split tab groups with
    // global sidebars restored; reclaim the chrome once, then explicit reopen wins.
    setSidebarOpen(false)
    setRightSidebarOpen(false)

    const state = useAppStore.getState()
    const updates = getAgentWorkspaceCompactSplitRatioUpdates({
      layout: state.layoutByWorktree?.[activeWorktreeId],
      targetGroupId: focusedGroupId
    })
    for (const update of updates) {
      setTabGroupSplitRatio(activeWorktreeId, update.nodePath, update.ratio)
    }
  }, [
    activeWorktreeId,
    compactViewport,
    focusedGroupId,
    setRightSidebarOpen,
    setSidebarOpen,
    setTabGroupSplitRatio
  ])
}
