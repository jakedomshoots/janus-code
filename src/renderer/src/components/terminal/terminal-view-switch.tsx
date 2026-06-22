import type { ReactNode } from 'react'

export function TerminalViewSwitch({
  guiAgentWorkspaceEnabled,
  agentWorkspace,
  browserWorkbenchOverlayHost = null,
  terminalWorkspace
}: {
  guiAgentWorkspaceEnabled: boolean
  agentWorkspace: ReactNode
  browserWorkbenchOverlayHost?: ReactNode
  terminalWorkspace: ReactNode
}): React.JSX.Element {
  if (!guiAgentWorkspaceEnabled) {
    return <>{terminalWorkspace}</>
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        data-terminal-view="gui-agent-workspace"
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
      >
        {agentWorkspace}
        {browserWorkbenchOverlayHost ? (
          <div
            data-terminal-view="agent-browser-overlay-host"
            className="pointer-events-none absolute inset-0 z-[5] flex min-h-0 flex-col overflow-hidden"
          >
            {browserWorkbenchOverlayHost}
          </div>
        ) : null}
      </div>
      <div data-terminal-view="preserved-terminal-workspace">{terminalWorkspace}</div>
    </div>
  )
}
