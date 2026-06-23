import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import {
  Bot,
  Check,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Copy,
  Loader2,
  ShieldQuestion,
  User,
  Wrench
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { translate } from '@/i18n/i18n'
import { openHttpLink } from '@/lib/http-link-routing'
import { cn } from '@/lib/utils'
import {
  formatAgentWorkspaceTimelineKind,
  formatAgentWorkspaceTimelineStatus
} from './agent-workspace-labels'
import { getTimelineSlashCommand } from './agent-timeline-slash-command'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import { AgentMarkdownArtifactCard } from './AgentTimelineArtifactCards'
import {
  getAgentTimelineMarkdownArtifacts,
  type AgentTimelineMarkdownArtifact
} from './agent-timeline-artifacts'
import { AgentTimelineMarkdownImage } from './AgentTimelineMarkdownImage'

const AGENT_MESSAGE_REMARK_PLUGINS = [remarkGfm, remarkBreaks]
const AGENT_MESSAGE_REHYPE_PLUGINS = [rehypeHighlight]
const AGENT_MESSAGE_BASE_MARKDOWN_COMPONENTS: Components = {
  img: AgentTimelineMarkdownImage,
  pre: AgentTimelineCodeBlock
}

export function AgentTimelineEntry({
  entry,
  cwd = null,
  worktreeId = null,
  onOpenMarkdownArtifact
}: {
  entry: AgentWorkspaceTimelineEntry
  cwd?: string | null
  worktreeId?: string | null
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

  return (
    <article
      className={cn('group flex min-w-0', isUser ? 'justify-end' : 'justify-start')}
      data-agent-timeline-entry-kind={entry.kind}
      data-agent-timeline-entry-status={entry.status}
      aria-label={entryLabel}
      aria-busy={isLive ? 'true' : undefined}
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
          <Icon className={cn('size-3.5', isLive ? 'animate-spin' : null)} />
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
            {slashCommand ? (
              <span
                className="inline-flex items-center gap-1 border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                data-agent-command-label={slashCommand}
              >
                {translate('auto.components.agentWorkspace.timeline.command', 'Command')}
                <span className="text-foreground">{slashCommand}</span>
              </span>
            ) : null}
          </div>
          <AgentTimelineMessageBody entry={entry} worktreeId={worktreeId} />
          {markdownArtifacts.map((artifact) => (
            <AgentMarkdownArtifactCard
              key={artifact.id}
              artifact={artifact}
              onOpen={onOpenMarkdownArtifact}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function AgentTimelineMessageBody({
  entry,
  worktreeId
}: {
  entry: AgentWorkspaceTimelineEntry
  worktreeId?: string | null
}): React.JSX.Element {
  const markdownComponents = useMemo(
    () => getAgentMessageMarkdownComponents(worktreeId),
    [worktreeId]
  )

  if (entry.kind === 'agent') {
    return (
      <div
        data-agent-message-markdown="true"
        className="agent-timeline-markdown markdown-body text-sm leading-relaxed text-foreground"
      >
        <Markdown
          components={markdownComponents}
          remarkPlugins={AGENT_MESSAGE_REMARK_PLUGINS}
          rehypePlugins={AGENT_MESSAGE_REHYPE_PLUGINS}
        >
          {entry.text}
        </Markdown>
      </div>
    )
  }

  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
      {entry.text}
    </p>
  )
}

function getAgentMessageMarkdownComponents(worktreeId?: string | null): Components {
  return {
    ...AGENT_MESSAGE_BASE_MARKDOWN_COMPONENTS,
    a: ({ href, children, ...props }) => (
      <AgentTimelineMarkdownLink href={href} worktreeId={worktreeId} {...props}>
        {children}
      </AgentTimelineMarkdownLink>
    )
  }
}

function AgentTimelineMarkdownLink({
  href,
  worktreeId,
  children,
  onClick,
  ...props
}: React.ComponentProps<'a'> & {
  worktreeId?: string | null
}): React.JSX.Element {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented || !href) {
      return
    }

    const httpHref = getAgentTimelineHttpHref(href)
    if (!httpHref) {
      return
    }

    event.preventDefault()
    const forceSystemBrowser = isAgentTimelineSystemBrowserModifier(event)
    // Why: chat is not a navigation surface; HTTP links should honor Janus's
    // in-app browser and remote-runtime link-routing rules.
    openHttpLink(httpHref, forceSystemBrowser ? { worktreeId, forceSystemBrowser } : { worktreeId })
  }

  return (
    <a href={href} {...props} onClick={handleClick}>
      {children}
    </a>
  )
}

function getAgentTimelineHttpHref(href: string): string | null {
  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function isAgentTimelineSystemBrowserModifier(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  const isMac = navigator.userAgent.includes('Mac')
  return event.shiftKey && (isMac ? event.metaKey : event.ctrlKey)
}

function AgentTimelineCodeBlock({
  children,
  ...props
}: React.ComponentProps<'pre'>): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<number | null>(null)
  const codeText = getReactNodeText(children).replace(/\n$/, '')
  const codeLanguage = getCodeBlockLanguage(children)
  const codeLanguageLabel = codeLanguage ? formatCodeBlockLanguageLabel(codeLanguage) : null

  const clearResetTimer = useCallback((): void => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  useEffect(() => clearResetTimer, [clearResetTimer])

  const handleCopy = useCallback((): void => {
    const writeClipboardText =
      window.api?.ui?.writeClipboardText ??
      navigator.clipboard?.writeText?.bind(navigator.clipboard)
    if (!codeText || !writeClipboardText) {
      return
    }
    void writeClipboardText(codeText)
      .then(() => {
        clearResetTimer()
        setCopied(true)
        resetTimerRef.current = window.setTimeout(() => {
          resetTimerRef.current = null
          setCopied(false)
        }, 1500)
      })
      .catch(() => {
        /* best-effort */
      })
  }, [clearResetTimer, codeText])

  return (
    <div className="agent-timeline-code-block" data-agent-code-block="true">
      <div className="agent-timeline-code-block-header">
        {codeLanguage && codeLanguageLabel ? (
          <span className="agent-timeline-code-language" data-agent-code-language={codeLanguage}>
            {codeLanguageLabel}
          </span>
        ) : null}
        <button
          type="button"
          className="agent-timeline-code-copy-button"
          onClick={handleCopy}
          disabled={!codeText}
          aria-label={translate(
            'auto.components.agentWorkspace.timeline.copyCode',
            'Copy code block'
          )}
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
          <span>
            {copied
              ? translate('auto.components.agentWorkspace.timeline.copied', 'Copied')
              : translate('auto.components.agentWorkspace.timeline.copy', 'Copy')}
          </span>
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

function getCodeBlockLanguage(node: ReactNode): string | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const language = getCodeBlockLanguage(child)
      if (language) {
        return language
      }
    }
    return null
  }
  if (!isValidElement<{ className?: string; children?: ReactNode }>(node)) {
    return null
  }
  const className = node.props.className ?? ''
  const language = className.match(/\blanguage-([^\s]+)/)?.[1]?.trim()
  return language ? language.toLowerCase() : getCodeBlockLanguage(node.props.children)
}

function formatCodeBlockLanguageLabel(language: string): string {
  switch (language) {
    case 'js':
      return 'JavaScript'
    case 'jsx':
      return 'JSX'
    case 'ts':
      return 'TypeScript'
    case 'tsx':
      return 'TSX'
    case 'py':
    case 'python':
      return 'Python'
    case 'sh':
    case 'shell':
    case 'bash':
      return 'Shell'
    case 'md':
    case 'markdown':
      return 'Markdown'
    case 'json':
      return 'JSON'
    case 'yaml':
    case 'yml':
      return 'YAML'
    default:
      return language.toUpperCase()
  }
}

function getReactNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map((child) => getReactNodeText(child)).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getReactNodeText(node.props.children)
  }
  return ''
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
