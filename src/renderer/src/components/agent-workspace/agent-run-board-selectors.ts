import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceRunEvent,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceThreadChromeSummary
} from './agent-workspace-types'
import {
  getThreadChromeSummary,
  getThreadDiffs,
  getThreadReview,
  getThreadRunEvents
} from './agent-workspace-layout-selectors'

export type AgentRunBoardGroupId = 'running' | 'waiting' | 'review-ready' | 'failed' | 'done'

export type AgentRunBoardRow = {
  readonly threadId: string
  readonly worktreeId: string
  readonly projectName: string
  readonly title: string
  readonly agentKind: AgentWorkspaceThread['agentKind']
  readonly branchName: string | null
  readonly updatedAt: string
  readonly phase: AgentWorkspaceThread['phase']
  readonly currentStep: string
  readonly lastCommand: string | null
  readonly changedFileCount: number
  readonly limitedTelemetry: boolean
}

export type AgentRunBoardGroup = {
  readonly id: AgentRunBoardGroupId
  readonly label: string
  readonly rows: readonly AgentRunBoardRow[]
}

const GROUP_ORDER: readonly AgentRunBoardGroupId[] = [
  'running',
  'waiting',
  'review-ready',
  'failed',
  'done'
]

export function selectAgentRunBoardGroups(
  snapshot: AgentWorkspaceSnapshot
): readonly AgentRunBoardGroup[] {
  const rowsByGroup = new Map<AgentRunBoardGroupId, AgentRunBoardRow[]>()
  for (const thread of snapshot.threads) {
    const runEvents = getThreadRunEvents(snapshot, thread)
    const diffs = getThreadDiffs(snapshot, thread)
    const review = getThreadReview(snapshot, thread)
    const summary = getThreadChromeSummary(thread, runEvents, diffs)
    const groupId = getAgentRunBoardGroupId({ thread, runEvents, diffs, review })
    const rows = rowsByGroup.get(groupId) ?? []
    rows.push(toAgentRunBoardRow({ snapshot, thread, runEvents, summary }))
    rowsByGroup.set(groupId, rows)
  }

  return GROUP_ORDER.flatMap((id) => {
    const rows = rowsByGroup.get(id)
    if (!rows || rows.length === 0) {
      return []
    }
    return [
      {
        id,
        label: getAgentRunBoardGroupLabel(id),
        rows: rows.sort(compareAgentRunBoardRows)
      }
    ]
  })
}

function getAgentRunBoardGroupId({
  thread,
  runEvents,
  diffs,
  review
}: {
  thread: AgentWorkspaceThread
  runEvents: readonly AgentWorkspaceRunEvent[]
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentRunBoardGroupId {
  if (thread.phase === 'failed' || runEvents.some((event) => event.status === 'failed')) {
    return 'failed'
  }
  if (
    thread.phase === 'waiting-for-user' ||
    thread.phase === 'needs-approval' ||
    runEvents.some((event) => event.kind === 'approval' && event.status === 'pending')
  ) {
    return 'waiting'
  }
  if (thread.phase === 'starting' || thread.phase === 'running') {
    return 'running'
  }
  if (thread.phase === 'completed' && (diffs.length > 0 || review !== null)) {
    return 'review-ready'
  }
  return 'done'
}

function toAgentRunBoardRow({
  snapshot,
  thread,
  runEvents,
  summary
}: {
  snapshot: AgentWorkspaceSnapshot
  thread: AgentWorkspaceThread
  runEvents: readonly AgentWorkspaceRunEvent[]
  summary: AgentWorkspaceThreadChromeSummary | null
}): AgentRunBoardRow {
  const project = snapshot.projects.find((candidate) => candidate.id === thread.worktreeId)
  return {
    threadId: thread.id,
    worktreeId: thread.worktreeId,
    projectName: project?.label ?? thread.worktreeId,
    title: thread.title,
    agentKind: thread.agentKind,
    branchName: thread.branchName ?? null,
    updatedAt: thread.updatedAt ?? '',
    phase: thread.phase,
    currentStep: summary?.currentStep ?? thread.phase,
    lastCommand: summary?.lastCommand ?? null,
    changedFileCount: summary?.changedFileCount ?? 0,
    limitedTelemetry:
      thread.agentKind === 'other' ||
      runEvents.length === 0 ||
      runEvents.some((event) => event.status === 'unknown')
  }
}

function compareAgentRunBoardRows(left: AgentRunBoardRow, right: AgentRunBoardRow): number {
  const rightTime = Date.parse(right.updatedAt)
  const leftTime = Date.parse(left.updatedAt)
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
    return rightTime - leftTime
  }
  return left.title.localeCompare(right.title)
}

function getAgentRunBoardGroupLabel(id: AgentRunBoardGroupId): string {
  switch (id) {
    case 'running':
      return 'Running'
    case 'waiting':
      return 'Waiting'
    case 'review-ready':
      return 'Review-ready'
    case 'failed':
      return 'Failed'
    case 'done':
      return 'Done'
  }
}
