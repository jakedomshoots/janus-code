import { Clock3, GitBranch, Globe, MessageSquareText, PanelBottom, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentTimelineEntry } from './AgentTimelineEntry'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function AgentTimeline({
  thread,
  timeline,
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  browserAvailable = false,
  terminalAvailable = false
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
  browserAvailable?: boolean
  terminalAvailable?: boolean
}): React.JSX.Element {
  return (
    <div className="scrollbar-sleek flex min-h-0 flex-1 flex-col overflow-auto px-6 py-10">
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
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
              <div className="flex flex-col gap-6">
                {timeline.map((entry) => (
                  <AgentTimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </>
        ) : (
          <WorkbenchEmptyState
            onNewSession={onNewSession}
            onOpenBrowserWorkbench={onOpenBrowserWorkbench}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            browserAvailable={browserAvailable}
            terminalAvailable={terminalAvailable}
          />
        )}
      </div>
    </div>
  )
}

function WorkbenchEmptyState({
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  browserAvailable,
  terminalAvailable
}: {
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
  browserAvailable: boolean
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
      <h2 className="text-2xl font-semibold text-foreground">
        {translate('auto.components.agentWorkspace.layout.janusCode', 'Janus Code')}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {typeof onNewSession === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onNewSession}
          >
            <Plus className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.newSession', 'New session')}
          </Button>
        ) : null}
        {browserAvailable && typeof onOpenBrowserWorkbench === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onOpenBrowserWorkbench}
          >
            <Globe className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.openBrowser', 'Browser')}
          </Button>
        ) : null}
        {terminalAvailable && typeof onOpenTerminalDrawer === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onOpenTerminalDrawer}
          >
            <PanelBottom className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.openTerminal', 'Terminal')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function ThreadSummary({ thread }: { thread: AgentWorkspaceThread }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
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
