import { MessageSquareText } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function AgentWorkspaceThreadTabs({
  threads,
  selectedThreadId,
  onSelectThread,
  onNewSession
}: {
  threads: readonly AgentWorkspaceThread[]
  selectedThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewSession: () => void
}): React.JSX.Element {
  return (
    <div className="border-b border-border/60 bg-background px-3 py-2">
      <div className="flex min-w-0 items-center">
        <div
          className="scrollbar-sleek flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          role="tablist"
          aria-label={translate(
            'auto.components.agentWorkspace.threadTabs.agentSessions',
            'Agent sessions'
          )}
        >
          {threads.map((thread) => (
            <ThreadTab
              key={thread.id}
              thread={thread}
              selected={thread.id === selectedThreadId}
              onSelect={() => onSelectThread(thread.id)}
            />
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={selectedThreadId === null}
            className={cn(
              'flex h-8 max-w-52 shrink-0 items-center gap-2 rounded-md border px-3 text-xs transition-colors',
              selectedThreadId === null
                ? 'border-border bg-muted/35 text-foreground shadow-xs'
                : 'border-transparent bg-muted/25 text-muted-foreground hover:bg-muted/45 hover:text-foreground'
            )}
            onClick={onNewSession}
          >
            <MessageSquareText className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {translate('auto.components.agentWorkspace.header.newSession', 'New session')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function ThreadTab({
  thread,
  selected,
  onSelect
}: {
  thread: AgentWorkspaceThread
  selected: boolean
  onSelect: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        'group flex h-8 max-w-64 shrink-0 items-center gap-2 rounded-md border px-3 text-xs transition-colors',
        selected
          ? 'border-border bg-muted/35 text-foreground shadow-xs'
          : 'border-transparent bg-muted/25 text-muted-foreground hover:bg-muted/45 hover:text-foreground'
      )}
      onClick={onSelect}
    >
      <AgentIcon agent={agentTypeToIconAgent(thread.agentKind)} size={14} />
      <span className="truncate font-medium">{thread.title}</span>
      <span className="hidden shrink-0 text-muted-foreground/80 sm:inline">
        {formatAgentTypeLabel(thread.agentKind)}
      </span>
      <span className="hidden shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:text-foreground md:inline">
        {formatAgentWorkspacePhase(thread.phase)}
      </span>
    </button>
  )
}
