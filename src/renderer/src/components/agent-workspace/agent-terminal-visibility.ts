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
  readonly workbenchOverlayWorkspaceMounted: boolean
  readonly terminalAvailable: boolean
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
  const mainPaneWorkbenchOpen =
    guiAgentWorkspaceEnabled && isMainPaneWorkbenchReason(resolvedReason)
  return {
    drawerRendered: guiAgentWorkspaceEnabled,
    // Why: browser workbench overlays the agent chat pane (original Orca layout),
    // not the bottom terminal drawer reserved for debug/approval terminals.
    drawerOpen: guiAgentWorkspaceEnabled && resolvedReason !== null && !mainPaneWorkbenchOpen,
    browserWorkbenchOpen: guiAgentWorkspaceEnabled && resolvedReason === 'browser',
    tabGroupWorkbenchOpen: guiAgentWorkspaceEnabled && resolvedReason === 'workbench',
    openReason: resolvedReason,
    // Why: browser and workbench modes mount their own visible workspace host.
    // Keeping the hidden drawer workspace mounted can steal webview ownership.
    terminalWorkspaceMounted: !mainPaneWorkbenchOpen,
    // Why: browser mode owns its webview in AgentBrowserWorkbenchSurface; only
    // the editor/simulator workbench needs the transparent worktree overlay.
    workbenchOverlayWorkspaceMounted: guiAgentWorkspaceEnabled && resolvedReason === 'workbench',
    terminalAvailable
  }
}
