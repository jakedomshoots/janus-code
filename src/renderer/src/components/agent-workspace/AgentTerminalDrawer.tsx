import { Globe, Terminal, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

function formatAgentTerminalRevealReason(reason: AgentTerminalRevealReason): string {
  switch (reason) {
    case 'right-panel':
      return translate(
        'auto.components.agentWorkspace.layout.terminalOpenedFromRightPanel',
        'Opened from right panel'
      )
    case 'debug-button':
      return translate(
        'auto.components.agentWorkspace.layout.terminalOpenedFromComposerTools',
        'Opened from composer tools'
      )
    case 'approval':
      return translate(
        'auto.components.agentWorkspace.layout.terminalOpenedForApproval',
        'Respond to the agent approval prompt here.'
      )
    case 'failure':
      return translate(
        'auto.components.agentWorkspace.layout.terminalOpenedFromFailure',
        'Opened from failure banner'
      )
    case 'keyboard-shortcut':
      return translate(
        'auto.components.agentWorkspace.layout.terminalOpenedFromKeyboardShortcut',
        'Opened from keyboard shortcut'
      )
    case 'browser':
      return translate(
        'auto.components.agentWorkspace.layout.browserWorkbenchReady',
        'Browser, grab, and annotations are available here.'
      )
  }
}

export function AgentTerminalDrawer({
  open,
  reason,
  terminalAvailable,
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
  const DrawerIcon = isBrowserWorkbench ? Globe : Terminal
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
      aria-hidden={!open}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex h-[min(46vh,32rem)] min-h-56 flex-col border-t border-border bg-background shadow-2xl transition-[opacity,transform] duration-200',
        open
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[calc(100%+1rem)] opacity-0'
      )}
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border bg-muted/30 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <DrawerIcon className="size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {terminalAvailable
                ? ((reason ? formatAgentTerminalRevealReason(reason) : null) ??
                  translate(
                    'auto.components.agentWorkspace.layout.terminalSessionAvailable',
                    'Terminal session is available as a debug panel.'
                  ))
                : translate(
                    'auto.components.agentWorkspace.layout.noTerminalSessionAttached',
                    'No terminal session is attached to this workspace.'
                  )}
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </aside>
  )
}
