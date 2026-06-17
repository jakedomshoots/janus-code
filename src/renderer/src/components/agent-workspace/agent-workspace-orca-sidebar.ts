// Why: the GUI agent panel and Orca explorer both occupy the right edge; only
// one should be visible so users know where plan/diff/approval content lives.
export function shouldSuppressOrcaRightSidebar(input: {
  guiAgentWorkspaceEnabled: boolean
  activeView: string
  agentWorkspaceRightPanelExpanded: boolean
}): boolean {
  return (
    input.guiAgentWorkspaceEnabled === true &&
    input.activeView === 'terminal' &&
    input.agentWorkspaceRightPanelExpanded
  )
}
