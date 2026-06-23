import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export type AgentComposerLocalUserMessageStatus = Extract<
  AgentWorkspaceTimelineEntry['status'],
  'pending' | 'done' | 'failed'
>

export type AgentComposerMessageSentHandler = (message: {
  localId?: string
  threadId: string
  prompt: string
  sentAt: string
  status?: AgentComposerLocalUserMessageStatus
}) => void

export function notifyAgentComposerMessageSent(
  onMessageSent: AgentComposerMessageSentHandler | undefined,
  result: AgentComposerSubmitResult,
  options: { localId?: string } = {}
): void {
  if (result.status !== 'sent' || !result.context.threadId) {
    return
  }
  onMessageSent?.({
    ...(options.localId ? { localId: options.localId } : {}),
    threadId: result.context.threadId,
    prompt: result.prompt,
    sentAt: new Date().toISOString(),
    status: 'done'
  })
}

export function notifyAgentComposerMessagePending(
  onMessageSent: AgentComposerMessageSentHandler | undefined,
  message: {
    localId: string
    threadId: string
    prompt: string
  }
): void {
  notifyAgentComposerLocalMessage(onMessageSent, {
    ...message,
    status: 'pending'
  })
}

export function notifyAgentComposerMessageFailed(
  onMessageSent: AgentComposerMessageSentHandler | undefined,
  message: {
    localId: string
    threadId: string
    prompt: string
  }
): void {
  notifyAgentComposerLocalMessage(onMessageSent, {
    ...message,
    status: 'failed'
  })
}

function notifyAgentComposerLocalMessage(
  onMessageSent: AgentComposerMessageSentHandler | undefined,
  message: {
    localId: string
    threadId: string
    prompt: string
    status: AgentComposerLocalUserMessageStatus
  }
): void {
  onMessageSent?.({
    localId: message.localId,
    threadId: message.threadId,
    prompt: message.prompt,
    sentAt: new Date().toISOString(),
    status: message.status
  })
}
