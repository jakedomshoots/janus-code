import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

export type AgentWorkspaceActionBridge = {
  readonly isActive: () => boolean
  readonly getBrowserWorkbenchActive: () => boolean
  readonly openBrowserWorkbench: (options?: { createNewTab?: boolean }) => void
  readonly beginDraftAgentSession: (agent: TuiAgent) => void
  readonly newTerminalTab: () => void
  readonly newBrowserTab: () => void
  readonly newFileTab: () => void
  readonly openFileTab: () => void
  readonly newSimulatorTab: () => void
  readonly openTerminalDrawer: (reason: AgentTerminalRevealReason | null) => void
  readonly openWorkbenchSurface: () => void
}

let registeredBridge: AgentWorkspaceActionBridge | null = null

export function registerAgentWorkspaceActionBridge(
  bridge: AgentWorkspaceActionBridge | null
): void {
  registeredBridge = bridge
}

export function getAgentWorkspaceActionBridge(): AgentWorkspaceActionBridge | null {
  return registeredBridge
}

export function isGuiAgentWorkspaceActionRoutingActive(): boolean {
  return registeredBridge?.isActive() === true
}
