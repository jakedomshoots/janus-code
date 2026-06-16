import { Bot, Clock3, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentWorkspacePhase, AgentWorkspaceThread } from './agent-workspace-types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'

function getStatusBadgeClassName(phase: AgentWorkspacePhase): string {
  switch (phase) {
    case 'running':
    case 'completed':
      return 'border-status-success-border bg-status-success-background text-status-success'
    case 'failed':
      return 'border-destructive/25 bg-destructive/10 text-destructive'
    case 'needs-approval':
    case 'waiting-for-user':
      return 'border-primary/20 bg-primary/5 text-foreground'
    case 'starting':
      return 'border-ring/20 bg-accent/60 text-foreground'
    case 'disconnected':
    case 'idle':
      return 'border-border bg-background/60 text-muted-foreground'
  }
}

function AgentThreadStatusBadge({ phase }: { phase: AgentWorkspacePhase }): React.JSX.Element {
  return (
    <Badge
      variant="outline"
      data-agent-thread-status={phase}
      className={cn(
        'h-5 rounded-md px-1.5 text-[10px] font-medium leading-none',
        getStatusBadgeClassName(phase)
      )}
    >
      {formatAgentWorkspacePhase(phase)}
    </Badge>
  )
}

export function AgentThreadList({
  projectId,
  threads,
  selectedThreadId,
  onSelectThread
}: {
  projectId: string
  threads: readonly AgentWorkspaceThread[]
  selectedThreadId: string | null
  onSelectThread: (projectId: string, threadId: string) => void
}): React.JSX.Element {
  if (threads.length === 0) {
    return (
      <div className="flex h-7 items-center px-2 text-[11px] text-muted-foreground/70">
        {translate('auto.components.agentWorkspace.layout.noThreads', 'No threads')}
      </div>
    )
  }

  return (
    <div className="space-y-0.5" role="listbox">
      {threads.map((thread) => {
        const selected = thread.id === selectedThreadId
        return (
          <button
            key={thread.id}
            type="button"
            role="option"
            aria-selected={selected}
            data-current={selected ? 'true' : undefined}
            onClick={() => onSelectThread(projectId, thread.id)}
            className={cn(
              'group flex w-full min-w-0 flex-col gap-1 rounded-md px-2 py-1.5 text-left text-xs outline-none transition-colors',
              'hover:bg-worktree-sidebar-accent hover:text-worktree-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-worktree-sidebar-ring',
              selected
                ? 'bg-worktree-sidebar-accent text-worktree-sidebar-accent-foreground'
                : 'text-worktree-sidebar-foreground'
            )}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <Bot className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium">{thread.title}</span>
              <AgentThreadStatusBadge phase={thread.phase} />
            </div>
            <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1">
                <GitBranch className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {thread.branchName ??
                    translate('auto.components.agentWorkspace.layout.noBranch', 'No branch')}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <Clock3 className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {thread.updatedAt ??
                    translate(
                      'auto.components.agentWorkspace.layout.noUpdatesYet',
                      'No updates yet'
                    )}
                </span>
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
