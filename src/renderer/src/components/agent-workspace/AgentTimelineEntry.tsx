import {
  Bot,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Loader2,
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
import { AgentMarkdownArtifactCard } from './AgentTimelineArtifactCards'
import {
  getAgentTimelineMarkdownArtifacts,
  type AgentTimelineMarkdownArtifact
} from './agent-timeline-artifacts'
import CommentMarkdown from '../sidebar/CommentMarkdown'

export function AgentTimelineEntry({
  entry,
  cwd = null,
  onOpenMarkdownArtifact
}: {
  entry: AgentWorkspaceTimelineEntry
  cwd?: string | null
  onOpenMarkdownArtifact?: (artifact: AgentTimelineMarkdownArtifact) => void
}): React.JSX.Element {
  const isUser = entry.kind === 'user'
  const isAgent = entry.kind === 'agent'
  const statusLabel = entry.status ? formatAgentWorkspaceTimelineStatus(entry.status) : null
  const timestamp = formatAgentTimelineTimestamp(entry.createdAt)
  const roleLabel = getTimelineEntryRoleLabel(entry.kind)
  const slashCommand = getTimelineSlashCommand(entry)
  const isLive = entry.status === 'pending' || entry.status === 'running'
  const Icon = isLive ? Loader2 : getTimelineEntryIcon(entry.kind)
  const entryLabel = [roleLabel, statusLabel, slashCommand].filter(Boolean).join(', ')
  const markdownArtifacts =
    entry.kind === 'agent' ? getAgentTimelineMarkdownArtifacts({ text: entry.text, cwd }) : []
  const avatar = (
    <span
      className={cn(
        'agent-timeline-avatar mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border',
        isUser ? 'border-border bg-background text-foreground shadow-xs' : null,
        isAgent ? 'border-border/80 bg-muted text-foreground shadow-xs' : null,
        !isUser && !isAgent ? 'border-border bg-background text-muted-foreground' : null,
        entry.kind === 'error' ? 'text-destructive' : null
      )}
      aria-hidden="true"
    >
      <Icon className={cn('size-3.5', isLive ? 'animate-spin' : null)} />
    </span>
  )

  return (
    <article
      className={cn(
        'group flex min-w-0 items-start gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
      data-agent-timeline-entry-kind={entry.kind}
      data-agent-timeline-entry-status={entry.status}
      aria-label={entryLabel}
      aria-busy={isLive ? 'true' : undefined}
    >
      {isUser ? null : avatar}
      <div
        className={cn(
          'agent-timeline-bubble min-w-0 max-w-[min(74%,42rem)] rounded-2xl border px-4 py-3 shadow-xs',
          isUser
            ? 'rounded-br-md border-border/80 bg-secondary text-secondary-foreground'
            : 'rounded-bl-md border-border/80 bg-card/95 text-card-foreground',
          entry.kind === 'system' || entry.kind === 'tool' || entry.kind === 'approval'
            ? 'bg-muted/40 text-foreground'
            : null,
          entry.kind === 'error' ? 'bg-destructive/10 text-destructive' : null
        )}
        data-agent-timeline-bubble="true"
      >
        <div className={cn('min-w-0 flex-1', entry.kind === 'error' ? 'text-destructive' : null)}>
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                'text-xs font-semibold',
                isUser ? 'text-secondary-foreground' : 'text-foreground'
              )}
            >
              {roleLabel}
            </span>
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
            {slashCommand ? (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                data-agent-command-label={slashCommand}
              >
                {translate('auto.components.agentWorkspace.timeline.command', 'Command')}
                <span className="text-foreground">{slashCommand}</span>
              </span>
            ) : null}
          </div>
          {isAgent ? (
            <CommentMarkdown
              variant="document"
              content={entry.text}
              className="agent-timeline-markdown text-sm leading-6 text-foreground"
            />
          ) : (
            <p
              className={cn(
                'whitespace-pre-wrap break-words text-sm leading-6',
                isUser ? 'text-secondary-foreground' : 'text-foreground',
                entry.kind === 'error' ? 'text-destructive' : null
              )}
            >
              {entry.text}
            </p>
          )}
          {markdownArtifacts.map((artifact) => (
            <AgentMarkdownArtifactCard
              key={artifact.id}
              artifact={artifact}
              onOpen={onOpenMarkdownArtifact}
            />
          ))}
        </div>
      </div>
      {isUser ? avatar : null}
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

function getTimelineSlashCommand(entry: AgentWorkspaceTimelineEntry): string | null {
  if (entry.kind !== 'user') {
    return null
  }
  const [firstToken] = entry.text.trim().split(/\s+/, 1)
  if (!firstToken?.startsWith('/') || firstToken.length === 1) {
    return null
  }
  return firstToken
}
