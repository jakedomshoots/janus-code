import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function createLocalUserTimelineEntry({
  message,
  sequence
}: {
  readonly message: Parameters<AgentComposerMessageSentHandler>[0]
  readonly sequence: number
}): AgentWorkspaceTimelineEntry {
  return {
    id: `${message.threadId}:local-user:${Date.now()}:${sequence}`,
    threadId: message.threadId,
    kind: 'user',
    text: message.prompt,
    createdAt: message.sentAt,
    status: 'done'
  }
}
