import { translate } from '@/i18n/i18n'
import type { TuiAgent } from '../../../../shared/types'
import { getActiveAgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import { mergeAgentWorkspacePaneTimeline } from './agent-workspace-pane-timeline'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentWorkspacePanesController } from './agent-workspace-pane-session-state'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import {
  getThreadApproval,
  getThreadDiffs,
  getThreadTimeline
} from './agent-workspace-layout-selectors'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentWorkspacePane } from './AgentWorkspacePane'

export function AgentWorkspacePaneList({
  snapshot,
  project,
  projectThreads,
  panesController,
  localUserTimeline,
  terminalDrawerReason,
  onMessageSent,
  onOpenMarkdownArtifact,
  onReviewDiffs,
  onOpenTerminalDrawer
}: {
  snapshot: AgentWorkspaceSnapshot
  project: AgentWorkspaceProject | null
  projectThreads: readonly AgentWorkspaceThread[]
  panesController: AgentWorkspacePanesController
  localUserTimeline: readonly AgentWorkspaceTimelineEntry[]
  terminalDrawerReason: AgentTerminalRevealReason | null
  onMessageSent: AgentComposerMessageSentHandler
  onOpenMarkdownArtifact: (artifact: AgentTimelineMarkdownArtifact) => void
  onReviewDiffs: (paneId: string) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): React.JSX.Element {
  const { panes, activePaneId, splitDirection } = panesController

  return (
    <div
      className="flex min-w-0 flex-1 overflow-hidden"
      style={{ flexDirection: splitDirection === 'horizontal' ? 'row' : 'column' }}
    >
      {panes.map((pane, index) => {
        const paneThread = pane.selectedThreadId
          ? (projectThreads.find((thread) => thread.id === pane.selectedThreadId) ?? null)
          : null
        const backendTimeline = getThreadTimeline(snapshot, paneThread)
        const paneTimeline = mergeAgentWorkspacePaneTimeline({
          backendTimeline,
          localUserTimeline,
          threadId: paneThread?.id ?? null
        })
        const splitBorder =
          index === 0
            ? ''
            : splitDirection === 'horizontal'
              ? 'border-l border-border'
              : 'border-t border-border'

        return (
          <div
            key={pane.id}
            className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${splitBorder}`}
          >
            <AgentWorkspacePane
              activeWorktreeId={snapshot.activeWorktreeId}
              project={project}
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
              activeDraftSession={getActiveAgentWorkspaceDraftSession(pane)}
              approval={getThreadApproval(snapshot, paneThread)}
              timeline={paneTimeline}
              diffs={getThreadDiffs(snapshot, paneThread)}
              terminalAvailable={snapshot.terminalAvailable}
              browserWorkbenchActive={terminalDrawerReason === 'browser'}
              tabGroupWorkbenchActive={terminalDrawerReason === 'workbench'}
              onFocusPane={() => panesController.setActivePaneId(pane.id)}
              onSelectThread={(threadId) =>
                panesController.handlePaneThreadSelect(pane.id, threadId)
              }
              onCloseThread={(threadId) => panesController.handleCloseThread(pane.id, threadId)}
              onNewSession={() => panesController.handleNewSession(pane.id)}
              onSelectDraftSession={(draftSessionId) =>
                panesController.handleSelectDraftSession(pane.id, draftSessionId)
              }
              onCloseDraftSession={(draftSessionId) =>
                panesController.handleCloseDraftSession(pane.id, draftSessionId)
              }
              onUpdateDraftSessionAgent={(draftSessionId, agent: TuiAgent) =>
                panesController.handleUpdateDraftSessionAgent(pane.id, draftSessionId, agent)
              }
              onBeginDraftAgentSession={(agent) =>
                panesController.handleBeginDraftAgentSession(agent, pane.id)
              }
              onPendingAgentLaunch={() => panesController.handlePendingAgentLaunch(pane.id)}
              onMessageSent={onMessageSent}
              onOpenMarkdownArtifact={onOpenMarkdownArtifact}
              onReviewDiffs={() => onReviewDiffs(pane.id)}
              onSplitPane={(direction) => {
                const nextSplitDirection =
                  direction === 'right' || direction === 'left' ? 'horizontal' : 'vertical'
                panesController.handleSplitPane(pane.id, nextSplitDirection)
              }}
              onClosePane={() => panesController.handleClosePane(pane.id)}
              onOpenTerminalDrawer={onOpenTerminalDrawer}
            />
          </div>
        )
      })}
    </div>
  )
}
