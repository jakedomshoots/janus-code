import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceRunEvent,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceThreadChromeAttentionState,
  AgentWorkspaceThreadChromeSummary,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

const CHROME_STEP_EVENT_KINDS = new Set<AgentWorkspaceRunEvent['kind']>([
  'state',
  'tool',
  'approval',
  'error',
  'verification'
])

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

export function getThreadRunEvents(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceRunEvent[] {
  return thread ? (snapshot.runEvents ?? []).filter((event) => event.threadId === thread.id) : []
}

export function getThreadDiffs(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceDiffSummary[] {
  return thread ? snapshot.diffs.filter((diff) => diff.threadId === thread.id) : []
}

function getEventTimestamp(event: AgentWorkspaceRunEvent, index: number): number {
  if (!event.createdAt) {
    return index
  }
  const parsed = Date.parse(event.createdAt)
  return Number.isFinite(parsed) ? parsed : index
}

function getLatestThreadRunEvent(
  thread: AgentWorkspaceThread,
  runEvents: readonly AgentWorkspaceRunEvent[],
  predicate: (event: AgentWorkspaceRunEvent) => boolean
): AgentWorkspaceRunEvent | null {
  let latest: { event: AgentWorkspaceRunEvent; timestamp: number; index: number } | null = null
  for (const [index, event] of runEvents.entries()) {
    if (event.threadId !== thread.id || !predicate(event)) {
      continue
    }
    const timestamp = getEventTimestamp(event, index)
    if (
      !latest ||
      timestamp > latest.timestamp ||
      (timestamp === latest.timestamp && index > latest.index)
    ) {
      latest = { event, timestamp, index }
    }
  }
  return latest?.event ?? null
}

function getThreadPhaseStep(thread: AgentWorkspaceThread): string {
  switch (thread.phase) {
    case 'starting':
      return 'Starting'
    case 'running':
      return 'Running'
    case 'waiting-for-user':
      return 'Waiting for user'
    case 'needs-approval':
      return 'Needs approval'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'disconnected':
      return 'Disconnected'
    case 'idle':
      return 'Idle'
  }
}

function getThreadPhaseAttentionState(
  phase: AgentWorkspaceThread['phase']
): AgentWorkspaceThreadChromeAttentionState {
  switch (phase) {
    case 'starting':
    case 'running':
      return 'running'
    case 'waiting-for-user':
    case 'needs-approval':
      return 'needs-attention'
    case 'failed':
    case 'disconnected':
      return 'failed'
    case 'completed':
      return 'done'
    case 'idle':
      return 'idle'
  }
}

function getThreadAttentionState(
  thread: AgentWorkspaceThread,
  runEvents: readonly AgentWorkspaceRunEvent[]
): AgentWorkspaceThreadChromeAttentionState {
  const threadEvents = runEvents.filter((event) => event.threadId === thread.id)
  if (thread.phase === 'failed' || threadEvents.some((event) => event.status === 'failed')) {
    return 'failed'
  }
  if (
    thread.phase === 'waiting-for-user' ||
    thread.phase === 'needs-approval' ||
    threadEvents.some((event) => event.kind === 'approval' && event.status === 'pending')
  ) {
    return 'needs-attention'
  }
  if (
    thread.phase === 'starting' ||
    thread.phase === 'running' ||
    threadEvents.some((event) => event.status === 'running')
  ) {
    return 'running'
  }
  return getThreadPhaseAttentionState(thread.phase)
}

export function getThreadChromeSummary(
  thread: AgentWorkspaceThread | null,
  runEvents: readonly AgentWorkspaceRunEvent[],
  diffs: readonly AgentWorkspaceDiffSummary[]
): AgentWorkspaceThreadChromeSummary | null {
  if (!thread) {
    return null
  }
  const currentEvent = getLatestThreadRunEvent(thread, runEvents, (event) =>
    CHROME_STEP_EVENT_KINDS.has(event.kind)
  )
  const commandEvent = getLatestThreadRunEvent(
    thread,
    runEvents,
    (event) => event.kind === 'tool' && event.detail.trim().length > 0
  )
  return {
    currentStep: currentEvent?.title ?? getThreadPhaseStep(thread),
    lastCommand: commandEvent?.detail ?? null,
    changedFileCount: diffs.filter((diff) => diff.threadId === thread.id).length,
    attentionState: getThreadAttentionState(thread, runEvents)
  }
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
