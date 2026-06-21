import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelState } from './agent-workspace-right-panel-state'
import { AgentWorkspaceMarkdownArtifactSidePanel } from './AgentWorkspaceMarkdownArtifactSidePanel'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'

export function AgentWorkspaceLayoutRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  review,
  selectedMarkdownArtifact,
  selectedRightPanelState,
  sourceControlActions,
  terminalAvailable,
  onCloseMarkdownArtifactPreview,
  onOpenMarkdownArtifactInEditor,
  onSelectedTabChange,
  onOpenSourceControl,
  onOpenProjectFiles,
  onOpenAgentSessions,
  onOpenDiff,
  onOpenTerminalDrawer
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  selectedMarkdownArtifact: AgentTimelineMarkdownArtifact | null
  selectedRightPanelState: AgentWorkspaceRightPanelState
  sourceControlActions: {
    sourceControlBusy: boolean
    sourceControlError: string | null
    onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
    onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
    onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
    onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
  }
  terminalAvailable: boolean
  onCloseMarkdownArtifactPreview: () => void
  onOpenMarkdownArtifactInEditor: (artifact: AgentTimelineMarkdownArtifact) => void
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelState['selectedTab']) => void
  onOpenSourceControl: () => void
  onOpenProjectFiles: () => void
  onOpenAgentSessions: () => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  return (
    <>
      {selectedMarkdownArtifact && selectedRightPanelState.selectedTab === 'document' ? (
        <AgentWorkspaceMarkdownArtifactSidePanel
          artifact={selectedMarkdownArtifact}
          thread={thread}
          onClose={onCloseMarkdownArtifactPreview}
          onOpenInEditor={onOpenMarkdownArtifactInEditor}
        />
      ) : null}
      {selectedRightPanelState.collapsed ||
      selectedRightPanelState.selectedTab === 'document' ? null : (
        <AgentWorkspaceRightPanel
          project={project}
          thread={thread}
          threads={threads}
          plan={plan}
          approval={approval}
          diffs={diffs}
          review={review}
          selectedMarkdownArtifact={selectedMarkdownArtifact}
          sourceControlBusy={sourceControlActions.sourceControlBusy}
          sourceControlError={sourceControlActions.sourceControlError}
          terminalAvailable={terminalAvailable}
          selectedTab={selectedRightPanelState.selectedTab}
          onSelectedTabChange={onSelectedTabChange}
          onOpenSourceControl={onOpenSourceControl}
          onOpenProjectFiles={onOpenProjectFiles}
          onOpenAgentSessions={onOpenAgentSessions}
          onOpenDiff={onOpenDiff}
          onStageDiff={sourceControlActions.onStageDiff}
          onUnstageDiff={sourceControlActions.onUnstageDiff}
          onDiscardDiff={sourceControlActions.onDiscardDiff}
          onCommitStaged={sourceControlActions.onCommitStaged}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )}
    </>
  )
}
