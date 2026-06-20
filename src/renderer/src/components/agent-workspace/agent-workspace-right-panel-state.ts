import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

export type AgentWorkspaceRightPanelTab = 'plan' | 'diff' | 'review' | 'document' | 'details'

export type AgentWorkspaceRightPanelState = {
  readonly selectedTab: AgentWorkspaceRightPanelTab
  readonly collapsed: boolean
}

export type AgentWorkspaceRightPanelStateInput = {
  readonly thread: AgentWorkspaceThread | null
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly review: AgentWorkspaceReviewSummary | null
  readonly hasStructuredPlan: boolean
}

export function getDefaultAgentWorkspaceRightPanelTab({
  thread,
  diffs,
  review,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelTab {
  return getDefaultAgentWorkspaceRightPanelState({
    thread,
    diffs,
    review,
    hasStructuredPlan
  }).selectedTab
}

export function getDefaultAgentWorkspaceRightPanelState({
  thread,
  diffs,
  review,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelState {
  if (!thread) {
    return { selectedTab: 'details', collapsed: true }
  }
  if (thread.phase === 'needs-approval') {
    return { selectedTab: 'details', collapsed: false }
  }
  if (diffs.length > 0) {
    return { selectedTab: 'diff', collapsed: false }
  }
  if (review) {
    return { selectedTab: 'review', collapsed: false }
  }
  if (thread.phase === 'running' && hasStructuredPlan) {
    return { selectedTab: 'plan', collapsed: false }
  }
  return { selectedTab: 'details', collapsed: false }
}

export function coerceAgentWorkspaceRightPanelTab(
  value: string
): AgentWorkspaceRightPanelTab | null {
  switch (value) {
    case 'plan':
    case 'diff':
    case 'review':
    case 'document':
    case 'details':
      return value
    default:
      return null
  }
}
