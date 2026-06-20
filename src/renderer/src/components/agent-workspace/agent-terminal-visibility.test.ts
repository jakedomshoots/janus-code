import { describe, expect, it } from 'vitest'
import {
  AGENT_TERMINAL_REVEAL_REASONS,
  getAgentBrowserWorkbenchOverlayHostState,
  getAgentTerminalVisibilityState,
  isAgentTerminalRevealReason
} from './agent-terminal-visibility'

describe('agent terminal visibility', () => {
  it('keeps the primary terminal visible outside GUI workspace mode', () => {
    expect(
      getAgentTerminalVisibilityState({
        guiAgentWorkspaceEnabled: false,
        openReason: 'right-panel',
        terminalAvailable: true
      })
    ).toEqual({
      drawerRendered: false,
      drawerOpen: false,
      browserWorkbenchOpen: false,
      tabGroupWorkbenchOpen: false,
      openReason: null,
      terminalWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it('hides the primary terminal by default in GUI workspace mode without unmounting it', () => {
    expect(
      getAgentTerminalVisibilityState({
        guiAgentWorkspaceEnabled: true,
        openReason: null,
        terminalAvailable: true
      })
    ).toEqual({
      drawerRendered: true,
      drawerOpen: false,
      browserWorkbenchOpen: false,
      tabGroupWorkbenchOpen: false,
      openReason: null,
      terminalWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it.each(
    AGENT_TERMINAL_REVEAL_REASONS.filter((reason) => reason !== 'browser' && reason !== 'workbench')
  )('opens the drawer for %s reveal requests', (openReason) => {
    expect(
      getAgentTerminalVisibilityState({
        guiAgentWorkspaceEnabled: true,
        openReason,
        terminalAvailable: true
      }).drawerOpen
    ).toBe(true)
  })

  it('opens the browser workbench overlay instead of the terminal drawer', () => {
    expect(
      getAgentTerminalVisibilityState({
        guiAgentWorkspaceEnabled: true,
        openReason: 'browser',
        terminalAvailable: true
      })
    ).toEqual({
      drawerRendered: true,
      drawerOpen: false,
      browserWorkbenchOpen: true,
      tabGroupWorkbenchOpen: false,
      openReason: 'browser',
      terminalWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it('opens the tab-group workbench overlay for simulator and editor surfaces', () => {
    expect(
      getAgentTerminalVisibilityState({
        guiAgentWorkspaceEnabled: true,
        openReason: 'workbench',
        terminalAvailable: true
      })
    ).toEqual({
      drawerRendered: true,
      drawerOpen: false,
      browserWorkbenchOpen: false,
      tabGroupWorkbenchOpen: true,
      openReason: 'workbench',
      terminalWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it('keeps the preserved overlay host out of browser workbench mode', () => {
    const visibility = getAgentTerminalVisibilityState({
      guiAgentWorkspaceEnabled: true,
      openReason: 'browser',
      terminalAvailable: true
    })

    expect(
      getAgentBrowserWorkbenchOverlayHostState({
        guiAgentWorkspaceEnabled: true,
        tabGroupWorkbenchOpen: visibility.tabGroupWorkbenchOpen
      })
    ).toBeNull()
  })

  it('uses a browser-suppressed preserved host for tab-group workbench mode', () => {
    const visibility = getAgentTerminalVisibilityState({
      guiAgentWorkspaceEnabled: true,
      openReason: 'workbench',
      terminalAvailable: true
    })

    expect(
      getAgentBrowserWorkbenchOverlayHostState({
        guiAgentWorkspaceEnabled: true,
        tabGroupWorkbenchOpen: visibility.tabGroupWorkbenchOpen
      })
    ).toEqual({
      agentBrowserWorkbenchOpen: true,
      suppressBrowserOverlays: true,
      suppressSimulatorOverlays: false,
      suppressTerminalOverlays: true
    })
  })

  it('recognizes only supported reveal reasons', () => {
    expect(isAgentTerminalRevealReason('keyboard-shortcut')).toBe(true)
    expect(isAgentTerminalRevealReason('workbench')).toBe(true)
    expect(isAgentTerminalRevealReason('inline-terminal')).toBe(false)
  })
})
