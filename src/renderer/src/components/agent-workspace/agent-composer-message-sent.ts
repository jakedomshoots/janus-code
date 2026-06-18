import type { AgentComposerSubmitResult } from './agent-composer-submit'

export type AgentComposerMessageSentHandler = (message: {
  threadId: string
  prompt: string
  sentAt: string
}) => void

export function notifyAgentComposerMessageSent(
  onMessageSent: AgentComposerMessageSentHandler | undefined,
  result: AgentComposerSubmitResult
): void {
  if (result.status !== 'sent' || !result.context.threadId) {
    return
  }
  onMessageSent?.({
    threadId: result.context.threadId,
    prompt: result.prompt,
    sentAt: new Date().toISOString()
  })
}
