import { Globe, MessageSquarePlus, PanelBottom } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

export function AgentComposerToolCluster({
  canOpenTerminalDrawer,
  onOpenTerminalDrawer,
  canOpenBrowserWorkbench,
  onOpenBrowserWorkbench,
  canAttachBrowserContext,
  browserAnnotationCount,
  onAttachBrowserContext
}: {
  canOpenTerminalDrawer: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
  canOpenBrowserWorkbench: boolean
  onOpenBrowserWorkbench?: () => void
  canAttachBrowserContext: boolean
  browserAnnotationCount: number
  onAttachBrowserContext?: () => void
}): React.JSX.Element {
  return (
    <div
      role="group"
      className="flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-border bg-background p-1"
      aria-label={translate('auto.components.agentWorkspace.composer.tools', 'Tools')}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!canOpenBrowserWorkbench}
        aria-label={translate(
          'auto.components.agentWorkspace.composer.openBrowserWorkbench',
          'Open browser workbench'
        )}
        title={translate(
          'auto.components.agentWorkspace.composer.openBrowserWorkbench',
          'Open browser workbench'
        )}
        onClick={onOpenBrowserWorkbench}
      >
        <Globe className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!canAttachBrowserContext}
        aria-label={translate(
          'auto.components.agentWorkspace.composer.attachBrowserContext',
          'Attach browser context'
        )}
        title={translate(
          'auto.components.agentWorkspace.composer.attachBrowserContextWithCount',
          'Attach browser context ({{count}} annotations)',
          { count: browserAnnotationCount }
        )}
        onClick={onAttachBrowserContext}
      >
        <span className="relative inline-flex">
          <MessageSquarePlus className="size-4" aria-hidden="true" />
          {browserAnnotationCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-3.5 justify-center rounded-full bg-accent px-1 text-[9px] font-medium leading-3 text-accent-foreground">
              {browserAnnotationCount}
            </span>
          ) : null}
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!canOpenTerminalDrawer}
        aria-label={translate(
          'auto.components.agentWorkspace.composer.openTerminalDrawer',
          'Open terminal drawer'
        )}
        title={translate(
          'auto.components.agentWorkspace.composer.openTerminalDrawer',
          'Open terminal drawer'
        )}
        onClick={() => onOpenTerminalDrawer?.('debug-button')}
      >
        <PanelBottom className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
