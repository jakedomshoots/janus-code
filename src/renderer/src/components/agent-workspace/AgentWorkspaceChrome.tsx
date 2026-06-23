import type { ReactNode } from 'react'

export function AgentWorkspaceChrome({
  header,
  children,
  rightPanel
}: {
  header: ReactNode
  children: ReactNode
  rightPanel: ReactNode
}): React.JSX.Element {
  const hasRightPanel = rightPanel !== null && rightPanel !== undefined && rightPanel !== false

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {header}
        <div
          className={`agent-workspace-content-shell relative flex min-h-0 min-w-0 flex-1 overflow-hidden ${
            hasRightPanel ? 'agent-workspace-content-shell--floating-card' : ''
          }`}
          data-agent-workspace-right-panel-open={hasRightPanel ? 'true' : undefined}
        >
          {children}
          {rightPanel}
        </div>
      </section>
    </div>
  )
}
