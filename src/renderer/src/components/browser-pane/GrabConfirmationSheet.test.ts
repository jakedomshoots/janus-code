import { describe, expect, it } from 'vitest'
import { formatGrabPayloadAsText } from './grab-payload-copy-text'
import type { BrowserGrabPayload } from '../../../../shared/browser-grab-types'

function makeTestPayload(overrides?: Partial<BrowserGrabPayload>): BrowserGrabPayload {
  return {
    page: {
      sanitizedUrl: 'https://example.com/pricing',
      title: 'Pricing - Example',
      viewportWidth: 1280,
      viewportHeight: 720,
      scrollX: 0,
      scrollY: 0,
      devicePixelRatio: 2,
      capturedAt: '2026-04-10T00:00:00.000Z'
    },
    target: {
      tagName: 'button',
      selector: 'main section:nth-of-type(2) button.primary',
      textSnippet: 'Start free trial',
      htmlSnippet: '<button class="primary">Start free trial</button>',
      attributes: { class: 'primary', type: 'button' },
      accessibility: {
        role: 'button',
        accessibleName: 'Start free trial',
        ariaLabel: null,
        ariaLabelledBy: null
      },
      rectViewport: { x: 400, y: 300, width: 148, height: 44 },
      rectPage: { x: 400, y: 300, width: 148, height: 44 },
      computedStyles: {
        display: 'inline-flex',
        position: 'relative',
        width: '148px',
        height: '44px',
        margin: '0px',
        padding: '12px 24px',
        color: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(99, 102, 241)',
        border: '0px none',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '20px',
        textAlign: 'center',
        zIndex: 'auto'
      }
    },
    nearbyText: ['Pro', '$29/month', 'Unlimited projects'],
    ancestorPath: ['section', 'main', 'body'],
    screenshot: null,
    ...overrides
  }
}

describe('formatGrabPayloadAsText', () => {
  it('returns paste-safe browser element context for agent composer drafts', () => {
    const text = formatGrabPayloadAsText(makeTestPayload())

    expect(text).toContain('[orca-browser-element]')
    expect(text).toContain('url: https://example.com/pricing')
    expect(text).toContain('selector: main section:nth-of-type(2) button.primary')
    expect(text).toContain('label: Start free trial')
    expect(text).not.toContain('Attached browser context from')
  })
})
