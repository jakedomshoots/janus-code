import { describe, expect, it, vi } from 'vitest'
import { applyOnboardingThemeSelection } from './ThemeStep'

describe('applyOnboardingThemeSelection', () => {
  it('previews and persists the selected theme immediately', () => {
    const onThemeChange = vi.fn()
    const updateSettings = vi.fn().mockResolvedValue(undefined)

    applyOnboardingThemeSelection('light', onThemeChange, updateSettings)

    expect(onThemeChange).toHaveBeenCalledWith('light')
    expect(updateSettings).toHaveBeenCalledWith({ theme: 'light' })
  })

  it('can preview and persist Retro 95', () => {
    const onThemeChange = vi.fn()
    const updateSettings = vi.fn().mockResolvedValue(undefined)

    applyOnboardingThemeSelection('retro95', onThemeChange, updateSettings)

    expect(onThemeChange).toHaveBeenCalledWith('retro95')
    expect(updateSettings).toHaveBeenCalledWith({ theme: 'retro95' })
  })
})
