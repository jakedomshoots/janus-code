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
    markPendingAgentComposerEchoDelivered(pendingEcho, onMessageSent)
    return
  }
  notifyAgentComposerMessageFailed(onMessageSent, pendingEcho)
}

export function markPendingAgentComposerEchoDelivered(
  pendingEcho: PendingAgentComposerEcho | null,
  onMessageSent?: AgentComposerMessageSentHandler
): void {
  if (!pendingEcho) {
    return
  }
  notifyAgentComposerMessageSent(
    onMessageSent,
    {
      status: 'sent',
      context: {
        activeWorktreeId: null,
        worktreeId: null,
        threadId: pendingEcho.threadId,
        agentKind: null
      },
      message: '',
      prompt: pendingEcho.prompt
    },
    { localId: pendingEcho.localId }
  )
}

function canCreatePendingComposerEcho(
  canSendToSelectedThread: boolean,
  selectedThread: AgentWorkspaceThread | null
): selectedThread is AgentWorkspaceThread {
  // Why: terminal handoff can lag for active and completed follow-ups; keep the
  // user's message visible while routing decides whether to send or relaunch.
  return canSendToSelectedThread && Boolean(selectedThread)
}
