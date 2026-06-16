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
  if (!guiAgentWorkspaceEnabled) {
    return <>{terminalWorkspace}</>
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1">
      <div data-terminal-view="gui-agent-workspace" className="min-h-0 min-w-0 flex-1">
        {agentWorkspace}
      </div>
      <div data-terminal-view="preserved-terminal-workspace">{terminalWorkspace}</div>
    </div>
  )
}
