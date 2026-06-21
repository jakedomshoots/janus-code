import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentComposerQueuedFollowUp } from './agent-composer-queued-follow-up'

export function AgentComposerQueuedFollowUpRow({
  queuedFollowUp,
  disabled,
  onChange,
  onDelete
}: {
  queuedFollowUp: AgentComposerQueuedFollowUp
  disabled: boolean
  onChange: (value: string) => void
  onDelete: () => void
}): React.JSX.Element {
  return (
    <div className="border-t border-border/70 bg-muted/25 px-4 py-3">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.composer.queuedFollowUp',
              'Queued follow-up'
            )}
          </div>
          <textarea
            aria-label={translate(
              'auto.components.agentWorkspace.composer.queuedFollowUpMessage',
              'Queued follow-up message'
            )}
            className="min-h-14 w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/10"
            disabled={disabled}
            value={queuedFollowUp.prompt}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="mt-5"
          disabled={disabled}
          aria-label={translate(
            'auto.components.agentWorkspace.composer.deleteQueuedFollowUp',
            'Delete queued follow-up'
          )}
          onClick={onDelete}
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
