import { useRef, useState } from 'react'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function useAgentWorkspaceLocalTimeline(): {
  localUserTimeline: readonly AgentWorkspaceTimelineEntry[]
  handleMessageSent: AgentComposerMessageSentHandler
} {
  const [localUserTimeline, setLocalUserTimeline] = useState<AgentWorkspaceTimelineEntry[]>([])
  const localUserTimelineSequenceRef = useRef(0)

  const handleMessageSent: AgentComposerMessageSentHandler = (message) => {
    localUserTimelineSequenceRef.current += 1
    const entry: AgentWorkspaceTimelineEntry = {
      id: `${message.threadId}:local-user:${Date.now()}:${localUserTimelineSequenceRef.current}`,
      threadId: message.threadId,
      kind: 'user',
      text: message.prompt,
      createdAt: message.sentAt,
      status: 'done'
    }
    setLocalUserTimeline((current) => [entry, ...current].slice(0, 100))
  }

  return {
    localUserTimeline,
    handleMessageSent
  }
}
