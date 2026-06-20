import { describe, expect, it } from 'vitest'
import {
  BROWSER_VIEWPORT_PRESETS,
  browserViewportPresetToOverride,
  getBrowserViewportPreset
} from './browser-viewport-presets'

describe('browser viewport presets', () => {
  it('defines stable preset ids from small mobile through desktop', () => {
    expect(BROWSER_VIEWPORT_PRESETS.map((preset) => preset.id)).toEqual([
      'mobile-s',
      'mobile-m',
      'mobile-l',
      'tablet',
      'laptop',
      'laptop-l',
      'desktop'
    ])
  })

  it('converts presets to runtime viewport overrides', () => {
    expect(browserViewportPresetToOverride(getBrowserViewportPreset('mobile-s')!)).toEqual({
      width: 320,
      height: 568,
      deviceScaleFactor: 2,
      mobile: true
    })
    expect(browserViewportPresetToOverride(getBrowserViewportPreset('desktop')!)).toEqual({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    })
  })

  it('returns null for missing preset ids', () => {
    expect(getBrowserViewportPreset(null)).toBeNull()
    expect(getBrowserViewportPreset(undefined)).toBeNull()
  })
})
