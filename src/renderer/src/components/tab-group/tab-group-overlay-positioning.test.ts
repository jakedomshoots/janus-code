// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildTabGroupOverlayStyle,
  shouldUseCssAnchorPositioning
} from './tab-group-overlay-positioning'

describe('tab group overlay positioning', () => {
  beforeEach(() => {
    vi.stubGlobal('CSS', {
      supports: vi.fn(() => true)
    })
    document.body.replaceChildren()
    delete (globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.replaceChildren()
    delete (globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__
  })

  it('uses CSS anchor positioning when no agent workbench owns the body anchor', () => {
    expect(shouldUseCssAnchorPositioning()).toBe(true)
  })

  it('uses measured positioning while an agent browser workbench is mounted', () => {
    const surface = document.createElement('div')
    surface.dataset.agentBrowserWorkbenchSurface = 'true'
    document.body.append(surface)

    expect(shouldUseCssAnchorPositioning()).toBe(false)
  })

  it('uses measured positioning while an agent tab-group workbench is mounted', () => {
    const surface = document.createElement('div')
    surface.dataset.agentTabGroupWorkbenchSurface = 'true'
    document.body.append(surface)

    expect(shouldUseCssAnchorPositioning()).toBe(false)
  })

  it('keeps agent workbench browser overlays visible while body measurement settles', () => {
    ;(globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__ = true
    const surface = document.createElement('div')
    surface.dataset.agentBrowserWorkbenchSurface = 'true'
    document.body.append(surface)

    const style = buildTabGroupOverlayStyle({
      anchorName: '--tab-group-body-group-1',
      isPaintable: true,
      isActive: true,
      measuredRect: null
    })

    expect(style.display).toBe('flex')
    expect(style.top).toBe(32)
    expect(style.right).toBe(0)
    expect(style.bottom).toBe(0)
  })
})
