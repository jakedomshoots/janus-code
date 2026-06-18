// Why: the GUI agent workspace and project explorer both compete for the right
// edge. Keep explorer hidden until the user explicitly opens project files.
export function shouldSuppressProjectRightSidebar(input: {
  guiAgentWorkspaceEnabled: boolean
  activeView: string
  agentWorkspaceRightPanelExpanded: boolean
  rightSidebarOpen: boolean
}): boolean {
  if (input.guiAgentWorkspaceEnabled !== true || input.activeView !== 'terminal') {
    return false
  }
  if (input.agentWorkspaceRightPanelExpanded) {
    return true
  }
  return !input.rightSidebarOpen
}
