import { translate } from '@/i18n/i18n'
import { getAgentComposerPlaceholder } from './agent-composer-readiness'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function AgentComposerTextarea({
  value,
  activeWorktreeId,
  selectedThread,
  disabled,
  statusMessage,
  onChange,
  onPaste,
  onKeyDown
}: {
  value: string
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  disabled: boolean
  statusMessage: string | null
  onChange: (value: string) => void
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}): React.JSX.Element {
  return (
    <textarea
      className="agent-composer-textarea block min-h-32 w-full resize-none bg-transparent px-7 pb-3 pt-6 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed disabled:opacity-60"
      value={value}
      placeholder={getAgentComposerPlaceholder(selectedThread, activeWorktreeId)}
      disabled={disabled}
      aria-label={translate(
        'auto.components.agentWorkspace.composer.messageAgent',
        'Message agent'
      )}
      aria-describedby={statusMessage ? 'agent-workspace-composer-status' : undefined}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
    />
  )
}
