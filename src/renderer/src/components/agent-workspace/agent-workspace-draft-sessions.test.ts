import { describe, expect, it } from 'vitest'
import {
  appendAgentWorkspaceDraftSession,
  closeAgentWorkspaceDraftSession,
  createAgentWorkspaceDraftSession,
  getActiveAgentWorkspaceDraftSession,
  selectAgentWorkspaceDraftSession,
  updateAgentWorkspaceDraftSessionAgent
} from './agent-workspace-draft-sessions'

describe('agent-workspace-draft-sessions', () => {
  it('appends a new draft session and selects it', () => {
    const firstDraft = createAgentWorkspaceDraftSession('codex')
    const pane = appendAgentWorkspaceDraftSession(
      { draftSessions: [firstDraft], selectedDraftSessionId: firstDraft.id },
      'claude'
    )

    expect(pane.draftSessions).toHaveLength(2)
    expect(pane.draftSessions[1]?.preferredAgent).toBe('claude')
    expect(pane.selectedDraftSessionId).toBe(pane.draftSessions[1]?.id)
  })

  it('selects an existing draft session', () => {
    const firstDraft = createAgentWorkspaceDraftSession('codex')
    const secondDraft = createAgentWorkspaceDraftSession('claude')
    const pane = selectAgentWorkspaceDraftSession(
      {
        draftSessions: [firstDraft, secondDraft],
        selectedDraftSessionId: secondDraft.id
      },
      firstDraft.id
    )

    expect(pane?.selectedDraftSessionId).toBe(firstDraft.id)
  })

  it('closes the selected draft and falls back to a neighbor', () => {
    const firstDraft = createAgentWorkspaceDraftSession('codex')
    const secondDraft = createAgentWorkspaceDraftSession('claude')
    const thirdDraft = createAgentWorkspaceDraftSession('gemini')
    const pane = closeAgentWorkspaceDraftSession(
      {
        draftSessions: [firstDraft, secondDraft, thirdDraft],
        selectedDraftSessionId: secondDraft.id
      },
      secondDraft.id
    )

    expect(pane.draftSessions.map((draft) => draft.id)).toEqual([firstDraft.id, thirdDraft.id])
    expect(pane.selectedDraftSessionId).toBe(thirdDraft.id)
  })

  it('updates the preferred agent on an existing draft session', () => {
    const draft = createAgentWorkspaceDraftSession(null)
    const pane = updateAgentWorkspaceDraftSessionAgent(
      { draftSessions: [draft], selectedDraftSessionId: draft.id },
      draft.id,
      'grok'
    )

    expect(pane.draftSessions[0]?.preferredAgent).toBe('grok')
  })

  it('returns the active draft session for the pane', () => {
    const draft = createAgentWorkspaceDraftSession('codex')
    const activeDraft = getActiveAgentWorkspaceDraftSession({
      draftSessions: [draft],
      selectedDraftSessionId: draft.id
    })

    expect(activeDraft).toEqual(draft)
  })
})
