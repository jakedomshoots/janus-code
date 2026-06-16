import type { ReactNode } from 'react'

export function TerminalViewSwitch({
  guiAgentWorkspaceEnabled,
  agentWorkspace,
  terminalWorkspace
}: {
  guiAgentWorkspaceEnabled: boolean
  agentWorkspace: ReactNode
  terminalWorkspace: ReactNode
}): React.JSX.Element {
  return <>{guiAgentWorkspaceEnabled ? agentWorkspace : terminalWorkspace}</>
}
