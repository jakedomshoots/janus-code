import { useCallback } from 'react'
import { AlertTriangle, Terminal } from 'lucide-react'
import type { TuiAgent } from '../../../../shared/types'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentApprovalBanner } from './AgentApprovalBanner'
import { AgentComposer } from './AgentComposer'
import { AgentTimeline } from './AgentTimeline'
import { AgentWorkspaceThreadTabs } from './AgentWorkspaceThreadTabs'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import type { AgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import { AgentBrowserWorkbenchSurface } from './AgentBrowserWorkbenchSurface'
import { AgentTabGroupWorkbenchSurface } from './AgentTabGroupWorkbenchSurface'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'
import { sendAgentTerminalChoice } from '@/lib/active-agent-terminal-choice'

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
  approval,
  timeline,
  diffs,
  terminalAvailable,
  browserWorkbenchActive,
  tabGroupWorkbenchActive,
  onFocusPane,
  onSelectThread,
  onCloseThread,
  onNewSession,
  draftSessions,
  selectedDraftSessionId,
  activeDraftSession,
  onSelectDraftSession,
  onCloseDraftSession,
  onUpdateDraftSessionAgent,
  onBeginDraftAgentSession,
  onPendingAgentLaunch,
  onMessageSent,
  onOpenMarkdownArtifact,
  onReviewDiffs,
  onSplitPane,
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
  approval: AgentWorkspaceApproval | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  diffs: readonly AgentWorkspaceDiffSummary[]
  terminalAvailable: boolean
  browserWorkbenchActive: boolean
  tabGroupWorkbenchActive: boolean
  onFocusPane: () => void
  onSelectThread: (threadId: string) => void
  onCloseThread: (threadId: string) => void
  onNewSession: () => void
  draftSessions: readonly AgentWorkspaceDraftSession[]
  selectedDraftSessionId: string | null
  activeDraftSession: AgentWorkspaceDraftSession | null
  onSelectDraftSession: (draftSessionId: string) => void
  onCloseDraftSession: (draftSessionId: string) => void
  onUpdateDraftSessionAgent: (draftSessionId: string, agent: TuiAgent) => void
  onBeginDraftAgentSession: (agent: TuiAgent) => void
  onPendingAgentLaunch: () => void
  onMessageSent: AgentComposerMessageSentHandler
  onOpenMarkdownArtifact?: (artifact: AgentTimelineMarkdownArtifact) => void
  onReviewDiffs?: () => void
  onSplitPane: (direction: 'right' | 'down' | 'left' | 'up') => void
  onClosePane: () => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): React.JSX.Element {
  const browserWorkbench = useAgentBrowserWorkbench({
    activeWorktreeId,
    browserWorkbenchActive,
    onOpenTerminalDrawer
  })
  const workbenchSurfaceActive = browserWorkbenchActive || tabGroupWorkbenchActive
  const handleDraftSessionAgentChange = useCallback(
    (agent: TuiAgent) => {
      if (!activeDraftSession) {
        return
      }
      onUpdateDraftSessionAgent(activeDraftSession.id, agent)
    },
    [activeDraftSession, onUpdateDraftSessionAgent]
  )
  const handleSelectTimelineChoice = useCallback(
    async (_entry: AgentWorkspaceTimelineEntry, choice: { input: string }) => {
      if (!thread) {
        return
      }
      await sendAgentTerminalChoice({
        worktreeId: thread.worktreeId,
        threadId: thread.id,
        input: choice.input
      })
    },
    [thread]
  )

  function dismissWorkbenchSurfaces(): void {
    if (workbenchSurfaceActive) {
      onOpenTerminalDrawer?.(null)
    }
  }

  return (
    <main
      className={`agent-workspace-pane flex min-w-0 flex-1 flex-col bg-background ${
        active ? 'outline outline-1 -outline-offset-1 outline-accent/55' : ''
      }`}
      onPointerDown={onFocusPane}
    >
      <AgentFailureTerminalBanner
        thread={thread}
        terminalAvailable={terminalAvailable}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
      {thread?.phase === 'needs-approval' && approval ? (
        <AgentApprovalBanner
          thread={thread}
          approval={approval}
          terminalAvailable={terminalAvailable}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      ) : null}
      <AgentWorkspaceThreadTabs
        activeWorktreeId={activeWorktreeId}
        paneLabel={paneLabel}
        threads={threads}
        selectedThreadId={thread?.id ?? null}
        draftSessions={draftSessions}
        selectedDraftSessionId={selectedDraftSessionId}
        hasSplitPanes={hasSplitPanes}
        onFocusPane={onFocusPane}
        onSelectThread={(threadId) => {
          dismissWorkbenchSurfaces()
          onSelectThread(threadId)
        }}
        onCloseThread={onCloseThread}
        onSelectDraftSession={(draftSessionId) => {
          dismissWorkbenchSurfaces()
          onSelectDraftSession(draftSessionId)
        }}
        onCloseDraftSession={onCloseDraftSession}
        browserAvailable={browserWorkbench.browserAvailable}
        browserWorkbenchActive={browserWorkbenchActive}
        tabGroupWorkbenchActive={tabGroupWorkbenchActive}
        onOpenBrowserWorkbench={browserWorkbench.openBrowserWorkbench}
        onDismissWorkbenchSurface={dismissWorkbenchSurfaces}
        onBeginDraftAgentSession={onBeginDraftAgentSession}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
        onSplitPane={onSplitPane}
        onClosePane={onClosePane}
      />
      <div className="agent-workspace-chat-surface relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {browserWorkbenchActive && activeWorktreeId ? (
          <AgentBrowserWorkbenchSurface worktreeId={activeWorktreeId} />
        ) : tabGroupWorkbenchActive && activeWorktreeId ? (
          <AgentTabGroupWorkbenchSurface worktreeId={activeWorktreeId} />
        ) : (
          <>
            <AgentTimeline
              thread={thread}
              timeline={timeline}
              onNewSession={onNewSession}
              onOpenBrowserWorkbench={() => browserWorkbench.openBrowserWorkbench()}
              onOpenTerminalDrawer={() => onOpenTerminalDrawer?.('debug-button')}
              browserAvailable={browserWorkbench.browserAvailable}
              terminalAvailable={terminalAvailable}
              diffs={diffs}
              onOpenMarkdownArtifact={onOpenMarkdownArtifact}
              onSelectChoice={handleSelectTimelineChoice}
              onReviewDiffs={onReviewDiffs}
            />
            <AgentComposer
              key={activeDraftSession?.id ?? 'thread-composer'}
              activeWorktreeId={activeWorktreeId}
              selectedProject={project}
              selectedThread={thread}
              timeline={timeline}
              draftSessionId={thread ? null : (activeDraftSession?.id ?? null)}
              terminalAvailable={terminalAvailable}
              browserWorkbench={browserWorkbench}
              pendingDraftAgent={activeDraftSession?.preferredAgent ?? null}
              onDraftSessionAgentChange={thread ? undefined : handleDraftSessionAgentChange}
              onPendingAgentLaunch={onPendingAgentLaunch}
              onMessageSent={onMessageSent}
              onOpenTerminalDrawer={onOpenTerminalDrawer}
            />
          </>
        )}
      </div>
    </main>
  )
}
