import {
  sendNotesToActiveAgentSession,
  type ActiveAgentNotesSendResult,
  type ActiveAgentNotesSendStatus
} from '@/lib/active-agent-note-send'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { parsePaneKey } from '../../../../shared/stable-pane-id'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export type AgentComposerSendFunction = (args: {
  worktreeId: string
  prompt: string
  noteTarget?: { tabId: string; leafId: string } | null
}) => Promise<ActiveAgentNotesSendResult>

type AgentComposerSubmitContext = {
  activeWorktreeId: string | null
  worktreeId: string | null
  threadId: string | null
  agentKind: string | null
}

type AgentComposerSubmitBaseResult = {
  message: string
  prompt: string
  context: AgentComposerSubmitContext
}

export type AgentComposerSubmitResult =
  | (AgentComposerSubmitBaseResult & {
      status: 'sent'
    })
  | (AgentComposerSubmitBaseResult & {
      status: 'blocked'
      reason: 'empty' | 'no-selected-thread' | 'thread-not-running' | 'thread-not-active-worktree'
    })
  | (AgentComposerSubmitBaseResult & {
      status: 'error'
      reason: Exclude<ActiveAgentNotesSendStatus, 'sent'> | 'send-exception'
    })

export async function submitAgentComposerMessage({
  activeWorktreeId,
  selectedThread,
  prompt,
  sendNotes = sendNotesToActiveAgentSession
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  prompt: string
  sendNotes?: AgentComposerSendFunction
}): Promise<AgentComposerSubmitResult> {
  const trimmedPrompt = prompt.trim()
  const context = getSubmitContext(activeWorktreeId, selectedThread)

  if (!trimmedPrompt) {
    return {
      status: 'blocked',
      reason: 'empty',
      message: translate(
        'auto.components.agentWorkspace.composer.enterMessageBeforeSending',
        'Enter a message before sending.'
      ),
      prompt: trimmedPrompt,
      context
    }
  }

  if (!selectedThread) {
    return {
      status: 'blocked',
      reason: 'no-selected-thread',
      message: translate(
        'auto.components.agentWorkspace.composer.selectRunningThread',
        'Select a running thread before sending a message.'
      ),
      prompt: trimmedPrompt,
      context
    }
  }

  if (
    selectedThread.phase !== 'running' &&
    selectedThread.phase !== 'waiting-for-user' &&
    selectedThread.phase !== 'completed'
  ) {
    return {
      status: 'blocked',
      reason: 'thread-not-running',
      message: translate(
        'auto.components.agentWorkspace.composer.threadNotRunning',
        'This thread is {{phase}} and cannot receive messages yet.',
        { phase: formatAgentWorkspacePhase(selectedThread.phase) }
      ),
      prompt: trimmedPrompt,
      context
    }
  }

  if (activeWorktreeId !== selectedThread.worktreeId) {
    return {
      status: 'blocked',
      reason: 'thread-not-active-worktree',
      message: translate(
        'auto.components.agentWorkspace.composer.threadNotActiveWorktree',
        'Switch to this worktree before sending a message.'
      ),
      prompt: trimmedPrompt,
      context
    }
  }

  try {
    const noteTarget = parsePaneKey(selectedThread.id)
    const result = await sendNotes({
      worktreeId: selectedThread.worktreeId,
      prompt: trimmedPrompt,
      ...(noteTarget ? { noteTarget } : {})
    })
    if (result.status !== 'sent') {
      return {
        status: 'error',
        reason: result.status,
        message: formatComposerSendFailure(result.status),
        prompt: trimmedPrompt,
        context
      }
    }
  } catch {
    return {
      status: 'error',
      reason: 'send-exception',
      message: translate(
        'auto.components.agentWorkspace.composer.sendException',
        'Could not send the message to the agent.'
      ),
      prompt: trimmedPrompt,
      context
    }
  }

  return {
    status: 'sent',
    message: translate(
      'auto.components.agentWorkspace.composer.messageAcceptedByAgent',
      'Message accepted by {{agent}}.',
      {
        agent: formatAgentTypeLabel(selectedThread.agentKind)
      }
    ),
    prompt: trimmedPrompt,
    context
  }
}

function formatComposerSendFailure(status: Exclude<ActiveAgentNotesSendStatus, 'sent'>): string {
  switch (status) {
    case 'empty':
      return translate(
        'auto.components.agentWorkspace.composer.enterMessageBeforeSending',
        'Enter a message before sending.'
      )
    case 'no-active-terminal':
      return translate(
        'auto.components.agentWorkspace.composer.openAgentTerminalInWorktree',
        'Open the agent terminal in this worktree, then send the message again.'
      )
    case 'no-agent':
      return translate(
        'auto.components.agentWorkspace.composer.activeTerminalNotAgent',
        'The active terminal is not a recognized agent session.'
      )
    case 'not-ready':
      return translate(
        'auto.components.agentWorkspace.composer.agentNotReady',
        'The agent is not ready for input yet.'
      )
    case 'not-writable':
      return translate(
        'auto.components.agentWorkspace.composer.terminalDidNotAcceptMessage',
        'The active terminal did not accept the message.'
      )
  }
}

function getSubmitContext(
  activeWorktreeId: string | null,
  selectedThread: AgentWorkspaceThread | null
): AgentComposerSubmitContext {
  return {
    activeWorktreeId,
    worktreeId: selectedThread?.worktreeId ?? activeWorktreeId,
    threadId: selectedThread?.id ?? null,
    agentKind: selectedThread?.agentKind ?? null
  }
}
