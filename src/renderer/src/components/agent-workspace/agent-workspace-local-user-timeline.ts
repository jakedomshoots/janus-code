import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

type AgentComposerLocalUserMessage = Parameters<AgentComposerMessageSentHandler>[0]

export function upsertLocalUserTimelineEntry({
  current,
  message,
  sequence
}: {
  current: AgentWorkspaceTimelineEntry[]
  message: AgentComposerLocalUserMessage
  sequence: number
}): AgentWorkspaceTimelineEntry[] {
  const entryId = message.localId ?? `${message.threadId}:local-user:${Date.now()}:${sequence}`
  const entry: AgentWorkspaceTimelineEntry = {
    id: entryId,
    threadId: message.threadId,
    kind: 'user',
    text: message.prompt,
    createdAt: message.sentAt,
    status: message.status ?? 'done'
  }
  const existingIndex = current.findIndex((currentEntry) => currentEntry.id === entryId)
  if (existingIndex === -1) {
    return [entry, ...current].slice(0, 100)
  }
  return current.map((currentEntry, index) => (index === existingIndex ? entry : currentEntry))
}
