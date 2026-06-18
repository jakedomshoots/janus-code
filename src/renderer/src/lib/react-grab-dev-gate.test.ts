import { describe, expect, it } from 'vitest'
import { shouldEnableReactGrab } from './react-grab-dev-gate'

describe('shouldEnableReactGrab', () => {
  it('keeps React Grab disabled by default in dev builds', () => {
    expect(shouldEnableReactGrab({ dev: true })).toBe(false)
  })

  it('allows an explicit local opt-in in dev builds', () => {
    expect(shouldEnableReactGrab({ dev: true, enableFlag: 'true' })).toBe(true)
  })

  it('allows an explicit local opt-out in dev builds', () => {
    expect(shouldEnableReactGrab({ dev: true, enableFlag: 'false' })).toBe(false)
  })

  it('disables React Grab while the GUI agent workspace is active', () => {
    expect(shouldEnableReactGrab({ dev: true, guiAgentWorkspaceEnabled: true })).toBe(false)
  })

  it('stays disabled outside dev builds', () => {
    expect(shouldEnableReactGrab({ dev: false })).toBe(false)
    expect(shouldEnableReactGrab({ dev: false, enableFlag: 'true' })).toBe(false)
  })
})
