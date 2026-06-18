import type { AgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'

export type AgentWorkspacePaneState = {
  id: string
  selectedThreadId: string | null
  draftSessions: readonly AgentWorkspaceDraftSession[]
  selectedDraftSessionId: string | null
}

export type AgentWorkspaceSplitDirection = 'horizontal' | 'vertical'
