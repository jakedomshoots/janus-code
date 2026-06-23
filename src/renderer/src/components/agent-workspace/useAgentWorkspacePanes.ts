import { useEffect, useRef, useState } from 'react'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import {
  appendAgentWorkspaceDraftSession,
  closeAgentWorkspaceDraftSession,
  selectAgentWorkspaceDraftSession,
  updateAgentWorkspaceDraftSessionAgent
} from './agent-workspace-draft-sessions'
import { pickAgentWorkspaceApprovalThreadId } from './agent-workspace-approval-focus'
import { closeAgentWorkspaceThread } from './agent-workspace-thread-close'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type {
  AgentWorkspacePaneState,
  AgentWorkspaceSplitDirection
} from './agent-workspace-pane-state'
import {
  findNewAgentWorkspaceThread,
  selectPanesAfterProjectThreadUpdate
} from './agent-workspace-pane-thread-selection'
import {
  createInitialPaneState,
  finalizeDraftSessionAgentBeforeSwitch,
  type AgentWorkspacePanesController
} from './agent-workspace-pane-session-state'

export function useAgentWorkspacePanes({
  defaultThreadId,
  projectThreads,
  projectThreadIdsKey,
  onOpenTerminalDrawer
}: {
  defaultThreadId: string | null
  projectThreads: readonly AgentWorkspaceThread[]
  projectThreadIdsKey: string
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): AgentWorkspacePanesController {
  const [panes, setPanes] = useState<AgentWorkspacePaneState[]>(() => [
    createInitialPaneState(defaultThreadId)
  ])
  const [activePaneId, setActivePaneId] = useState('pane-1')
  const [splitDirection, setSplitDirection] = useState<AgentWorkspaceSplitDirection>('horizontal')
  const nextPaneSequenceRef = useRef(2)
  const draftAgentBySessionIdRef = useRef<Partial<Record<string, TuiAgent>>>({})
  const previousProjectThreadIdsKeyRef = useRef(projectThreadIdsKey)
  const activePane = panes.find((pane) => pane.id === activePaneId) ?? panes[0] ?? null

  function handlePaneThreadSelect(paneId: string, threadId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) =>
        pane.id === paneId
          ? { ...pane, selectedThreadId: threadId, pendingLaunchedThreadSelection: false }
          : pane
      )
    )
  }

  function handleNewSession(paneId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.id !== paneId) {
          return pane
        }
        const finalizedPane = finalizeDraftSessionAgentBeforeSwitch(
          pane,
          pane.selectedDraftSessionId
            ? draftAgentBySessionIdRef.current[pane.selectedDraftSessionId]
            : undefined
        )
        const nextDraftState = appendAgentWorkspaceDraftSession(finalizedPane)
        return {
          ...pane,
          selectedThreadId: null,
          draftSessions: nextDraftState.draftSessions,
          selectedDraftSessionId: nextDraftState.selectedDraftSessionId,
          pendingLaunchedThreadSelection: false
        }
      })
    )
  }

  function handleBeginDraftAgentSession(agent: TuiAgent, paneId: string): void {
    onOpenTerminalDrawer?.(null)
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.id !== paneId) {
          return pane
        }
        const finalizedPane = finalizeDraftSessionAgentBeforeSwitch(
          pane,
          pane.selectedDraftSessionId
            ? draftAgentBySessionIdRef.current[pane.selectedDraftSessionId]
            : undefined
        )
        const nextDraftState = appendAgentWorkspaceDraftSession(finalizedPane, agent)
        return {
          ...pane,
          selectedThreadId: null,
          draftSessions: nextDraftState.draftSessions,
          selectedDraftSessionId: nextDraftState.selectedDraftSessionId,
          pendingLaunchedThreadSelection: false
        }
      })
    )
  }

  function handleUpdateDraftSessionAgent(
    paneId: string,
    draftSessionId: string,
    agent: TuiAgent
  ): void {
    draftAgentBySessionIdRef.current[draftSessionId] = agent
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.id !== paneId) {
          return pane
        }
        const currentDraft = pane.draftSessions.find((draft) => draft.id === draftSessionId)
        if (currentDraft?.preferredAgent === agent) {
          return pane
        }
        return {
          ...pane,
          draftSessions: updateAgentWorkspaceDraftSessionAgent(pane, draftSessionId, agent)
            .draftSessions
        }
      })
    )
  }

  function handlePendingAgentLaunch(paneId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) =>
        pane.id === paneId ? { ...pane, pendingLaunchedThreadSelection: true } : pane
      )
    )
  }

  function handleSelectDraftSession(paneId: string, draftSessionId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.id !== paneId) {
          return pane
        }
        const nextDraftState = selectAgentWorkspaceDraftSession(pane, draftSessionId)
        return nextDraftState
          ? {
              ...pane,
              selectedThreadId: null,
              selectedDraftSessionId: nextDraftState.selectedDraftSessionId,
              pendingLaunchedThreadSelection: false
            }
          : pane
      })
    )
  }

  function handleCloseDraftSession(paneId: string, draftSessionId: string): void {
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.id !== paneId) {
          return pane
        }
        const wasViewingDraft =
          pane.selectedThreadId === null && pane.selectedDraftSessionId === draftSessionId
        const nextDraftState = closeAgentWorkspaceDraftSession(pane, draftSessionId)
        const fallbackThreadId = projectThreads[0]?.id ?? null
        return {
          ...pane,
          draftSessions: nextDraftState.draftSessions,
          selectedDraftSessionId: nextDraftState.selectedDraftSessionId,
          selectedThreadId:
            wasViewingDraft && nextDraftState.selectedDraftSessionId === null
              ? fallbackThreadId
              : pane.selectedThreadId,
          pendingLaunchedThreadSelection:
            wasViewingDraft && nextDraftState.selectedDraftSessionId === null
              ? false
              : pane.pendingLaunchedThreadSelection
        }
      })
    )
  }

  function handleCloseThread(paneId: string, threadId: string): void {
    const fallbackThreadId = projectThreads.find((thread) => thread.id !== threadId)?.id ?? null
    setPanes((currentPanes) =>
      currentPanes.map((pane) =>
        pane.selectedThreadId === threadId
          ? {
              ...pane,
              selectedThreadId: fallbackThreadId,
              pendingLaunchedThreadSelection: false
            }
          : pane
      )
    )
    if (activePane?.selectedThreadId === threadId) {
      setActivePaneId(paneId)
    }
    closeAgentWorkspaceThread(threadId)
  }

  function handleSplitPane(paneId: string, direction: AgentWorkspaceSplitDirection): void {
    setSplitDirection(direction)
    const nextPaneId = `pane-${nextPaneSequenceRef.current}`
    nextPaneSequenceRef.current += 1
    const sourcePane = panes.find((pane) => pane.id === paneId)
    setPanes((currentPanes) => {
      const insertIndex = currentPanes.findIndex((pane) => pane.id === paneId)
      const nextPane: AgentWorkspacePaneState = {
        id: nextPaneId,
        selectedThreadId: sourcePane?.selectedThreadId ?? defaultThreadId,
        draftSessions: [...(sourcePane?.draftSessions ?? [])],
        selectedDraftSessionId: sourcePane?.selectedDraftSessionId ?? null,
        pendingLaunchedThreadSelection: false
      }
      return insertIndex === -1
        ? [...currentPanes, nextPane]
        : [
            ...currentPanes.slice(0, insertIndex + 1),
            nextPane,
            ...currentPanes.slice(insertIndex + 1)
          ]
    })
    setActivePaneId(nextPaneId)
  }

  function handleClosePane(paneId: string): void {
    setPanes((currentPanes) => {
      if (currentPanes.length <= 1) {
        return currentPanes
      }
      const closingIndex = currentPanes.findIndex((pane) => pane.id === paneId)
      const nextPanes = currentPanes.filter((pane) => pane.id !== paneId)
      if (activePaneId === paneId) {
        setActivePaneId(
          nextPanes[Math.max(0, closingIndex - 1)]?.id ?? nextPanes[0]?.id ?? 'pane-1'
        )
      }
      return nextPanes
    })
  }

  useEffect(() => {
    const hadProjectThreads = previousProjectThreadIdsKeyRef.current.length > 0
    const previousThreadIds = new Set(previousProjectThreadIdsKeyRef.current.split('\u0000'))
    // Why: first transcript visibility must follow fast status updates too,
    // including pending startup rows that are not running yet.
    const launchedThread = findNewAgentWorkspaceThread(projectThreads, previousThreadIds)
    previousProjectThreadIdsKeyRef.current = projectThreadIdsKey
    setPanes((currentPanes) => {
      const nextPanes = selectPanesAfterProjectThreadUpdate({
        panes: currentPanes,
        launchedThread,
        projectThreads,
        defaultThreadId,
        hadProjectThreads
      })
      return nextPanes.some((pane, index) => pane !== currentPanes[index])
        ? nextPanes
        : currentPanes
    })
  }, [defaultThreadId, projectThreadIdsKey, projectThreads])

  useEffect(() => {
    if (!panes.some((pane) => pane.id === activePaneId)) {
      setActivePaneId(panes[0]?.id ?? 'pane-1')
    }
  }, [activePaneId, panes])

  useEffect(() => {
    if (!activePane) {
      return
    }
    const approvalThreadId = pickAgentWorkspaceApprovalThreadId(
      projectThreads,
      activePane.selectedThreadId
    )
    if (approvalThreadId) {
      handlePaneThreadSelect(activePane.id, approvalThreadId)
    }
  }, [activePane, projectThreadIdsKey, projectThreads])

  return {
    panes,
    activePaneId,
    activePane,
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
  }
}
