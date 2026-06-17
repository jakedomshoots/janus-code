import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { setRendererUiLanguage, translate } from '@/i18n/i18n'

describe('Janus Code visible branding', () => {
  it('uses Janus Code for the titlebar and landing empty-state copy', async () => {
    await setRendererUiLanguage('en')

    expect(translate('auto.App.5096cbbc86', 'Orca')).toBe('Janus Code')
    expect(translate('auto.components.Landing.6ca6ff404e', 'ORCA')).toBe('Janus Code')
    expect(translate('auto.components.Landing.520304a067', 'Orca logo')).toBe('Janus Code logo')
  })

  it('uses the Janus logo asset on the visible app chrome and landing screen', () => {
    for (const filePath of [
      'src/renderer/src/App.tsx',
      'src/renderer/src/components/Landing.tsx'
    ]) {
      const source = readFileSync(filePath, 'utf8')

      expect(source).toContain('resources/janus-logo.png')
      expect(source).not.toContain('resources/logo.svg')
    }
  })
})
