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
import { Badge } from '@/components/ui/badge'
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
  const statusLabel = entry.status ? formatAgentWorkspaceTimelineStatus(entry.status) : null
  const timestamp = formatAgentTimelineTimestamp(entry.createdAt)

  return (
    <article
      className={cn('group flex min-w-0', isUser ? 'justify-end' : 'justify-start')}
      data-agent-timeline-entry-kind={entry.kind}
      data-agent-timeline-entry-status={entry.status}
    >
      <div
        className={cn(
          'flex min-w-0 max-w-[82%] gap-2',
          isUser ? 'flex-row-reverse items-start' : 'items-start'
        )}
      >
        <span
          className={cn(
            'mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground',
            entry.kind === 'error' ? 'text-destructive' : null
          )}
          aria-hidden="true"
        >
          <Icon className="size-3.5" />
        </span>
        <div
          className={cn(
            'min-w-0 rounded-2xl border px-4 py-3 shadow-xs',
            entry.kind === 'user'
              ? 'border-border bg-card text-card-foreground'
              : 'border-border bg-background',
            entry.kind === 'system' || entry.kind === 'tool' || entry.kind === 'approval'
              ? 'bg-card/70'
              : null,
            entry.kind === 'error'
              ? 'border-destructive/35 bg-destructive/10 text-destructive'
              : null
          )}
        >
          <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant={entry.kind === 'error' ? 'destructive' : 'outline'}
              className="h-5 px-1.5 text-[11px] font-medium"
            >
              {formatAgentWorkspaceTimelineKind(entry.kind)}
            </Badge>
            {statusLabel ? (
              <span className="text-[11px] text-muted-foreground">{statusLabel}</span>
            ) : null}
            {timestamp ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
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
