import {
  getDefaultAgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelStateInput
} from './agent-workspace-right-panel-state'

export function getDefaultRightPanelStateForViewport({
  input,
  compactRightPanelViewport
}: {
  input: AgentWorkspaceRightPanelStateInput
  compactRightPanelViewport: boolean
}): AgentWorkspaceRightPanelState {
  const state = getDefaultAgentWorkspaceRightPanelState(input)
  return compactRightPanelViewport ? { ...state, collapsed: true } : state
}
