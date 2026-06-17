import { AlertTriangle, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentComposer } from './AgentComposer'
import { AgentTimeline } from './AgentTimeline'
import { AgentWorkspaceThreadTabs } from './AgentWorkspaceThreadTabs'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'

function AgentFailureTerminalBanner({
  thread,
  terminalAvailable,
  onOpenTerminalDrawer
}: {
  thread: AgentWorkspaceThread | null
  terminalAvailable: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element | null {
  if (thread?.phase !== 'failed') {
    return null
  }

  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-destructive/25 bg-destructive/10 px-4 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2 text-destructive">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">
          {translate(
            'auto.components.agentWorkspace.layout.threadFailedOpenTerminal',
            'Thread failed. Open the terminal drawer to inspect raw output.'
          )}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="xs"
        disabled={!terminalAvailable || typeof onOpenTerminalDrawer !== 'function'}
        onClick={() => onOpenTerminalDrawer?.('failure')}
      >
        <Terminal className="size-3" aria-hidden="true" />
        {translate('auto.components.agentWorkspace.layout.openTerminalDrawer', 'Open drawer')}
      </Button>
    </div>
  )
}

export function AgentWorkspacePane({
  activeWorktreeId,
  project,
  paneLabel,
  active,
  hasSplitPanes,
  threads,
  thread,
  timeline,
  terminalAvailable,
  onFocusPane,
  onSelectThread,
  onNewSession,
  onSplitRight,
  onSplitDown,
  onClosePane,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  project: AgentWorkspaceProject | null
  paneLabel: string
  active: boolean
  hasSplitPanes: boolean
  threads: readonly AgentWorkspaceThread[]
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
  onFocusPane: () => void
  onSelectThread: (threadId: string) => void
  onNewSession: () => void
  onSplitRight: () => void
  onSplitDown: () => void
  onClosePane: () => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const browserWorkbench = useAgentBrowserWorkbench({
    activeWorktreeId,
    onOpenTerminalDrawer
  })

  return (
    <main
      className={`flex min-w-0 flex-1 flex-col bg-background ${
        active ? 'outline outline-1 -outline-offset-1 outline-accent/55' : ''
      }`}
      onPointerDown={onFocusPane}
    >
      <AgentFailureTerminalBanner
        thread={thread}
        terminalAvailable={terminalAvailable}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
      <AgentWorkspaceThreadTabs
        paneLabel={paneLabel}
        threads={threads}
        selectedThreadId={thread?.id ?? null}
        hasSplitPanes={hasSplitPanes}
        onFocusPane={onFocusPane}
        onSelectThread={onSelectThread}
        onNewSession={onNewSession}
        browserAvailable={browserWorkbench.browserAvailable}
        browserTabCount={browserWorkbench.browserTabCount}
        onOpenBrowserWorkbench={browserWorkbench.openBrowserWorkbench}
        onSplitRight={onSplitRight}
        onSplitDown={onSplitDown}
        onClosePane={onClosePane}
      />
      <AgentTimeline
        thread={thread}
        timeline={timeline}
        terminalAvailable={terminalAvailable}
        browserAvailable={browserWorkbench.browserAvailable}
        onNewSession={onNewSession}
        onOpenBrowserWorkbench={browserWorkbench.openBrowserWorkbench}
        onOpenTerminalDrawer={
          onOpenTerminalDrawer ? () => onOpenTerminalDrawer('debug-button') : undefined
        }
      />
      <AgentComposer
        activeWorktreeId={activeWorktreeId}
        selectedProject={project}
        selectedThread={thread}
        terminalAvailable={terminalAvailable}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
    </main>
  )
}
