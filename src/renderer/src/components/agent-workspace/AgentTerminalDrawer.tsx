import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

export function AgentTerminalDrawer({
  open,
  reason,
  onClose,
  children
}: {
  open: boolean
  reason: AgentTerminalRevealReason | null
  terminalAvailable: boolean
  onClose: () => void
  children: ReactNode
}): React.JSX.Element {
  const isBrowserWorkbench = reason === 'browser'
  const title = isBrowserWorkbench
    ? translate('auto.components.agentWorkspace.layout.browserWorkbench', 'Browser workbench')
    : translate('auto.components.agentWorkspace.layout.terminalDrawer', 'Terminal drawer')
  const closeLabel = isBrowserWorkbench
    ? translate(
        'auto.components.agentWorkspace.layout.closeBrowserWorkbench',
        'Close browser workbench'
      )
    : translate(
        'auto.components.agentWorkspace.layout.closeTerminalDrawer',
        'Close terminal drawer'
      )

  return (
    <aside
      data-agent-terminal-drawer="true"
      data-state={open ? 'open' : 'closed'}
      aria-label={title}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex h-[min(46vh,32rem)] min-h-56 flex-col border-t border-border bg-background shadow-2xl transition-[opacity,transform] duration-200',
        open
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[calc(100%+1rem)] opacity-0'
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-3 top-2 z-10 rounded-full bg-background/80 shadow-xs backdrop-blur hover:bg-accent"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
      {/* Why: TerminalWorkspace sizes itself with flex-1/min-h-0 — the drawer
          body must be a flex column or the preserved workbench collapses to 0px. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </aside>
  )
}
