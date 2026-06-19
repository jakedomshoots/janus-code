import { translate } from '@/i18n/i18n'
import { useCallback } from 'react'
import { getAgentComposerPlaceholder } from './agent-composer-readiness'
import type { AgentWorkspaceThread } from './agent-workspace-types'

function isBareSpaceKey(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
  return (
    (event.key === ' ' || event.key === 'Space' || event.key === 'Spacebar') &&
    !event.altKey &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey
  )
}

export function AgentComposerTextarea({
  value,
  activeWorktreeId,
  selectedThread,
  disabled,
  statusMessage,
  slashMenuOpen = false,
  slashCommandsListId,
  activeSlashCommandOptionId,
  onChange,
  onPaste,
  onKeyDown
}: {
  value: string
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  disabled: boolean
  statusMessage: string | null
  slashMenuOpen?: boolean
  slashCommandsListId?: string
  activeSlashCommandOptionId?: string
  onChange: (value: string) => void
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}): React.JSX.Element {
  const handleKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (!isBareSpaceKey(event)) {
        return
      }

      const textarea = event.currentTarget
      const selectionStart = textarea.selectionStart
      const selectionEnd = textarea.selectionEnd
      const currentValue = textarea.value
      const nextValue = `${currentValue.slice(0, selectionStart)} ${currentValue.slice(selectionEnd)}`
      const nextCursor = selectionStart + 1

      // Why: global shortcut scopes can treat Space as activation before the
      // browser inserts text, so the composer owns plain text-space insertion.
      event.preventDefault()
      event.stopPropagation()
      textarea.value = nextValue
      textarea.selectionStart = nextCursor
      textarea.selectionEnd = nextCursor
      onChange(nextValue)
    },
    [onChange]
  )

  return (
    <textarea
      className="agent-composer-textarea block min-h-24 w-full resize-none bg-transparent px-5 pb-2.5 pt-4 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed disabled:opacity-60"
      value={value}
      placeholder={getAgentComposerPlaceholder(selectedThread, activeWorktreeId)}
      disabled={disabled}
      aria-label={translate(
        'auto.components.agentWorkspace.composer.messageAgent',
        'Message agent'
      )}
      aria-describedby={statusMessage ? 'agent-workspace-composer-status' : undefined}
      aria-expanded={slashMenuOpen}
      aria-controls={slashMenuOpen ? slashCommandsListId : undefined}
      aria-activedescendant={slashMenuOpen ? activeSlashCommandOptionId : undefined}
      rows={2}
      onChange={(event) => onChange(event.target.value)}
      onPaste={onPaste}
      onKeyDownCapture={handleKeyDownCapture}
      onKeyDown={onKeyDown}
    />
  )
}
