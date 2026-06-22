import type { BrowserGrabResult } from '../../../shared/browser-grab-types'

export type LocalBrowserGuest = {
  iframe: HTMLIFrameElement
  captureHost: HTMLDivElement | null
  highlightBox: HTMLDivElement | null
  currentElement: Element | null
  pointerMoveHandler: ((event: MouseEvent) => void) | null
  savedIframePointerEvents: string | null
}

export type ActiveLocalGrabOp = {
  opId: string
  resolve: (result: BrowserGrabResult) => void
  cleanup: () => void
  attachSelectionListeners: (host: HTMLDivElement) => void
}

const guestsByPageId = new Map<string, LocalBrowserGuest>()

export const grabModeEnabledByPageId = new Set<string>()

export const activeLocalGrabOps = new Map<string, ActiveLocalGrabOp>()

export function getLocalBrowserGuest(browserPageId: string): LocalBrowserGuest | null {
  return guestsByPageId.get(browserPageId) ?? null
}

export function setLocalBrowserGuest(browserPageId: string, guest: LocalBrowserGuest): void {
  guestsByPageId.set(browserPageId, guest)
}

export function deleteLocalBrowserGuest(browserPageId: string): void {
  guestsByPageId.delete(browserPageId)
}

export function hasLocalBrowserGuest(browserPageId: string): boolean {
  return guestsByPageId.has(browserPageId)
}

export function getLocalBrowserGuestDocument(browserPageId: string): Document | null {
  const guest = getLocalBrowserGuest(browserPageId)
  if (!guest) {
    return null
  }
  try {
    return guest.iframe.contentDocument
  } catch {
    return null
  }
}

export function canAccessLocalBrowserGuestDocument(browserPageId: string): boolean {
  return getLocalBrowserGuestDocument(browserPageId) !== null
}
