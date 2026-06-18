// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const legacyGrabDump = [
  'Attached browser context from http://127.0.0.1:5175/web-index.html',
  '',
  'Selected element:',
  'h1',
  'Full DOM path: body > div#root > h1'
].join('\n')

describe('installClipboardGrabDumpGuards', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('strips legacy grab dumps from navigator clipboard writes', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue()
    vi.stubGlobal('navigator', {
      clipboard: { writeText }
    })

    const { installClipboardGrabDumpGuards: install } = await import('./clipboard-grab-dump-guard')
    install()

    await navigator.clipboard.writeText(legacyGrabDump)

    expect(writeText).toHaveBeenCalledWith('')
  })

  it('does not throw when navigator clipboard is frozen', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: Object.freeze(async () => {})
      }
    })

    const { installClipboardGrabDumpGuards: install } = await import('./clipboard-grab-dump-guard')

    expect(() => install()).not.toThrow()
  })
})
