import type { ReactNode } from 'react'

export function AgentWorkspaceChrome({
  header,
  children,
  runBoard,
  rightPanel
}: {
  header: ReactNode
  children: ReactNode
  runBoard?: ReactNode
  rightPanel: ReactNode
}): React.JSX.Element {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {header}
        {runBoard ? (
          <div className="scrollbar-sleek max-h-[clamp(4.5rem,12vh,20rem)] shrink-0 overflow-y-auto overscroll-contain">
            {/* Keep compare-heavy run boards from starving the active thread on laptop-height screens. */}
            {runBoard}
          </div>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
          {rightPanel}
        </div>
      </section>
    </div>
  )
}
