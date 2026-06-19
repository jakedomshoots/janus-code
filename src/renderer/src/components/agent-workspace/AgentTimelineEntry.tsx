import {
  Bot,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  ShieldQuestion,
  User,
  Wrench
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import {
  formatAgentWorkspaceTimelineKind,
  formatAgentWorkspaceTimelineStatus
} from './agent-workspace-labels'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function AgentTimelineEntry({
  entry
}: {
  entry: AgentWorkspaceTimelineEntry
}): React.JSX.Element {
  const Icon = getTimelineEntryIcon(entry.kind)
  const isUser = entry.kind === 'user'
  const isAgent = entry.kind === 'agent'
  const statusLabel = entry.status ? formatAgentWorkspaceTimelineStatus(entry.status) : null
  const timestamp = formatAgentTimelineTimestamp(entry.createdAt)
  const roleLabel = getTimelineEntryRoleLabel(entry.kind)

  return (
    <article
      className={cn('group flex min-w-0', isUser ? 'justify-end' : 'justify-start')}
      data-agent-timeline-entry-kind={entry.kind}
      data-agent-timeline-entry-status={entry.status}
    >
      <div
        className={cn(
          'flex min-w-0 max-w-[78%] gap-3 rounded-xl border px-4 py-3',
          isUser
            ? 'border-border bg-accent text-accent-foreground'
            : 'border-border/80 bg-card text-card-foreground shadow-xs',
          entry.kind === 'system' || entry.kind === 'tool' || entry.kind === 'approval'
            ? 'bg-muted/40'
            : null,
          entry.kind === 'error' ? 'bg-destructive/10' : null
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border',
            isUser ? 'border-border bg-background text-foreground' : null,
            isAgent ? 'border-border bg-muted text-foreground' : null,
            !isUser && !isAgent ? 'border-border bg-background text-muted-foreground' : null,
            entry.kind === 'error' ? 'text-destructive' : null
          )}
          aria-hidden="true"
        >
          <Icon className="size-3.5" />
        </span>
        <div className={cn('min-w-0 flex-1', entry.kind === 'error' ? 'text-destructive' : null)}>
          <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{roleLabel}</span>
            {statusLabel ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                {statusLabel}
              </span>
            ) : null}
            {timestamp ? (
              <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                <Clock3 className="size-3" aria-hidden="true" />
                <time dateTime={entry.createdAt ?? undefined}>{timestamp}</time>
              </span>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {entry.text}
          </p>
        </div>
      </div>
    </article>
  )
}

function getTimelineEntryRoleLabel(kind: AgentWorkspaceTimelineEntry['kind']): string {
  switch (kind) {
    case 'user':
      return translate('auto.components.agentWorkspace.timelineRole.you', 'You')
    case 'agent':
      return translate('auto.components.agentWorkspace.timelineRole.agent', 'Agent')
    case 'system':
    case 'tool':
    case 'approval':
    case 'error':
      return formatAgentWorkspaceTimelineKind(kind)
  }
}

function getTimelineEntryIcon(kind: AgentWorkspaceTimelineEntry['kind']): LucideIcon {
  switch (kind) {
    case 'user':
      return User
    case 'agent':
      return Bot
    case 'system':
      return ClipboardCheck
    case 'tool':
      return Wrench
    case 'approval':
      return ShieldQuestion
    case 'error':
      return CircleAlert
  }
}

function formatAgentTimelineTimestamp(value: string | null): string {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}
