// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BrowserGrabPayload } from '../../../../shared/browser-grab-types'
import * as grabCopy from './grab-payload-copy-text'

const writeClipboardText = vi.fn<(text: string) => Promise<void>>()

function makePayload(): BrowserGrabPayload {
  return {
    page: {
      sanitizedUrl: 'http://127.0.0.1:5175/web-index.html',
      title: 'Janus',
      viewportWidth: 1280,
      viewportHeight: 720,
      scrollX: 0,
      scrollY: 0,
      devicePixelRatio: 1,
      capturedAt: '2026-06-18T00:00:00.000Z'
    },
    target: {
      tagName: 'div',
      selector: 'header > div',
      rectViewport: { x: 0, y: 0, width: 100, height: 22 },
      rectPage: { x: 0, y: 0, width: 100, height: 22 },
      attributes: {},
      accessibility: {
        role: 'div',
        accessibleName: null,
        ariaLabel: null,
        ariaLabelledBy: null
      },
      computedStyles: {
        display: 'flex',
        position: 'static',
        width: '100px',
        height: '22px',
        margin: '0px',
        padding: '0px',
        color: 'rgb(250, 250, 250)',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        border: '0px',
        borderRadius: '0px',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: 'normal',
        textAlign: 'start',
        zIndex: 'auto'
      },
      textSnippet: '.factory idle',
      htmlSnippet: '<div></div>',
      fullPath: 'body > div#root > header'
    },
    nearbyText: [],
    ancestorPath: ['div', 'header'],
    screenshot: null
  }
}

describe('grab payload copy text', () => {
  beforeEach(() => {
    writeClipboardText.mockReset()
    writeClipboardText.mockResolvedValue()
    vi.stubGlobal('api', {
      ui: {
        writeClipboardText
      }
    })
    vi.restoreAllMocks()
  })

  it('formats paste-safe browser element context for the agent composer', () => {
    const text = grabCopy.formatGrabPayloadAsText(makePayload())

    expect(text).toContain('[orca-browser-element]')
    expect(text).toContain('url: http://127.0.0.1:5175/web-index.html')
    expect(text).toContain('tag: div')
    expect(text).toContain('selector: header > div')
    expect(text).toContain('label: .factory idle')
    expect(text).not.toContain('Attached browser context from')
    expect(text).not.toContain('Selected element:')
  })

  it('copies the formatted grab payload to the clipboard', () => {
    expect(grabCopy.copyBrowserGrabPayloadToClipboard(makePayload())).toBe(true)
    expect(writeClipboardText).toHaveBeenCalledWith(
      expect.stringContaining('[orca-browser-element]')
    )
  })

  it('does not treat paste-safe browser element context as a legacy dump', () => {
    const text = grabCopy.formatGrabPayloadAsText(makePayload())

    expect(grabCopy.copyBrowserGrabPayloadToClipboard(makePayload())).toBe(true)
    expect(writeClipboardText).toHaveBeenLastCalledWith(text)
  })
})
