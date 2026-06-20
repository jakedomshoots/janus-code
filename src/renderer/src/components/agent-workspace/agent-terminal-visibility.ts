export const AGENT_TERMINAL_REVEAL_REASONS = [
  'right-panel',
  'debug-button',
  'failure',
  'keyboard-shortcut',
  'browser',
  'workbench',
  'approval'
] as const

export type AgentTerminalRevealReason = (typeof AGENT_TERMINAL_REVEAL_REASONS)[number]

export type AgentTerminalVisibilityInput = {
  readonly guiAgentWorkspaceEnabled: boolean
  readonly openReason: AgentTerminalRevealReason | null
  readonly terminalAvailable: boolean
}

export type AgentTerminalVisibilityState = {
  readonly drawerRendered: boolean
  readonly drawerOpen: boolean
  readonly browserWorkbenchOpen: boolean
  readonly tabGroupWorkbenchOpen: boolean
  readonly openReason: AgentTerminalRevealReason | null
  readonly terminalWorkspaceMounted: boolean
  readonly terminalAvailable: boolean
}

export type AgentBrowserWorkbenchOverlayHostState = {
  readonly agentBrowserWorkbenchOpen: boolean
  readonly suppressBrowserOverlays: boolean
  readonly suppressSimulatorOverlays: boolean
  readonly suppressTerminalOverlays: boolean
}

function isMainPaneWorkbenchReason(reason: AgentTerminalRevealReason | null): boolean {
  return reason === 'browser' || reason === 'workbench'
}

export function isAgentTerminalRevealReason(value: string): value is AgentTerminalRevealReason {
  return AGENT_TERMINAL_REVEAL_REASONS.includes(value as AgentTerminalRevealReason)
}

export function getAgentTerminalVisibilityState({
  guiAgentWorkspaceEnabled,
  openReason,
  terminalAvailable
}: AgentTerminalVisibilityInput): AgentTerminalVisibilityState {
  const resolvedReason = guiAgentWorkspaceEnabled ? openReason : null
  return {
    drawerRendered: guiAgentWorkspaceEnabled,
    // Why: browser workbench overlays the agent chat pane (original Orca layout),
    // not the bottom terminal drawer reserved for debug/approval terminals.
    drawerOpen:
      guiAgentWorkspaceEnabled &&
      resolvedReason !== null &&
      !isMainPaneWorkbenchReason(resolvedReason),
    browserWorkbenchOpen: guiAgentWorkspaceEnabled && resolvedReason === 'browser',
    tabGroupWorkbenchOpen: guiAgentWorkspaceEnabled && resolvedReason === 'workbench',
    openReason: resolvedReason,
    terminalWorkspaceMounted: true,
    terminalAvailable
  }
}

export function getAgentBrowserWorkbenchOverlayHostState({
  guiAgentWorkspaceEnabled,
  tabGroupWorkbenchOpen
}: Pick<AgentTerminalVisibilityInput, 'guiAgentWorkspaceEnabled'> &
  Pick<
    AgentTerminalVisibilityState,
    'tabGroupWorkbenchOpen'
  >): AgentBrowserWorkbenchOverlayHostState | null {
  if (!guiAgentWorkspaceEnabled || !tabGroupWorkbenchOpen) {
    return null
  }

  return {
    agentBrowserWorkbenchOpen: tabGroupWorkbenchOpen,
    // Why: browser mode owns BrowserPaneOverlayLayer inline; this host is only
    // for the generic tab-group workbench that needs a stable non-browser owner.
    suppressBrowserOverlays: true,
    suppressSimulatorOverlays: false,
    suppressTerminalOverlays: tabGroupWorkbenchOpen
  }
}
