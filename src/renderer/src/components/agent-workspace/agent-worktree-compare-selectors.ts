import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { getThreadDiffs, getThreadRunEvents } from './agent-workspace-layout-selectors'

export type AgentWorktreeCompareAttempt = {
  readonly threadId: string
  readonly worktreeId: string
  readonly projectName: string
  readonly title: string
  readonly agentKind: AgentWorkspaceThread['agentKind']
  readonly branchName: string | null
  readonly updatedAt: string
  readonly verificationTitle: string
  readonly verificationStatus: AgentWorkspaceRunEvent['status']
  readonly changedFileCount: number
  readonly additions: number
  readonly deletions: number
  readonly riskNotes: readonly string[]
}

export type AgentWorktreeCompareGroup = {
  readonly id: string
  readonly label: string
  readonly attemptCount: number
  readonly attempts: readonly AgentWorktreeCompareAttempt[]
}

type RepoCompareBucket = {
  readonly repoId: string
  readonly label: string
  readonly attemptsByWorktree: Map<string, AgentWorktreeCompareAttempt>
}

export function selectAgentWorktreeCompareGroups(
  snapshot: AgentWorkspaceSnapshot
): readonly AgentWorktreeCompareGroup[] {
  const projectsById = new Map(snapshot.projects.map((project) => [project.id, project]))
  const buckets = new Map<string, RepoCompareBucket>()

  for (const thread of snapshot.threads) {
    const project = projectsById.get(thread.worktreeId)
    if (!project?.repoId) {
      continue
    }
    const bucket = getOrCreateRepoCompareBucket(buckets, project)
    const attempt = toCompareAttempt({
      thread,
      project,
      runEvents: getThreadRunEvents(snapshot, thread),
      diffs: getThreadDiffs(snapshot, thread)
    })
    const currentAttempt = bucket.attemptsByWorktree.get(thread.worktreeId)
    if (!currentAttempt || compareAttemptsByRecency(attempt, currentAttempt) < 0) {
      bucket.attemptsByWorktree.set(thread.worktreeId, attempt)
    }
  }

  return [...buckets.values()]
    .map((bucket) => {
      const attempts = [...bucket.attemptsByWorktree.values()].sort(compareAttemptsByRecency)
      return {
        id: bucket.repoId,
        label: bucket.label,
        attemptCount: attempts.length,
        attempts
      }
    })
    .filter((group) => group.attemptCount >= 2)
    .sort((left, right) => left.label.localeCompare(right.label))
}

function getOrCreateRepoCompareBucket(
  buckets: Map<string, RepoCompareBucket>,
  project: AgentWorkspaceProject
): RepoCompareBucket {
  const repoId = project.repoId ?? project.id
  const existing = buckets.get(repoId)
  if (existing) {
    return existing
  }
  const bucket: RepoCompareBucket = {
    repoId,
    label: project.label,
    attemptsByWorktree: new Map()
  }
  buckets.set(repoId, bucket)
  return bucket
}

function toCompareAttempt({
  thread,
  project,
  runEvents,
  diffs
}: {
  thread: AgentWorkspaceThread
  project: AgentWorkspaceProject
  runEvents: readonly AgentWorkspaceRunEvent[]
  diffs: readonly AgentWorkspaceDiffSummary[]
}): AgentWorktreeCompareAttempt {
  const verification = getLatestVerificationEvent(runEvents)
  return {
    threadId: thread.id,
    worktreeId: thread.worktreeId,
    projectName: project.label,
    title: thread.title,
    agentKind: thread.agentKind,
    branchName: thread.branchName ?? project.branchName ?? null,
    updatedAt: thread.updatedAt ?? '',
    verificationTitle: verification?.title ?? 'Verification not configured',
    verificationStatus: verification?.status ?? 'unknown',
    changedFileCount: diffs.length,
    additions: diffs.reduce((sum, diff) => sum + diff.additions, 0),
    deletions: diffs.reduce((sum, diff) => sum + diff.deletions, 0),
    riskNotes: getRiskNotes(runEvents)
  }
}

function getLatestVerificationEvent(
  runEvents: readonly AgentWorkspaceRunEvent[]
): AgentWorkspaceRunEvent | null {
  return [...runEvents].reverse().find((event) => event.kind === 'verification') ?? null
}

function getRiskNotes(runEvents: readonly AgentWorkspaceRunEvent[]): readonly string[] {
  const notes = new Set<string>()
  for (const event of runEvents) {
    if (!event.risk) {
      continue
    }
    notes.add(`${event.risk.category}: ${event.risk.reason}`)
  }
  return [...notes]
}

function compareAttemptsByRecency(
  left: AgentWorktreeCompareAttempt,
  right: AgentWorktreeCompareAttempt
): number {
  const rightTime = Date.parse(right.updatedAt)
  const leftTime = Date.parse(left.updatedAt)
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
    return rightTime - leftTime
  }
  return left.projectName.localeCompare(right.projectName)
}
