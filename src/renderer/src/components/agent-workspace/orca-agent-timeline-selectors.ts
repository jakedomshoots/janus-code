import type { AppState } from '@/store'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type {
  AgentStatusConversationTurn,
  AgentStatusEntry,
  AgentStatusToolEventStatus
} from '../../../../shared/agent-status-types'
import type { PendingAgentLaunch } from '@/store/slices/terminals'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import { isAgentWorkspaceVisibleUserPrompt } from './agent-visible-user-prompt'
import { compareAgentTimelineEntries } from './agent-timeline-order'

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function getPromptTimestamp(entry: AgentStatusEntry): number {
  return Math.min(entry.stateStartedAt, entry.updatedAt, entry.failure?.occurredAt ?? Infinity)
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

function toUserPromptTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  const prompt = entry.prompt.trim()
  if (!isAgentWorkspaceVisibleUserPrompt(prompt)) {
    return null
  }
  return {
    id: `${thread.id}:prompt:${entry.stateStartedAt}`,
    threadId: thread.id,
    kind: 'user',
    text: prompt,
    createdAt: getIsoTimestamp(getPromptTimestamp(entry)),
    status: 'done'
  }
}

function appendConversationTurnTimelineEntries(
  timeline: AgentWorkspaceTimelineEntry[],
  thread: AgentWorkspaceThread,
  turn: AgentStatusConversationTurn
): void {
  if (!isAgentWorkspaceVisibleUserPrompt(turn.prompt)) {
    return
  }
  timeline.push({
    id: `${turn.id}:user`,
    threadId: thread.id,
    kind: 'user',
    text: turn.prompt,
    createdAt: getIsoTimestamp(turn.startedAt),
    status: 'done'
  })
  timeline.push({
    id: `${turn.id}:agent`,
    threadId: thread.id,
    kind: 'agent',
    text: turn.interrupted ? 'Agent interrupted' : turn.assistantMessage,
    createdAt: getIsoTimestamp(turn.completedAt),
    status: 'done'
  })
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
  const assistantText = entry.lastAssistantMessage?.trim()
  const text =
    entry.approval?.fallbackText ??
    assistantText ??
    entry.toolInput ??
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

function toLiveAssistantTimelineEntry(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceTimelineEntry | null {
  const text = entry.lastAssistantMessage?.trim()
  if (!text || entry.state === 'done' || entry.state === 'waiting' || entry.failure) {
    return null
  }
  if (entry.prompt && !isAgentWorkspaceVisibleUserPrompt(entry.prompt)) {
    return null
  }
  return {
    id: `${thread.id}:live-assistant:${entry.stateStartedAt}`,
    threadId: thread.id,
    kind: 'agent',
    text,
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: entry.state === 'working' ? 'running' : 'pending'
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
  if (entry.prompt && !isAgentWorkspaceVisibleUserPrompt(entry.prompt)) {
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
  for (const turn of entry.conversation ?? []) {
    appendConversationTurnTimelineEntries(timeline, thread, turn)
  }
  const userPromptEntry = toUserPromptTimelineEntry(thread, entry)
  if (userPromptEntry) {
    timeline.push(userPromptEntry)
  }
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
  const liveAssistantEntry = toLiveAssistantTimelineEntry(thread, entry)
  if (liveAssistantEntry) {
    timeline.push(liveAssistantEntry)
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

function appendPendingLaunchTimelineEntries(
  timeline: AgentWorkspaceTimelineEntry[],
  thread: AgentWorkspaceThread,
  launch: PendingAgentLaunch
): void {
  const prompt = launch.prompt.trim()
  if (isAgentWorkspaceVisibleUserPrompt(prompt)) {
    timeline.push({
      id: `${thread.id}:pending-launch:user`,
      threadId: thread.id,
      kind: 'user',
      text: prompt,
      createdAt: getIsoTimestamp(launch.startedAt),
      status: 'done'
    })
  }
  timeline.push({
    id: `${thread.id}:pending-launch:system`,
    threadId: thread.id,
    kind: 'system',
    text: `Starting ${formatAgentTypeLabel(launch.agent)}...`,
    createdAt: getIsoTimestamp(launch.startedAt),
    status: 'running'
  })
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

  for (const [paneKey, launch] of Object.entries(state.pendingAgentLaunchesByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendPendingLaunchTimelineEntries(timeline, thread, launch)
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

  return timeline.sort(compareAgentTimelineEntries)
}
