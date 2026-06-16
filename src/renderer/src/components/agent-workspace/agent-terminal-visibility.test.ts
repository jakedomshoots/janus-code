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
      openReason: null,
      primaryTerminalHidden: false,
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
      openReason: null,
      primaryTerminalHidden: true,
      terminalWorkspaceMounted: true,
      terminalAvailable: true
    })
  })

  it.each(AGENT_TERMINAL_REVEAL_REASONS)(
    'opens the drawer for %s reveal requests',
    (openReason) => {
      expect(
        getAgentTerminalVisibilityState({
          guiAgentWorkspaceEnabled: true,
          openReason,
          terminalAvailable: true
        }).drawerOpen
      ).toBe(true)
    }
  )

  it('recognizes only supported reveal reasons', () => {
    expect(isAgentTerminalRevealReason('keyboard-shortcut')).toBe(true)
    expect(isAgentTerminalRevealReason('inline-terminal')).toBe(false)
  })
})
