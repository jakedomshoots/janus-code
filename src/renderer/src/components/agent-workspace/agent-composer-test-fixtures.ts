import type { BrowserPageAnnotation } from '../../../../shared/browser-grab-types'

const mockBrowserPageTitle = 'Pricing'

export function makeAnnotation(): BrowserPageAnnotation {
  return {
    id: 'annotation-1',
    browserPageId: 'browser-page-1',
    comment: 'Make the primary action clearer.',
    intent: 'change',
    priority: 'important',
    createdAt: '2026-06-16T12:00:00.000Z',
    payload: {
      page: {
        sanitizedUrl: 'https://example.com/pricing',
        title: mockBrowserPageTitle,
        viewportWidth: 1280,
        viewportHeight: 720,
        scrollX: 0,
        scrollY: 0,
        devicePixelRatio: 2,
        capturedAt: '2026-06-16T12:00:00.000Z'
      },
      target: {
        tagName: 'button',
        selector: 'main button.primary',
        elementPath: 'main > button.primary',
        fullPath: 'html > body > main > button.primary',
        cssClasses: 'primary',
        nearbyElements: ['span "$29/month"'],
        selectedText: null,
        isFixed: false,
        reactComponents: '<PricingCta>',
        sourceFile: 'src/components/PricingCta.tsx:42:8',
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
          fontFamily: 'Geist, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '20px',
          textAlign: 'center',
          zIndex: 'auto'
        }
      },
      nearbyText: ['Pro', '$29/month'],
      ancestorPath: ['section', 'main', 'body'],
      screenshot: null
    }
  }
}
