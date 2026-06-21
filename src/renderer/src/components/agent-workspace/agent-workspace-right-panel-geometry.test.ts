import { describe, expect, it } from 'vitest'
import { clampAgentWorkspaceContextCardWidth } from './agent-workspace-right-panel-geometry'

describe('agent workspace right panel geometry', () => {
  it('keeps the floating context card inside the available chat surface', () => {
    expect(
      clampAgentWorkspaceContextCardWidth({
        requestedWidth: 900,
        viewportWidth: 1440,
        availableSurfaceWidth: 520
      })
    ).toBe(472)
  })

  it('keeps a usable minimum on narrow surfaces without stretching to full page width', () => {
    expect(
      clampAgentWorkspaceContextCardWidth({
        requestedWidth: 120,
        viewportWidth: 900,
        availableSurfaceWidth: 340
      })
    ).toBe(320)
  })
})
