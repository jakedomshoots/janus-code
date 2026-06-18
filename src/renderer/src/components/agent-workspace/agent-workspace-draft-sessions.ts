import type { TuiAgent } from '../../../../shared/types'

export type AgentWorkspaceDraftSession = {
  id: string
  preferredAgent: TuiAgent | null
}

export type AgentWorkspacePaneDraftState = {
  draftSessions: readonly AgentWorkspaceDraftSession[]
  selectedDraftSessionId: string | null
}

let draftSessionSequence = 1

export function mintAgentWorkspaceDraftSessionId(): string {
  const cryptoApi = globalThis.crypto as Crypto | undefined
  if (cryptoApi?.randomUUID) {
    return `draft-${cryptoApi.randomUUID()}`
  }
  const nextId = draftSessionSequence
  draftSessionSequence += 1
  return `draft-${nextId}`
}

export function createAgentWorkspaceDraftSession(
  preferredAgent: TuiAgent | null = null
): AgentWorkspaceDraftSession {
  return {
    id: mintAgentWorkspaceDraftSessionId(),
    preferredAgent
  }
}

export function appendAgentWorkspaceDraftSession(
  pane: AgentWorkspacePaneDraftState,
  preferredAgent: TuiAgent | null = null
): AgentWorkspacePaneDraftState {
  const draftSession = createAgentWorkspaceDraftSession(preferredAgent)
  return {
    draftSessions: [...pane.draftSessions, draftSession],
    selectedDraftSessionId: draftSession.id
  }
}

export function selectAgentWorkspaceDraftSession(
  pane: AgentWorkspacePaneDraftState,
  draftSessionId: string
): AgentWorkspacePaneDraftState | null {
  if (!pane.draftSessions.some((draft) => draft.id === draftSessionId)) {
    return null
  }
  return {
    ...pane,
    selectedDraftSessionId: draftSessionId
  }
}

export function closeAgentWorkspaceDraftSession(
  pane: AgentWorkspacePaneDraftState,
  draftSessionId: string
): AgentWorkspacePaneDraftState {
  const remainingDrafts = pane.draftSessions.filter((draft) => draft.id !== draftSessionId)
  if (pane.selectedDraftSessionId !== draftSessionId) {
    return {
      draftSessions: remainingDrafts,
      selectedDraftSessionId: pane.selectedDraftSessionId
    }
  }
  const closedIndex = pane.draftSessions.findIndex((draft) => draft.id === draftSessionId)
  const fallbackDraft = remainingDrafts[Math.min(closedIndex, remainingDrafts.length - 1)] ?? null
  return {
    draftSessions: remainingDrafts,
    selectedDraftSessionId: fallbackDraft?.id ?? null
  }
}

export function getActiveAgentWorkspaceDraftSession(
  pane: AgentWorkspacePaneDraftState
): AgentWorkspaceDraftSession | null {
  if (!pane.selectedDraftSessionId) {
    return null
  }
  return pane.draftSessions.find((draft) => draft.id === pane.selectedDraftSessionId) ?? null
}

export function updateAgentWorkspaceDraftSessionAgent(
  pane: AgentWorkspacePaneDraftState,
  draftSessionId: string,
  preferredAgent: TuiAgent
): AgentWorkspacePaneDraftState {
  return {
    ...pane,
    draftSessions: pane.draftSessions.map((draft) =>
      draft.id === draftSessionId ? { ...draft, preferredAgent } : draft
    )
  }
}
