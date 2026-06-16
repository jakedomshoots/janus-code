import type { ReactNode } from 'react'

export function AgentWorkspaceChrome({
  sidebar,
  header,
  children,
  rightPanel
}: {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
  rightPanel: ReactNode
}): React.JSX.Element {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      {sidebar}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {header}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
          {rightPanel}
        </div>
      </section>
    </div>
  )
}
