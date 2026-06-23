import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

export type AgentWorkspaceCandidate = {
  readonly threadId: string
  readonly label: string
  readonly title: string
  readonly agentLabel: string
  readonly phaseLabel: string
  readonly selected: boolean
  readonly diffCount: number
  readonly changedLines: number
  readonly hasReview: boolean
  readonly score: number
}

export type AgentWorkspaceCandidatesModel = {
  readonly candidates: readonly AgentWorkspaceCandidate[]
  readonly recommendedCandidateId: string | null
  readonly recommendation: string
}

export function buildAgentWorkspaceCandidates({
  threads,
  selectedThreadId,
  diffs,
  reviews
}: {
  threads: readonly AgentWorkspaceThread[]
  selectedThreadId: string | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  reviews: readonly AgentWorkspaceReviewSummary[]
}): AgentWorkspaceCandidatesModel {
  const diffsByThreadId = groupDiffsByThreadId(diffs)
  const reviewsByWorktreeId = new Map(reviews.map((review) => [review.worktreeId, review]))
  const candidates = threads.map((thread, index) => {
    const threadDiffs = diffsByThreadId.get(thread.id) ?? []
    const changedLines = threadDiffs.reduce(
      (total, diff) => total + diff.additions + diff.deletions,
      0
    )
    const hasReview = reviewsByWorktreeId.has(thread.worktreeId)
    return {
      threadId: thread.id,
      label: getCandidateLabel(index),
      title: thread.title,
      agentLabel: formatAgentTypeLabel(thread.agentKind),
      phaseLabel: formatAgentWorkspacePhase(thread.phase),
      selected: thread.id === selectedThreadId,
      diffCount: threadDiffs.length,
      changedLines,
      hasReview,
      score: scoreCandidate({ thread, diffCount: threadDiffs.length, changedLines, hasReview })
    }
  })
  const recommended = getRecommendedCandidate(candidates)
  return {
    candidates,
    recommendedCandidateId: candidates.length > 1 ? (recommended?.threadId ?? null) : null,
    recommendation:
      candidates.length > 1 && recommended
        ? getRecommendationCopy(recommended)
        : translate(
            'auto.components.agentWorkspace.candidates.onlyOneCandidate',
            'Only one implementation candidate is available.'
          )
  }
}

function groupDiffsByThreadId(
  diffs: readonly AgentWorkspaceDiffSummary[]
): Map<string, AgentWorkspaceDiffSummary[]> {
  const grouped = new Map<string, AgentWorkspaceDiffSummary[]>()
  for (const diff of diffs) {
    const existing = grouped.get(diff.threadId) ?? []
    existing.push(diff)
    grouped.set(diff.threadId, existing)
  }
  return grouped
}

function getCandidateLabel(index: number): string {
  const letter = String.fromCharCode('A'.charCodeAt(0) + index)
  return translate(
    'auto.components.agentWorkspace.candidates.candidateLetter',
    'Candidate {{letter}}',
    {
      letter
    }
  )
}

function scoreCandidate({
  thread,
  diffCount,
  changedLines,
  hasReview
}: {
  thread: AgentWorkspaceThread
  diffCount: number
  changedLines: number
  hasReview: boolean
}): number {
  return (
    getPhaseScore(thread.phase) +
    (hasReview ? 8 : 0) +
    Math.min(diffCount, 8) +
    Math.min(Math.floor(changedLines / 20), 6)
  )
}

function getPhaseScore(phase: AgentWorkspaceThread['phase']): number {
  switch (phase) {
    case 'completed':
      return 40
    case 'running':
    case 'waiting-for-user':
      return 20
    case 'needs-approval':
      return 16
    case 'starting':
      return 12
    case 'idle':
      return 4
    case 'disconnected':
      return -20
    case 'failed':
      return -30
  }
}

function getRecommendedCandidate(
  candidates: readonly AgentWorkspaceCandidate[]
): AgentWorkspaceCandidate | null {
  return (
    [...candidates].sort((a, b) => {
      const scoreDiff = b.score - a.score
      return scoreDiff === 0 ? a.label.localeCompare(b.label) : scoreDiff
    })[0] ?? null
  )
}

function getRecommendationCopy(candidate: AgentWorkspaceCandidate): string {
  const signals: string[] = []
  if (candidate.phaseLabel === formatAgentWorkspacePhase('completed')) {
    signals.push(
      translate('auto.components.agentWorkspace.candidates.completedWork', 'completed work')
    )
  }
  if (candidate.hasReview) {
    signals.push(
      translate('auto.components.agentWorkspace.candidates.hostedReview', 'hosted review')
    )
  }
  if (candidate.diffCount > 0) {
    signals.push(
      candidate.diffCount === 1
        ? translate('auto.components.agentWorkspace.candidates.oneChangedFile', '1 changed file')
        : translate(
            'auto.components.agentWorkspace.candidates.changedFileCount',
            '{{count}} changed files',
            { count: candidate.diffCount }
          )
    )
  }
  return translate(
    'auto.components.agentWorkspace.candidates.suggestedFocus',
    'Suggested focus: {{candidate}} has {{signals}}.',
    {
      candidate: candidate.label,
      signals:
        signals.length > 0
          ? signals.join(', ')
          : translate(
              'auto.components.agentWorkspace.candidates.theMostEvidence',
              'the most evidence'
            )
    }
  )
}
