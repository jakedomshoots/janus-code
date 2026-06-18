import type { TuiAgent } from '../../../../shared/types'
import type { KeybindingActionId } from '../../../../shared/keybindings'
import { getAgentWorkspaceActionBridge } from './agent-workspace-action-bridge'

export function routeGuiAgentWorkspaceTabShortcut(actionId: KeybindingActionId): boolean {
  const bridge = getAgentWorkspaceActionBridge()
  if (!bridge?.isActive()) {
    return false
  }

  if (actionId === 'tab.newTerminal') {
    bridge.newTerminalTab()
    return true
  }
  if (actionId === 'tab.newBrowser') {
    bridge.openBrowserWorkbench({
      createNewTab: true,
      keepAgentSessionVisible: false
    })
    return true
  }
  if (actionId === 'tab.newMarkdown') {
    bridge.newFileTab()
    return true
  }
  if (actionId === 'tab.openMarkdown') {
    bridge.openFileTab()
    return true
  }
  if (actionId === 'tab.newSimulator') {
    bridge.newSimulatorTab()
    return true
  }
  return false
}

export function routeGuiAgentWorkspaceAgentShortcut(agent: TuiAgent): boolean {
  const bridge = getAgentWorkspaceActionBridge()
  if (!bridge?.isActive()) {
    return false
  }
  bridge.beginDraftAgentSession(agent)
  return true
}

export function routeGuiAgentWorkspaceNewBrowserTabFromIpc(): boolean {
  const bridge = getAgentWorkspaceActionBridge()
  if (!bridge?.isActive()) {
    return false
  }
  bridge.openBrowserWorkbench({
    createNewTab: true,
    keepAgentSessionVisible: false
  })
  return true
}
