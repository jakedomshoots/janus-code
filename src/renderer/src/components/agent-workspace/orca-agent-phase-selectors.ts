import type { AgentWorkspacePhase } from './agent-workspace-types'

export function getPhaseForAgentState(
  state: string,
  hasApproval: boolean,
  hasFailure: boolean
): AgentWorkspacePhase {
  if (hasFailure) {
    return 'failed'
  }
  if (hasApproval) {
    return 'needs-approval'
  }
  switch (state) {
    case 'working':
      return 'running'
    case 'waiting':
      return 'waiting-for-user'
    case 'blocked':
      return 'needs-approval'
    case 'done':
      return 'completed'
    default:
      return 'disconnected'
  }
}
