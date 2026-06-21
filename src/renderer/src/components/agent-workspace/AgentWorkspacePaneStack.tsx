import { translate } from '@/i18n/i18n'
import type { AppState } from '@/store'
import { AgentWorkspacePane } from './AgentWorkspacePane'
import { getActiveAgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { compareAgentTimelineEntries } from './agent-timeline-order'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentWorkspacePanesController } from './agent-workspace-pane-session-state'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import {
  getThreadApproval,
  getThreadDiffs,
  getThreadReview,
  getThreadTimeline
} from './agent-workspace-layout-selectors'
import { openAgentMarkdownArtifact } from './open-agent-markdown-artifact'

export function AgentWorkspacePaneStack({
  snapshot,
  selectedProject,
  projectThreads,
  panesController,
  localUserTimeline,
  terminalDrawerReason,
  openFile,
  onReviewDiffs,
  onMessageSent,
  onOpenTerminalDrawer
}: {
  snapshot: AgentWorkspaceSnapshot
  selectedProject: AgentWorkspaceProject | null
  projectThreads: readonly AgentWorkspaceThread[]
  panesController: AgentWorkspacePanesController
  localUserTimeline: readonly AgentWorkspaceTimelineEntry[]
  terminalDrawerReason: AgentTerminalRevealReason | null
  openFile: AppState['openFile']
  onReviewDiffs: (paneId: string) => void
  onMessageSent: AgentComposerMessageSentHandler
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): React.JSX.Element {
  const {
    panes,
    activePaneId,
    splitDirection,
    setActivePaneId,
    handlePaneThreadSelect,
    handleNewSession,
    handleBeginDraftAgentSession,
    handlePendingAgentLaunch,
    handleUpdateDraftSessionAgent,
    handleSelectDraftSession,
    handleCloseDraftSession,
    handleCloseThread,
    handleSplitPane,
    handleClosePane
  } = panesController

  return (
    <div
      className="flex min-w-0 flex-1 overflow-hidden"
      style={{ flexDirection: splitDirection === 'horizontal' ? 'row' : 'column' }}
    >
      {panes.map((pane, index) => {
        const paneThread = pane.selectedThreadId
          ? (projectThreads.find((thread) => thread.id === pane.selectedThreadId) ?? null)
          : null
        const activeDraftSession = getActiveAgentWorkspaceDraftSession(pane)
        const paneTimeline = getPaneTimeline({
          snapshot,
          paneThread,
          localUserTimeline
        })

        return (
          <div
            key={pane.id}
            className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${
              index > 0
                ? splitDirection === 'horizontal'
                  ? 'border-l border-border'
                  : 'border-t border-border'
                : ''
            }`}
          >
            <AgentWorkspacePane
              activeWorktreeId={snapshot.activeWorktreeId}
              project={selectedProject}
              paneLabel={translate(
                'auto.components.agentWorkspace.layout.paneLabel',
                'Pane {{index}}',
                {
                  index: String(index + 1)
                }
              )}
              active={pane.id === activePaneId}
              hasSplitPanes={panes.length > 1}
              threads={projectThreads}
              thread={paneThread}
              draftSessions={pane.draftSessions}
              selectedDraftSessionId={pane.selectedDraftSessionId}
              activeDraftSession={activeDraftSession}
              approval={getThreadApproval(snapshot, paneThread)}
              timeline={paneTimeline}
              diffs={getThreadDiffs(snapshot, paneThread)}
              review={getThreadReview(snapshot, paneThread)}
              terminalAvailable={snapshot.terminalAvailable}
              browserWorkbenchActive={terminalDrawerReason === 'browser'}
              tabGroupWorkbenchActive={terminalDrawerReason === 'workbench'}
              onFocusPane={() => setActivePaneId(pane.id)}
              onSelectThread={(threadId) => handlePaneThreadSelect(pane.id, threadId)}
              onCloseThread={(threadId) => handleCloseThread(pane.id, threadId)}
              onNewSession={() => handleNewSession(pane.id)}
              onSelectDraftSession={(draftSessionId) =>
                handleSelectDraftSession(pane.id, draftSessionId)
              }
              onCloseDraftSession={(draftSessionId) =>
                handleCloseDraftSession(pane.id, draftSessionId)
              }
              onUpdateDraftSessionAgent={(draftSessionId, agent) =>
                handleUpdateDraftSessionAgent(pane.id, draftSessionId, agent)
              }
              onBeginDraftAgentSession={(agent) => handleBeginDraftAgentSession(agent, pane.id)}
              onPendingAgentLaunch={() => handlePendingAgentLaunch(pane.id)}
              onMessageSent={onMessageSent}
              onOpenMarkdownArtifact={(artifact) =>
                openAgentMarkdownArtifact({ thread: paneThread, artifact, openFile })
              }
              onReviewDiffs={() => onReviewDiffs(pane.id)}
              onSplitPane={(direction) => {
                const splitDirection =
                  direction === 'right' || direction === 'left' ? 'horizontal' : 'vertical'
                handleSplitPane(pane.id, splitDirection)
              }}
              onClosePane={() => handleClosePane(pane.id)}
              onOpenTerminalDrawer={onOpenTerminalDrawer}
            />
          </div>
        )
      })}
    </div>
  )
}

function getPaneTimeline({
  snapshot,
  paneThread,
  localUserTimeline
}: {
  snapshot: AgentWorkspaceSnapshot
  paneThread: AgentWorkspaceThread | null
  localUserTimeline: readonly AgentWorkspaceTimelineEntry[]
}): readonly AgentWorkspaceTimelineEntry[] {
  const backendTimeline = getThreadTimeline(snapshot, paneThread)
  const backendUserPromptKeys = new Set(
    backendTimeline
      .filter((entry) => entry.kind === 'user')
      .map((entry) => `${entry.threadId}:${entry.text}`)
  )
  return [
    ...backendTimeline,
    ...localUserTimeline.filter(
      (entry) =>
        entry.threadId === paneThread?.id &&
        !backendUserPromptKeys.has(`${entry.threadId}:${entry.text}`)
    )
  ].sort((a, b) => {
    // Why: chat transcripts read oldest-to-newest; backend and local
    // optimistic entries arrive from different sources and need one order.
    return compareAgentTimelineEntries(a, b)
  })
}
