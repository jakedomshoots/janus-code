import { describe, expect, it, vi } from 'vitest'
import {
  registerAgentWorkspaceActionBridge,
  type AgentWorkspaceActionBridge
} from './agent-workspace-action-bridge'
import {
  routeGuiAgentWorkspaceAgentShortcut,
  routeGuiAgentWorkspaceNewBrowserTabFromIpc,
  routeGuiAgentWorkspaceTabShortcut
} from './agent-workspace-gui-shortcuts'

function makeBridge(
  overrides: Partial<AgentWorkspaceActionBridge> = {}
): AgentWorkspaceActionBridge {
  return {
    isActive: () => true,
    getBrowserWorkbenchActive: () => false,
    openBrowserWorkbench: vi.fn(),
    beginDraftAgentSession: vi.fn(),
    newTerminalTab: vi.fn(),
    newBrowserTab: vi.fn(),
    newFileTab: vi.fn(),
    openFileTab: vi.fn(),
    newSimulatorTab: vi.fn(),
    openTerminalDrawer: vi.fn(),
    openWorkbenchSurface: vi.fn(),
    ...overrides
  }
}

describe('agent-workspace-gui-shortcuts', () => {
  it('routes tab shortcuts through the registered bridge', () => {
    const bridge = makeBridge()
    registerAgentWorkspaceActionBridge(bridge)

    expect(routeGuiAgentWorkspaceTabShortcut('tab.newTerminal')).toBe(true)
    expect(bridge.newTerminalTab).toHaveBeenCalled()

    registerAgentWorkspaceActionBridge(null)
  })

  it('creates and focuses a browser tab from the agent session', () => {
    const openBrowserWorkbench = vi.fn()
    registerAgentWorkspaceActionBridge(makeBridge({ openBrowserWorkbench }))

    expect(routeGuiAgentWorkspaceTabShortcut('tab.newBrowser')).toBe(true)
    expect(openBrowserWorkbench).toHaveBeenCalledWith({
      createNewTab: true,
      keepAgentSessionVisible: false
    })

    registerAgentWorkspaceActionBridge(null)
  })

  it('creates and focuses a new browser tab when the workbench is already open', () => {
    const openBrowserWorkbench = vi.fn()
    registerAgentWorkspaceActionBridge(
      makeBridge({
        getBrowserWorkbenchActive: () => true,
        openBrowserWorkbench
      })
    )

    expect(routeGuiAgentWorkspaceTabShortcut('tab.newBrowser')).toBe(true)
    expect(openBrowserWorkbench).toHaveBeenCalledWith({
      createNewTab: true,
      keepAgentSessionVisible: false
    })

    registerAgentWorkspaceActionBridge(null)
  })

  it('routes agent shortcuts to composer draft sessions', () => {
    const beginDraftAgentSession = vi.fn()
    registerAgentWorkspaceActionBridge(makeBridge({ beginDraftAgentSession }))

    expect(routeGuiAgentWorkspaceAgentShortcut('codex')).toBe(true)
    expect(beginDraftAgentSession).toHaveBeenCalledWith('codex')

    registerAgentWorkspaceActionBridge(null)
  })

  it('routes embedded browser new-tab IPC through the bridge', () => {
    const openBrowserWorkbench = vi.fn()
    registerAgentWorkspaceActionBridge(makeBridge({ openBrowserWorkbench }))

    expect(routeGuiAgentWorkspaceNewBrowserTabFromIpc()).toBe(true)
    expect(openBrowserWorkbench).toHaveBeenCalledWith({
      createNewTab: true,
      keepAgentSessionVisible: false
    })

    registerAgentWorkspaceActionBridge(null)
  })
})
