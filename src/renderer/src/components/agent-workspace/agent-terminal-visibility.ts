export const AGENT_TERMINAL_REVEAL_REASONS = [
  'right-panel',
  'debug-button',
  'failure',
  'keyboard-shortcut'
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
  readonly openReason: AgentTerminalRevealReason | null
  readonly primaryTerminalHidden: boolean
  readonly terminalWorkspaceMounted: boolean
  readonly terminalAvailable: boolean
}

export function isAgentTerminalRevealReason(value: string): value is AgentTerminalRevealReason {
  return AGENT_TERMINAL_REVEAL_REASONS.includes(value as AgentTerminalRevealReason)
}

export function getAgentTerminalVisibilityState({
  guiAgentWorkspaceEnabled,
  openReason,
  terminalAvailable
}: AgentTerminalVisibilityInput): AgentTerminalVisibilityState {
  return {
    drawerRendered: guiAgentWorkspaceEnabled,
    drawerOpen: guiAgentWorkspaceEnabled && openReason !== null,
    openReason: guiAgentWorkspaceEnabled ? openReason : null,
    primaryTerminalHidden: guiAgentWorkspaceEnabled,
    terminalWorkspaceMounted: true,
    terminalAvailable
  }
}
