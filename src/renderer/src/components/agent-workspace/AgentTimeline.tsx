import {
  Brain,
  Clock3,
  GitBranch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Terminal
} from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { AgentTimelineEntry } from './AgentTimelineEntry'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function AgentTimeline({
  thread,
  timeline
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): React.JSX.Element {
  return (
    <div className="scrollbar-sleek flex min-h-0 flex-1 flex-col overflow-auto px-4 py-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {thread ? (
          <>
            <ThreadSummary thread={thread} />
            {timeline.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.timelineEventsWillAppear',
                  'Timeline events will appear here as the agent works.'
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {timeline.map((entry) => (
                  <AgentTimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </>
        ) : (
          <WorkbenchEmptyState />
        )}
      </div>
    </div>
  )
}

function WorkbenchEmptyState(): React.JSX.Element {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-11 items-center justify-center rounded-md border border-border bg-muted/25 text-foreground">
        <Sparkles className="size-5" aria-hidden="true" />
      </div>
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.readyForJanusSession',
            'Ready for a Janus session'
          )}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.newSessionHint',
            'Describe the coding task below. Janus will start the selected agent in this workspace.'
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.composer.permissions', 'Permissions')}
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
          <Brain className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.composer.thinking', 'Thinking')}
        </span>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
          <Terminal className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
        </span>
      </div>
    </div>
  )
}

function ThreadSummary({ thread }: { thread: AgentWorkspaceThread }): React.JSX.Element {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquareText className="size-4" aria-hidden="true" />
        {thread.title}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="size-3" aria-hidden="true" />
          {thread.branchName ??
            translate('auto.components.agentWorkspace.layout.noBranch', 'No branch')}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 className="size-3" aria-hidden="true" />
          {thread.updatedAt ??
            translate('auto.components.agentWorkspace.layout.noUpdatesYet', 'No updates yet')}
        </span>
      </div>
    </div>
  )
}
