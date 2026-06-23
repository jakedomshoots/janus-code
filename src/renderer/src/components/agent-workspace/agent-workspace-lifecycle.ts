import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

export type AgentWorkspaceLifecycleId =
  | 'draft'
  | 'running'
  | 'needs-review'
  | 'changes-requested'
  | 'ready'
  | 'merged'
  | 'closed'

export type AgentWorkspaceLifecycleStepState = 'complete' | 'current' | 'upcoming'

export type AgentWorkspaceLifecycleStep = {
  readonly id: AgentWorkspaceLifecycleId
  readonly label: string
  readonly state: AgentWorkspaceLifecycleStepState
}

export type AgentWorkspaceLifecycle = {
  readonly current: AgentWorkspaceLifecycleId
  readonly currentLabel: string
  readonly detail: string
  readonly steps: readonly AgentWorkspaceLifecycleStep[]
}

const LIFECYCLE_ORDER: readonly AgentWorkspaceLifecycleId[] = [
  'draft',
  'running',
  'needs-review',
  'changes-requested',
  'ready',
  'merged',
  'closed'
]

export function resolveAgentWorkspaceLifecycle({
  thread,
  diffs,
  review
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentWorkspaceLifecycle {
  const current = getCurrentLifecycleId({ thread, diffs, review })
  const currentIndex = LIFECYCLE_ORDER.indexOf(current)
  return {
    current,
    currentLabel: getLifecycleLabel(current),
    detail: getLifecycleDetail({ current, thread, diffs, review }),
    steps: LIFECYCLE_ORDER.map((id, index) => ({
      id,
      label: getLifecycleLabel(id),
      state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'
    }))
  }
}

function getCurrentLifecycleId({
  thread,
  diffs,
  review
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentWorkspaceLifecycleId {
  if (!thread) {
    return 'draft'
  }
  if (review?.state === 'merged') {
    return 'merged'
  }
  if (review?.state === 'closed') {
    return 'closed'
  }
  if (review?.status === 'failure') {
    return 'changes-requested'
  }
  switch (thread.phase) {
    case 'idle':
    case 'starting':
      return 'draft'
    case 'running':
    case 'waiting-for-user':
    case 'needs-approval':
      return 'running'
    case 'completed':
      return diffs.length > 0 || review ? 'needs-review' : 'ready'
    case 'failed':
    case 'disconnected':
      return 'changes-requested'
  }
}

function getLifecycleLabel(id: AgentWorkspaceLifecycleId): string {
  switch (id) {
    case 'draft':
      return translate('auto.components.agentWorkspace.lifecycle.draft', 'Draft')
    case 'running':
      return translate('auto.components.agentWorkspace.lifecycle.running', 'Running')
    case 'needs-review':
      return translate('auto.components.agentWorkspace.lifecycle.needsReview', 'Needs review')
    case 'changes-requested':
      return translate(
        'auto.components.agentWorkspace.lifecycle.changesRequested',
        'Changes requested'
      )
    case 'ready':
      return translate('auto.components.agentWorkspace.lifecycle.ready', 'Ready')
    case 'merged':
      return translate('auto.components.agentWorkspace.lifecycle.merged', 'Merged')
    case 'closed':
      return translate('auto.components.agentWorkspace.lifecycle.closed', 'Closed')
  }
}

function getLifecycleDetail({
  current,
  thread,
  diffs,
  review
}: {
  current: AgentWorkspaceLifecycleId
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): string {
  if (!thread) {
    return translate(
      'auto.components.agentWorkspace.lifecycle.noThread',
      'Start or select a candidate to begin.'
    )
  }
  if (current === 'needs-review') {
    return diffs.length > 0
      ? translate(
          'auto.components.agentWorkspace.lifecycle.reviewChangedFiles',
          'Review {{count}} changed file before accepting the candidate.',
          { count: diffs.length }
        )
      : translate(
          'auto.components.agentWorkspace.lifecycle.reviewLinked',
          'Review the linked branch review before accepting the candidate.'
        )
  }
  if (current === 'changes-requested') {
    return review?.status === 'failure'
      ? translate(
          'auto.components.agentWorkspace.lifecycle.checksNeedAttention',
          'Checks or review feedback need attention.'
        )
      : translate(
          'auto.components.agentWorkspace.lifecycle.agentNeedsAttention',
          'The agent needs attention before this can continue.'
        )
  }
  if (current === 'running') {
    return translate(
      'auto.components.agentWorkspace.lifecycle.agentStillWorking',
      'The selected agent is still working or waiting for input.'
    )
  }
  return translate(
    'auto.components.agentWorkspace.lifecycle.currentState',
    'Current state: {{state}}.',
    { state: getLifecycleLabel(current) }
  )
}
