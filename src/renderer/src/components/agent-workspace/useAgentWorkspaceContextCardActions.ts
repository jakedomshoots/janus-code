import type { Dispatch, SetStateAction } from 'react'
import type { ActiveRightSidebarTab } from '@/store/slices/editor'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import type { AgentWorkspaceRightPanelState } from './agent-workspace-right-panel-state'

export function useAgentWorkspaceContextCardActions({
  setSelectedMarkdownArtifact,
  setSelectedRightPanelState,
  setRightSidebarOpen,
  setRightSidebarTab,
  showRightSidebarFiles
}: {
  setSelectedMarkdownArtifact: Dispatch<SetStateAction<AgentTimelineMarkdownArtifact | null>>
  setSelectedRightPanelState: Dispatch<SetStateAction<AgentWorkspaceRightPanelState>>
  setRightSidebarOpen: (open: boolean) => void
  setRightSidebarTab: (tab: ActiveRightSidebarTab) => void
  showRightSidebarFiles: () => void
}): {
  handleOpenSourceControlPanel: () => void
  handleOpenProjectFilesPanel: () => void
  handleOpenAgentSessionsPanel: () => void
} {
  function collapseFloatingContextCard(): void {
    setSelectedMarkdownArtifact(null)
    setSelectedRightPanelState((current) => ({
      ...current,
      collapsed: true
    }))
  }

  function handleOpenSourceControlPanel(): void {
    collapseFloatingContextCard()
    setRightSidebarTab('source-control')
    setRightSidebarOpen(true)
  }

  function handleOpenProjectFilesPanel(): void {
    collapseFloatingContextCard()
    showRightSidebarFiles()
  }

  function handleOpenAgentSessionsPanel(): void {
    collapseFloatingContextCard()
    setRightSidebarTab('vault')
    setRightSidebarOpen(true)
  }

  return {
    handleOpenSourceControlPanel,
    handleOpenProjectFilesPanel,
    handleOpenAgentSessionsPanel
  }
}
