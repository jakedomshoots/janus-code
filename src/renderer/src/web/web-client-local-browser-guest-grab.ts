import type { BrowserGrabPayload, BrowserGrabResult } from '../../../shared/browser-grab-types'
import {
  activeLocalGrabOps,
  getLocalBrowserGuest,
  getLocalBrowserGuestDocument,
  type LocalBrowserGuest
} from './web-client-local-browser-guest-registry'

function buildSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`
  }
  const tag = element.tagName.toLowerCase()
  const parent = element.parentElement
  if (!parent) {
    return tag
  }
  const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName)
  const index = siblings.indexOf(element) + 1
  return `${buildSelector(parent)} > ${tag}:nth-of-type(${index})`
}

export function isSelectableGuestElement(element: Element | null): element is HTMLElement {
  if (!element || !(element instanceof HTMLElement)) {
    return false
  }
  const tag = element.tagName
  return tag !== 'HTML' && tag !== 'BODY'
}

export function resolveGuestElementFromHostPointer(
  browserPageId: string,
  clientX: number,
  clientY: number
): Element | null {
  const guest = getLocalBrowserGuest(browserPageId)
  const doc = getLocalBrowserGuestDocument(browserPageId)
  if (!guest || !doc) {
    return null
  }
  const iframeRect = guest.iframe.getBoundingClientRect()
  const x = clientX - iframeRect.left
  const y = clientY - iframeRect.top
  if (x < 0 || y < 0 || x > iframeRect.width || y > iframeRect.height) {
    return null
  }
  const element = doc.elementFromPoint(x, y)
  return isSelectableGuestElement(element) ? element : null
}

export function buildLocalBrowserGrabPayload(
  browserPageId: string,
  element: Element
): BrowserGrabPayload | null {
  const guest = getLocalBrowserGuest(browserPageId)
  const doc = getLocalBrowserGuestDocument(browserPageId)
  const guestWindow = guest?.iframe.contentWindow
  if (!guest || !doc || !guestWindow || !isSelectableGuestElement(element)) {
    return null
  }
  const iframeRect = guest.iframe.getBoundingClientRect()
  const rect = element.getBoundingClientRect()
  const rectViewport = {
    x: rect.left - iframeRect.left,
    y: rect.top - iframeRect.top,
    width: rect.width,
    height: rect.height
  }
  const rectPage = {
    x: rect.x + guestWindow.scrollX,
    y: rect.y + guestWindow.scrollY,
    width: rect.width,
    height: rect.height
  }
  const computed = guestWindow.getComputedStyle(element)
  return {
    page: {
      sanitizedUrl: guest.iframe.src,
      title: doc.title,
      viewportWidth: guestWindow.innerWidth,
      viewportHeight: guestWindow.innerHeight,
      scrollX: guestWindow.scrollX,
      scrollY: guestWindow.scrollY,
      devicePixelRatio: guestWindow.devicePixelRatio,
      capturedAt: new Date().toISOString()
    },
    nearbyText: [],
    ancestorPath: [],
    screenshot: null,
    target: {
      tagName: element.tagName.toLowerCase(),
      selector: buildSelector(element),
      textSnippet: (element.textContent ?? '').trim().slice(0, 200),
      htmlSnippet: element.outerHTML.slice(0, 4096),
      attributes: {},
      accessibility: {
        role: element.getAttribute('role'),
        accessibleName: element.getAttribute('aria-label'),
        ariaLabel: element.getAttribute('aria-label'),
        ariaLabelledBy: element.getAttribute('aria-labelledby')
      },
      rectViewport,
      rectPage,
      computedStyles: {
        display: computed.display,
        position: computed.position,
        width: computed.width,
        height: computed.height,
        margin: computed.margin,
        padding: computed.padding,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderRadius: computed.borderRadius,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        textAlign: computed.textAlign,
        zIndex: computed.zIndex
      }
    }
  }
}

export function teardownLocalGrabOverlay(browserPageId: string): void {
  const guest = getLocalBrowserGuest(browserPageId)
  if (!guest) {
    return
  }
  if (guest.captureHost && guest.pointerMoveHandler) {
    guest.captureHost.removeEventListener('mousemove', guest.pointerMoveHandler)
  }
  guest.highlightBox?.remove()
  guest.captureHost?.remove()
  guest.captureHost = null
  guest.highlightBox = null
  guest.pointerMoveHandler = null
  guest.currentElement = null
  if (guest.savedIframePointerEvents !== null) {
    guest.iframe.style.pointerEvents = guest.savedIframePointerEvents
    guest.savedIframePointerEvents = null
  }
}

function updateLocalGrabHighlight(
  guest: LocalBrowserGuest,
  element: Element | null,
  container: HTMLElement
): void {
  const highlight = guest.highlightBox
  if (!highlight || !isSelectableGuestElement(element)) {
    if (highlight) {
      highlight.style.display = 'none'
    }
    guest.currentElement = null
    return
  }
  guest.currentElement = element
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  highlight.style.left = `${elementRect.left - containerRect.left}px`
  highlight.style.top = `${elementRect.top - containerRect.top}px`
  highlight.style.width = `${elementRect.width}px`
  highlight.style.height = `${elementRect.height}px`
  highlight.style.display = 'block'
}

export function installLocalGrabOverlay(browserPageId: string): boolean {
  const guest = getLocalBrowserGuest(browserPageId)
  const doc = getLocalBrowserGuestDocument(browserPageId)
  if (!guest || !doc) {
    return false
  }
  const container = guest.iframe.parentElement
  if (!container) {
    return false
  }
  teardownLocalGrabOverlay(browserPageId)
  if (guest.savedIframePointerEvents === null) {
    guest.savedIframePointerEvents = guest.iframe.style.pointerEvents
  }
  // Why: block the guest page from receiving real clicks while grab mode is armed.
  guest.iframe.style.pointerEvents = 'none'
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative'
  }
  const host = document.createElement('div')
  host.dataset.orcaWebGrabHost = 'true'
  host.style.cssText =
    'position:absolute;inset:0;z-index:40;pointer-events:all;cursor:crosshair;background:transparent;'
  const highlight = document.createElement('div')
  highlight.style.cssText =
    'position:absolute;border:2px solid rgba(255,255,255,0.9);border-radius:3px;pointer-events:none;display:none;background:rgba(255,255,255,0.08);box-shadow:0 0 0 1px rgba(0,0,0,0.3),0 2px 8px rgba(0,0,0,0.15);'
  host.appendChild(highlight)
  container.appendChild(host)
  guest.captureHost = host
  guest.highlightBox = highlight

  const onPointerMove = (event: MouseEvent): void => {
    const element = resolveGuestElementFromHostPointer(browserPageId, event.clientX, event.clientY)
    updateLocalGrabHighlight(guest, element, container)
  }
  guest.pointerMoveHandler = onPointerMove
  host.addEventListener('mousemove', onPointerMove)
  return true
}

export function cancelLocalGrabOp(browserPageId: string): void {
  const op = activeLocalGrabOps.get(browserPageId)
  if (!op) {
    return
  }
  activeLocalGrabOps.delete(browserPageId)
  op.cleanup()
  op.resolve({ opId: op.opId, kind: 'cancelled', reason: 'user' })
}

export function createLocalGrabSelectionListenerBinding(args: {
  browserPageId: string
  opId: string
  settle: (result: BrowserGrabResult) => void
}): {
  cleanup: () => void
  attachSelectionListeners: (host: HTMLDivElement) => void
} {
  let boundHost: HTMLDivElement | null = null
  let onClick: ((event: MouseEvent) => void) | null = null
  let onContextMenu: ((event: MouseEvent) => void) | null = null

  const cleanup = (): void => {
    if (boundHost && onClick) {
      boundHost.removeEventListener('click', onClick, true)
    }
    if (boundHost && onContextMenu) {
      boundHost.removeEventListener('contextmenu', onContextMenu, true)
    }
    boundHost = null
    onClick = null
    onContextMenu = null
  }

  const attachSelectionListeners = (host: HTMLDivElement): void => {
    cleanup()
    boundHost = host
    const guest = getLocalBrowserGuest(args.browserPageId)
    const resolveClickedElement = (event: MouseEvent): Element | null => {
      return (
        resolveGuestElementFromHostPointer(args.browserPageId, event.clientX, event.clientY) ??
        guest?.currentElement ??
        null
      )
    }
    onClick = (event: MouseEvent): void => {
      event.preventDefault()
      event.stopPropagation()
      const element = resolveClickedElement(event)
      if (!element) {
        args.settle({ opId: args.opId, kind: 'cancelled', reason: 'user' })
        return
      }
      const payload = buildLocalBrowserGrabPayload(args.browserPageId, element)
      if (!payload) {
        args.settle({ opId: args.opId, kind: 'error', reason: 'Failed to extract element context' })
        return
      }
      args.settle({ opId: args.opId, kind: 'selected', payload })
    }
    onContextMenu = (event: MouseEvent): void => {
      event.preventDefault()
      event.stopPropagation()
      const element = resolveClickedElement(event)
      if (!element) {
        args.settle({ opId: args.opId, kind: 'cancelled', reason: 'user' })
        return
      }
      const payload = buildLocalBrowserGrabPayload(args.browserPageId, element)
      if (!payload) {
        args.settle({ opId: args.opId, kind: 'error', reason: 'Failed to extract element context' })
        return
      }
      args.settle({ opId: args.opId, kind: 'context-selected', payload })
    }
    host.addEventListener('click', onClick, true)
    host.addEventListener('contextmenu', onContextMenu, true)
  }

  return { cleanup, attachSelectionListeners }
}
