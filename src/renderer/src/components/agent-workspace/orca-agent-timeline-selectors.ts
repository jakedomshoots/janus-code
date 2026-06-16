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
    const timelineEntry = toToolTimelineEntry(thread, entry)
    if (timelineEntry) {
      timeline.push(timelineEntry)
    }
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    const timelineEntry = toToolTimelineEntry(thread, retained.entry)
    if (timelineEntry) {
      timeline.push(timelineEntry)
    }
  }

  return timeline.sort((a, b) => {
    const updatedDiff = getSortTimestamp(b.createdAt) - getSortTimestamp(a.createdAt)
    return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
  })
}
