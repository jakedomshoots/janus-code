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

function appendTimelineEntries(
  timeline: AgentWorkspaceTimelineEntry[],
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): void {
  const toolEntry = toToolTimelineEntry(thread, entry)
  if (toolEntry) {
    timeline.push(toolEntry)
  }
  const failureEntry = toFailureTimelineEntry(thread, entry)
  if (failureEntry) {
    timeline.push(failureEntry)
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
