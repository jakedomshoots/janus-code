import { Columns2, Plus, Rows2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function AgentWorkspaceThreadTabs({
  paneLabel,
  threads,
  selectedThreadId,
  canClosePane,
  onFocusPane,
  onSelectThread,
  onNewSession,
  onSplitRight,
  onSplitDown,
  onClosePane
}: {
  paneLabel: string
  threads: readonly AgentWorkspaceThread[]
  selectedThreadId: string | null
  canClosePane: boolean
  onFocusPane: () => void
  onSelectThread: (threadId: string) => void
  onNewSession: () => void
  onSplitRight: () => void
  onSplitDown: () => void
  onClosePane: () => void
}): React.JSX.Element {
  return (
    <div className="h-9 shrink-0 border-b border-border/60 bg-card">
      <div className="flex h-full min-w-0 items-stretch">
        <div
          className="scrollbar-sleek flex min-w-0 flex-1 items-end gap-1 overflow-x-auto px-2 pt-1"
          role="tablist"
          aria-label={translate(
            'auto.components.agentWorkspace.threadTabs.agentSessions',
            'Agent sessions'
          )}
        >
          {threads.length > 0 ? (
            threads.map((thread) => (
              <ThreadTab
                key={thread.id}
                thread={thread}
                selected={thread.id === selectedThreadId}
                onSelect={() => {
                  onFocusPane()
                  onSelectThread(thread.id)
                }}
              />
            ))
          ) : (
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="flex h-8 max-w-64 shrink-0 items-center gap-2 rounded-t-md border border-b-background bg-background px-3 text-xs text-foreground"
              onClick={() => {
                onFocusPane()
                onNewSession()
              }}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              <span className="truncate font-medium">
                {translate('auto.components.agentWorkspace.threadTabs.newSession', 'New session')}
              </span>
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 px-2">
          <span className="hidden text-[11px] text-muted-foreground lg:inline">{paneLabel}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={translate(
              'auto.components.agentWorkspace.threadTabs.startNewSession',
              'Start new session'
            )}
            title={translate(
              'auto.components.agentWorkspace.threadTabs.startNewSession',
              'Start new session'
            )}
            onClick={() => {
              onFocusPane()
              onNewSession()
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={translate(
              'auto.components.agentWorkspace.threadTabs.splitRight',
              'Split right'
            )}
            title={translate('auto.components.agentWorkspace.threadTabs.splitRight', 'Split right')}
            onClick={onSplitRight}
          >
            <Columns2 className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={translate(
              'auto.components.agentWorkspace.threadTabs.splitDown',
              'Split down'
            )}
            title={translate('auto.components.agentWorkspace.threadTabs.splitDown', 'Split down')}
            onClick={onSplitDown}
          >
            <Rows2 className="size-4" aria-hidden="true" />
          </Button>
          {canClosePane ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={translate(
                'auto.components.agentWorkspace.threadTabs.closePane',
                'Close pane'
              )}
              title={translate('auto.components.agentWorkspace.threadTabs.closePane', 'Close pane')}
              onClick={onClosePane}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
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
        'group flex h-8 max-w-64 shrink-0 items-center gap-2 rounded-t-md border px-3 text-xs transition-colors',
        selected
          ? 'border-border border-b-background bg-background text-foreground'
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
