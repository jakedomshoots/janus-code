import type { AppState } from '@/store'
import type {
  AgentStatusEntry,
  AgentStatusToolEventStatus
} from '../../../../shared/agent-status-types'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function getSortTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY
}

function toTimelineStatus(
  status: AgentStatusToolEventStatus
): AgentWorkspaceTimelineEntry['status'] {
  switch (status) {
    case 'running':
      return 'running'
    case 'completed':
      return 'done'
    case 'failed':
      return 'failed'
  }
}

function toToolTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  if (!entry.toolEvent) {
    return null
  }
  return {
    id: `${thread.id}:tool:${entry.toolEvent.id}`,
    threadId: thread.id,
    kind: 'tool',
    text: entry.toolEvent.fallbackText,
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: toTimelineStatus(entry.toolEvent.status)
  }
}

function toFailureTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  if (!entry.failure) {
    return null
  }
  return {
    id: `${thread.id}:failure:${entry.failure.id}`,
    threadId: thread.id,
    kind: 'error',
    text: entry.failure.fallbackText,
    createdAt: getIsoTimestamp(entry.failure.occurredAt),
    status: 'failed'
  }
}

function toWaitingTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  if (entry.state !== 'waiting') {
    return null
  }
  const text =
    entry.toolEvent?.fallbackText ??
    (entry.toolName
      ? `Waiting for approval: ${entry.toolName}`
      : 'Waiting for your input or approval')
  return {
    id: `${thread.id}:waiting:${entry.stateStartedAt}`,
    threadId: thread.id,
    kind: 'approval',
    text,
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: 'pending'
  }
}

function toLegacyToolSnapshotEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  if (entry.toolEvent || entry.state !== 'working' || !entry.toolName) {
    return null
  }
  return {
    id: `${thread.id}:tool-snapshot:${entry.stateStartedAt}:${entry.toolName}`,
    threadId: thread.id,
    kind: 'tool',
    text: entry.toolName,
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: 'running'
  }
}

function toCompletionTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  if (entry.state !== 'done' || entry.failure) {
    return null
  }
  return {
    id: `${thread.id}:completion:${entry.stateStartedAt}`,
    threadId: thread.id,
    kind: 'agent',
    text:
      entry.lastAssistantMessage ?? (entry.interrupted ? 'Agent interrupted' : 'Agent completed'),
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: 'done'
  }
}

function appendTimelineEntries(
  timeline: AgentWorkspaceTimelineEntry[],
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): void {
  const toolEntry = toToolTimelineEntry(thread, entry)
  if (toolEntry) {
    timeline.push(toolEntry)
  }
  const legacyToolEntry = toLegacyToolSnapshotEntry(thread, entry)
  if (legacyToolEntry) {
    timeline.push(legacyToolEntry)
  }
  const waitingEntry = toWaitingTimelineEntry(thread, entry)
  if (waitingEntry) {
    timeline.push(waitingEntry)
  }
  const failureEntry = toFailureTimelineEntry(thread, entry)
  if (failureEntry) {
    timeline.push(failureEntry)
  }
  const completionEntry = toCompletionTimelineEntry(thread, entry)
  if (completionEntry) {
    timeline.push(completionEntry)
  }
}

export function selectAgentWorkspaceTimeline(
  state: AppState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspaceTimelineEntry[] {
  const timeline: AgentWorkspaceTimelineEntry[] = []
  const threadsById = new Map(threads.map((thread) => [thread.id, thread]))

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendTimelineEntries(timeline, thread, entry)
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendTimelineEntries(timeline, thread, retained.entry)
  }

  return timeline.sort((a, b) => {
    const updatedDiff = getSortTimestamp(b.createdAt) - getSortTimestamp(a.createdAt)
    return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
  })
}
