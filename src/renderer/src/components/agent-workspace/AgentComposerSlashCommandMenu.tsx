import { Sparkles } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentComposerSlashCommand } from './agent-composer-slash-command-model'

export function AgentComposerSlashCommandMenu({
  id,
  optionIdPrefix,
  commands,
  activeIndex,
  onActiveIndexChange,
  onSelect
}: {
  id: string
  optionIdPrefix: string
  commands: readonly AgentComposerSlashCommand[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  onSelect: (command: AgentComposerSlashCommand) => void
}): React.JSX.Element | null {
  if (commands.length === 0) {
    return null
  }

  return (
    <div className="px-3 pt-3">
      <div
        id={id}
        className="rounded-lg border border-border bg-popover text-popover-foreground shadow-xs"
        role="listbox"
        aria-label={translate(
          'auto.components.agentWorkspace.composer.slashCommands',
          'Slash commands'
        )}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.composer.slashCommands', 'Slash commands')}
        </div>
        <div className="scrollbar-sleek max-h-56 overflow-y-auto p-1">
          {commands.map((item, index) => (
            <button
              key={item.command}
              id={`${optionIdPrefix}-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              data-command={item.command}
              className={cn(
                'flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm outline-none',
                index === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
              )}
              onMouseEnter={() => onActiveIndexChange(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(item)}
            >
              <span className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                {item.command}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-foreground">
                  {translate(item.titleKey, item.titleFallback)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {translate(item.descriptionKey, item.descriptionFallback)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
