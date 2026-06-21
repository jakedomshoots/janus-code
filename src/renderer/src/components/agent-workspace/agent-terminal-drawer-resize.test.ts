import { describe, expect, it } from 'vitest'
import {
  clampTerminalDrawerHeight,
  getDefaultTerminalDrawerHeight,
  getResizedTerminalDrawerHeight,
  getTerminalDrawerMaxHeight,
  getTerminalDrawerMinHeight
} from './agent-terminal-drawer-resize'

describe('agent terminal drawer resize physics', () => {
  it('allows the drawer to expand near full height on tall windows', () => {
    expect(getTerminalDrawerMaxHeight(1200)).toBe(1128)
    expect(clampTerminalDrawerHeight(Number.POSITIVE_INFINITY, 1200)).toBe(1128)
  })

  it('keeps a usable compact height when the window is short', () => {
    expect(getTerminalDrawerMaxHeight(220)).toBe(160)
    expect(getTerminalDrawerMinHeight(220)).toBe(160)
    expect(clampTerminalDrawerHeight(40, 220)).toBe(160)
  })

  it('preserves the calm default while still obeying adaptive bounds', () => {
    expect(getDefaultTerminalDrawerHeight(700)).toBe(322)
    expect(getDefaultTerminalDrawerHeight(1400)).toBe(512)
    expect(getDefaultTerminalDrawerHeight(260)).toBe(188)
  })

  it('resizes as a bottom-anchored sheet and clamps both directions', () => {
    expect(
      getResizedTerminalDrawerHeight({
        startHeight: 322,
        startClientY: 300,
        currentClientY: 0,
        viewportHeight: 700
      })
    ).toBe(622)

    expect(
      getResizedTerminalDrawerHeight({
        startHeight: 322,
        startClientY: 300,
        currentClientY: 1200,
        viewportHeight: 700
      })
    ).toBe(224)
  })
})
