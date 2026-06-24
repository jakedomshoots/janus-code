import type { AgentWorkspacePaneState } from './agent-workspace-pane-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function findNewAgentWorkspaceThread(
  projectThreads: readonly AgentWorkspaceThread[],
  previousThreadIds: ReadonlySet<string>
): AgentWorkspaceThread | undefined {
  return projectThreads.find((thread) => !previousThreadIds.has(thread.id))
}

export function selectPanesAfterProjectThreadUpdate({
  panes,
  launchedThread,
  projectThreads,
  defaultThreadId,
  hadProjectThreads
}: {
  panes: readonly AgentWorkspacePaneState[]
  launchedThread: AgentWorkspaceThread | undefined
  projectThreads: readonly AgentWorkspaceThread[]
  defaultThreadId: string | null
  hadProjectThreads: boolean
}): AgentWorkspacePaneState[] {
  function consumeSelectedDraftSession(pane: AgentWorkspacePaneState): AgentWorkspacePaneState {
    if (!pane.selectedDraftSessionId) {
      return pane
    }
    return {
      ...pane,
      draftSessions: pane.draftSessions.filter((draft) => draft.id !== pane.selectedDraftSessionId)
    }
  }

  return panes.map((pane) =>
    pane.pendingLaunchedThreadSelection && launchedThread
      ? {
          // Why: a completed-thread composer launch creates a fresh terminal
          // asynchronously; follow it and consume the draft tab that launched it.
          ...consumeSelectedDraftSession(pane),
          selectedThreadId: launchedThread.id,
          selectedDraftSessionId: null,
          pendingLaunchedThreadSelection: false
        }
      : pane.selectedThreadId &&
          !projectThreads.some((thread) => thread.id === pane.selectedThreadId)
        ? { ...pane, selectedThreadId: defaultThreadId, pendingLaunchedThreadSelection: false }
        : defaultThreadId !== null &&
            !hadProjectThreads &&
            !pane.selectedThreadId &&
            pane.selectedDraftSessionId
          ? {
              // Why: a draft composer launch reports its real agent thread
              // asynchronously; select it without leaving a duplicate draft tab.
              ...consumeSelectedDraftSession(pane),
              selectedThreadId: defaultThreadId,
              selectedDraftSessionId: null,
              pendingLaunchedThreadSelection: false
            }
          : defaultThreadId !== null && !pane.selectedThreadId && !pane.selectedDraftSessionId
            ? {
                // Why: CLI-created agent tabs can arrive without a draft marker;
                // the pane should still bind the available thread instead of
                // leaving the chat surface on the empty-state hero.
                ...pane,
                selectedThreadId: defaultThreadId,
                pendingLaunchedThreadSelection: false
              }
            : pane
  )
}
