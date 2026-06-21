import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelStateInput } from './agent-workspace-right-panel-state'

export function getRightPanelStateInput({
  thread,
  diffs,
  plan,
  review,
  reviewFindingCount = 0
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  plan: AgentWorkspacePlan | null
  review: AgentWorkspaceReviewSummary | null
  reviewFindingCount?: number
}): AgentWorkspaceRightPanelStateInput {
  return {
    thread,
    diffs,
    review,
    hasReviewFindings: reviewFindingCount > 0,
    hasStructuredPlan: plan !== null
  }
}

export function getRightPanelStateInputKey({
  thread,
  diffs,
  review,
  hasReviewFindings,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): string {
  return [
    thread?.id ?? 'no-thread',
    thread?.phase ?? 'no-phase',
    hasStructuredPlan ? 'plan' : 'no-plan',
    review?.id ?? 'no-review',
    hasReviewFindings ? 'review-findings' : 'no-review-findings',
    diffs.map((diff) => diff.id).join(',')
  ].join(':')
}
