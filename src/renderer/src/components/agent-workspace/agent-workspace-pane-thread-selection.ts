import type { AgentWorkspacePaneState } from './agent-workspace-pane-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'

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
  return panes.map((pane) =>
    pane.pendingLaunchedThreadSelection && launchedThread
      ? {
          // Why: a completed-thread composer launch creates a fresh terminal
          // asynchronously; follow that new running thread when it appears.
          ...pane,
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
              // asynchronously; select it instead of leaving the pane blank.
              ...pane,
              selectedThreadId: defaultThreadId,
              selectedDraftSessionId: null,
              pendingLaunchedThreadSelection: false
            }
          : pane
  )
}
