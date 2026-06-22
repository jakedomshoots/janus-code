import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

export type AgentWorkspaceRightPanelTab = 'plan' | 'diff' | 'review' | 'details'

export type AgentWorkspaceRightPanelState = {
  readonly selectedTab: AgentWorkspaceRightPanelTab
  readonly collapsed: boolean
}

export type AgentWorkspaceRightPanelStateInput = {
  readonly thread: AgentWorkspaceThread | null
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly review: AgentWorkspaceReviewSummary | null
  readonly hasReviewFindings?: boolean
  readonly hasStructuredPlan: boolean
}

export function getDefaultAgentWorkspaceRightPanelTab({
  thread,
  diffs,
  review,
  hasReviewFindings,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelTab {
  return getDefaultAgentWorkspaceRightPanelState({
    thread,
    diffs,
    review,
    hasReviewFindings,
    hasStructuredPlan
  }).selectedTab
}

export function getDefaultAgentWorkspaceRightPanelState({
  thread,
  diffs,
  review,
  hasReviewFindings,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelState {
  if (!thread) {
    return { selectedTab: 'details', collapsed: true }
  }
  if (thread.phase === 'needs-approval') {
    return { selectedTab: 'details', collapsed: false }
  }
  // Why: the chat is the primary surface; auxiliary evidence should stay tucked
  // away unless the run needs user action or the user opens the panel.
  if (diffs.length > 0) {
    return { selectedTab: 'diff', collapsed: true }
  }
  if (review || hasReviewFindings) {
    return { selectedTab: 'review', collapsed: true }
  }
  if (thread.phase === 'running' && hasStructuredPlan) {
    return { selectedTab: 'plan', collapsed: true }
  }
  return { selectedTab: 'details', collapsed: true }
}

export function coerceAgentWorkspaceRightPanelTab(
  value: string
): AgentWorkspaceRightPanelTab | null {
  switch (value) {
    case 'plan':
    case 'diff':
    case 'review':
    case 'details':
      return value
    default:
      return null
  }
}
