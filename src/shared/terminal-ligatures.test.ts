import { describe, expect, it } from 'vitest'

import { fontFamilyHasKnownLigatures, resolveTerminalLigaturesEnabled } from './terminal-ligatures'

describe('terminal ligatures', () => {
  it('detects known ligature fonts from the primary font family', () => {
    expect(fontFamilyHasKnownLigatures('"JetBrains Mono", monospace')).toBe(true)
    expect(fontFamilyHasKnownLigatures('Departure Mono')).toBe(true)
    expect(fontFamilyHasKnownLigatures('Menlo, "Fira Code"')).toBe(false)
  })

  it('resolves auto, on, and off modes against the selected font', () => {
    expect(resolveTerminalLigaturesEnabled('auto', 'Fira Code')).toBe(true)
    expect(resolveTerminalLigaturesEnabled('auto', 'Menlo')).toBe(false)
    expect(resolveTerminalLigaturesEnabled('on', 'Menlo')).toBe(true)
    expect(resolveTerminalLigaturesEnabled('off', 'Fira Code')).toBe(false)
  })
})
