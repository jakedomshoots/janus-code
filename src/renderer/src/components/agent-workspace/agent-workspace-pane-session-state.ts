import type { TuiAgent } from '../../../../shared/types'
import {
  createAgentWorkspaceDraftSession,
  updateAgentWorkspaceDraftSessionAgent
} from './agent-workspace-draft-sessions'
import type {
  AgentWorkspacePaneState,
  AgentWorkspaceSplitDirection
} from './agent-workspace-pane-state'

export type AgentWorkspacePanesController = {
  readonly panes: readonly AgentWorkspacePaneState[]
  readonly activePaneId: string
  readonly activePane: AgentWorkspacePaneState | null
  readonly splitDirection: AgentWorkspaceSplitDirection
  readonly setActivePaneId: (paneId: string) => void
  readonly handlePaneThreadSelect: (paneId: string, threadId: string) => void
  readonly handleNewSession: (paneId: string) => void
  readonly handleBeginDraftAgentSession: (agent: TuiAgent, paneId: string) => void
  readonly handlePendingAgentLaunch: (paneId: string) => void
  readonly handleUpdateDraftSessionAgent: (
    paneId: string,
    draftSessionId: string,
    agent: TuiAgent
  ) => void
  readonly handleSelectDraftSession: (paneId: string, draftSessionId: string) => void
  readonly handleCloseDraftSession: (paneId: string, draftSessionId: string) => void
  readonly handleCloseThread: (paneId: string, threadId: string) => void
  readonly handleSplitPane: (paneId: string, direction: AgentWorkspaceSplitDirection) => void
  readonly handleClosePane: (paneId: string) => void
}

export function createInitialPaneState(selectedThreadId: string | null): AgentWorkspacePaneState {
  if (selectedThreadId !== null) {
    return {
      id: 'pane-1',
      selectedThreadId,
      draftSessions: [],
      selectedDraftSessionId: null,
      pendingLaunchedThreadSelection: false
    }
  }
  const draftSession = createAgentWorkspaceDraftSession(null)
  return {
    id: 'pane-1',
    selectedThreadId: null,
    draftSessions: [draftSession],
    selectedDraftSessionId: draftSession.id,
    pendingLaunchedThreadSelection: false
  }
}

export function finalizeDraftSessionAgentBeforeSwitch(
  pane: AgentWorkspacePaneState,
  trackedAgent: TuiAgent | undefined
): AgentWorkspacePaneState {
  const currentDraftSessionId = pane.selectedDraftSessionId
  if (!currentDraftSessionId || !trackedAgent) {
    return pane
  }
  const nextDraftState = updateAgentWorkspaceDraftSessionAgent(
    pane,
    currentDraftSessionId,
    trackedAgent
  )
  return {
    ...pane,
    draftSessions: nextDraftState.draftSessions,
    selectedDraftSessionId: nextDraftState.selectedDraftSessionId
  }
}
