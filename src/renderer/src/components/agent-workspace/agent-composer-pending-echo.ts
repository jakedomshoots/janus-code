import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import {
  notifyAgentComposerMessageFailed,
  notifyAgentComposerMessagePending,
  notifyAgentComposerMessageSent
} from './agent-composer-message-sent'
import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export type PendingAgentComposerEcho = {
  readonly localId: string
  readonly threadId: string
  readonly prompt: string
}

export function startPendingAgentComposerEcho({
  canSendToSelectedThread,
  selectedThread,
  prompt,
  submitSequence,
  onMessageSent
}: {
  canSendToSelectedThread: boolean
  selectedThread: AgentWorkspaceThread | null
  prompt: string
  submitSequence: number
  onMessageSent?: AgentComposerMessageSentHandler
}): PendingAgentComposerEcho | null {
  if (!canCreatePendingComposerEcho(canSendToSelectedThread, selectedThread)) {
    return null
  }
  const echo: PendingAgentComposerEcho = {
    localId: `${selectedThread.id}:local-user-pending:${submitSequence}`,
    threadId: selectedThread.id,
    prompt
  }
  notifyAgentComposerMessagePending(onMessageSent, echo)
  return echo
}

export function settlePendingAgentComposerEcho(
  pendingEcho: PendingAgentComposerEcho | null,
  result: AgentComposerSubmitResult,
  onMessageSent?: AgentComposerMessageSentHandler
): void {
  if (!pendingEcho) {
    return
  }
  if (result.status === 'sent') {
    notifyAgentComposerMessageSent(onMessageSent, result, {
      localId: pendingEcho.localId
    })
    return
  }
  notifyAgentComposerMessageFailed(onMessageSent, pendingEcho)
}

function canCreatePendingComposerEcho(
  canSendToSelectedThread: boolean,
  selectedThread: AgentWorkspaceThread | null
): selectedThread is AgentWorkspaceThread {
  // Why: completed threads can fall back to launching a new agent, so only
  // active in-terminal follow-ups get an optimistic transcript turn.
  return canSendToSelectedThread && Boolean(selectedThread) && selectedThread?.phase !== 'completed'
}
