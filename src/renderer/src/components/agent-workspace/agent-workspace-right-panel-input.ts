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
  review
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  plan: AgentWorkspacePlan | null
  review: AgentWorkspaceReviewSummary | null
}): AgentWorkspaceRightPanelStateInput {
  return {
    thread,
    diffs,
    review,
    hasStructuredPlan: plan !== null
  }
}

export function getRightPanelStateInputKey({
  thread,
  diffs,
  review,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): string {
  return [
    thread?.id ?? 'no-thread',
    thread?.phase ?? 'no-phase',
    hasStructuredPlan ? 'plan' : 'no-plan',
    review?.id ?? 'no-review',
    diffs.map((diff) => diff.id).join(',')
  ].join(':')
}
