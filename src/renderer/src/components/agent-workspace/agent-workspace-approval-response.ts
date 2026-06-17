import { translate } from '@/i18n/i18n'
import { getSettingsForWorktreeRuntimeOwner } from '@/lib/worktree-runtime-owner'
import { sendRuntimePtyInputVerified } from '@/runtime/runtime-terminal-inspection'
import { useAppStore } from '@/store'
import {
  resolveTuiAgentApprovalInput,
  type AgentApprovalDecision
} from '../../../../shared/tui-agent-approval-input'
import type { TuiAgent } from '../../../../shared/types'
import { syncAgentTerminalDrawerSurface } from './agent-terminal-drawer-surface'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { focusAgentWorkspaceThreadTerminal } from './agent-workspace-thread-terminal-focus'

export type AgentWorkspaceApprovalResponseResult =
  | { status: 'sent' }
  | { status: 'not-writable' }
  | { status: 'no-terminal' }
  | { status: 'unsupported-thread' }

export async function respondToAgentWorkspaceApproval({
  threadId,
  worktreeId,
  agentKind,
  decision,
  onOpenTerminalDrawer
}: {
  threadId: string
  worktreeId: string
  agentKind: TuiAgent | string
  decision: AgentApprovalDecision
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): Promise<AgentWorkspaceApprovalResponseResult> {
  const target = focusAgentWorkspaceThreadTerminal({ threadId, worktreeId })
  if (!target) {
    return { status: 'no-terminal' }
  }

  onOpenTerminalDrawer?.('approval')
  syncAgentTerminalDrawerSurface('approval')

  const state = useAppStore.getState()
  const settings = getSettingsForWorktreeRuntimeOwner(state, worktreeId)
  const input = resolveTuiAgentApprovalInput(agentKind, decision)
  const accepted = await sendRuntimePtyInputVerified(settings, target.ptyId, input)
  if (!accepted) {
    return { status: 'not-writable' }
  }

  return { status: 'sent' }
}

export function getAgentWorkspaceApprovalResponseMessage(
  result: AgentWorkspaceApprovalResponseResult,
  decision: AgentApprovalDecision
): string | null {
  switch (result.status) {
    case 'sent':
      return decision === 'approve'
        ? translate(
            'auto.components.agentWorkspace.layout.approvalApproveSent',
            'Approval sent to the agent terminal.'
          )
        : translate(
            'auto.components.agentWorkspace.layout.approvalDenySent',
            'Denial sent to the agent terminal.'
          )
    case 'not-writable':
      return translate(
        'auto.components.agentWorkspace.layout.approvalTerminalNotWritable',
        'Could not write to the agent terminal. Open the terminal drawer and respond manually.'
      )
    case 'no-terminal':
      return translate(
        'auto.components.agentWorkspace.layout.approvalTerminalUnavailable',
        'No live terminal session is attached to this thread.'
      )
    case 'unsupported-thread':
      return null
  }
}
