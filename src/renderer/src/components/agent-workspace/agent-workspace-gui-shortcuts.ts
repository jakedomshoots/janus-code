import type { TuiAgent } from '../../../../shared/types'
import type { KeybindingActionId } from '../../../../shared/keybindings'
import { getAgentWorkspaceActionBridge } from './agent-workspace-action-bridge'

export function routeGuiAgentWorkspaceTabShortcut(actionId: KeybindingActionId): boolean {
  const bridge = getAgentWorkspaceActionBridge()
  if (!bridge?.isActive()) {
    return false
  }

  switch (actionId) {
    case 'tab.newTerminal':
      bridge.newTerminalTab()
      return true
    case 'tab.newBrowser':
      bridge.openBrowserWorkbench({
        createNewTab: true,
        keepAgentSessionVisible: false
      })
      return true
    case 'tab.newMarkdown':
      bridge.newFileTab()
      return true
    case 'tab.openMarkdown':
      bridge.openFileTab()
      return true
    case 'tab.newSimulator':
      bridge.newSimulatorTab()
      return true
    case 'tab.newAgent':
      return false
    default:
      if (actionId.startsWith('tab.newAgent.')) {
        return false
      }
      return false
  }
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
