import { describe, expect, it } from 'vitest'
import {
  AGENT_TERMINAL_REVEAL_REASONS,
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
      workbenchOverlayWorkspaceMounted: false,
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
      workbenchOverlayWorkspaceMounted: false,
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
      terminalWorkspaceMounted: false,
      workbenchOverlayWorkspaceMounted: false,
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
      terminalWorkspaceMounted: false,
      workbenchOverlayWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it('recognizes only supported reveal reasons', () => {
    expect(isAgentTerminalRevealReason('keyboard-shortcut')).toBe(true)
    expect(isAgentTerminalRevealReason('workbench')).toBe(true)
    expect(isAgentTerminalRevealReason('inline-terminal')).toBe(false)
  })
})
