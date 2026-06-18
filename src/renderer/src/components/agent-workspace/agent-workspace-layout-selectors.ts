import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

export function getSelectedProject(snapshot: AgentWorkspaceSnapshot): AgentWorkspaceProject | null {
  return (
    snapshot.projects.find((project) => project.id === snapshot.activeWorktreeId) ??
    snapshot.projects[0] ??
    null
  )
}

export function getProjectThreads(
  snapshot: AgentWorkspaceSnapshot,
  project: AgentWorkspaceProject | null
): readonly AgentWorkspaceThread[] {
  return project
    ? snapshot.threads.filter((thread) => thread.worktreeId === project.id)
    : snapshot.threads
}

export function getThreadTimeline(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceTimelineEntry[] {
  return thread ? snapshot.timeline.filter((entry) => entry.threadId === thread.id) : []
}

export function getThreadDiffs(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceDiffSummary[] {
  return thread ? snapshot.diffs.filter((diff) => diff.threadId === thread.id) : []
}

export function getThreadApproval(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): AgentWorkspaceApproval | null {
  return thread
    ? (snapshot.approvals.find((approval) => approval.threadId === thread.id) ?? null)
    : null
}

export function getThreadReview(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): AgentWorkspaceReviewSummary | null {
  return thread
    ? ((snapshot.reviews ?? []).find((review) => review.worktreeId === thread.worktreeId) ?? null)
    : null
}
