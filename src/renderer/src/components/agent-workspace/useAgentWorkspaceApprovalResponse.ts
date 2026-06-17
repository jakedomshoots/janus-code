import { useState } from 'react'
import type { AgentApprovalDecision } from '../../../../shared/tui-agent-approval-input'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import {
  getAgentWorkspaceApprovalResponseMessage,
  respondToAgentWorkspaceApproval
} from './agent-workspace-approval-response'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function useAgentWorkspaceApprovalResponse({
  thread,
  terminalAvailable,
  onOpenTerminalDrawer
}: {
  thread: AgentWorkspaceThread | null
  terminalAvailable: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): {
  approvalFeedback: string | null
  approvalBusy: boolean
  canRespondInTerminal: boolean
  handleApprovalDecision: (decision: AgentApprovalDecision) => Promise<void>
} {
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const canRespondInTerminal = terminalAvailable && typeof onOpenTerminalDrawer === 'function'

  async function handleApprovalDecision(decision: AgentApprovalDecision): Promise<void> {
    if (!thread || approvalBusy) {
      return
    }
    setApprovalBusy(true)
    const result = await respondToAgentWorkspaceApproval({
      threadId: thread.id,
      worktreeId: thread.worktreeId,
      agentKind: thread.agentKind,
      decision,
      onOpenTerminalDrawer
    })
    setApprovalFeedback(getAgentWorkspaceApprovalResponseMessage(result, decision))
    setApprovalBusy(false)
  }

  return {
    approvalFeedback,
    approvalBusy,
    canRespondInTerminal,
    handleApprovalDecision
  }
}
