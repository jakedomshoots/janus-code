import type {
  BrowserAwaitGrabSelectionArgs,
  BrowserCancelGrabArgs,
  BrowserCaptureSelectionScreenshotArgs,
  BrowserCaptureSelectionScreenshotResult,
  BrowserExtractHoverArgs,
  BrowserExtractHoverResult,
  BrowserGrabResult,
  BrowserSetGrabModeArgs,
  BrowserSetGrabModeResult
} from '../../../shared/browser-grab-types'
import { resolveWebBrowserGrabRoute } from './web-browser-grab-routing'
import {
  buildLocalBrowserGrabPayload,
  cancelLocalGrabOp,
  createLocalGrabSelectionListenerBinding,
  installLocalGrabOverlay,
  teardownLocalGrabOverlay
} from './web-client-local-browser-guest-grab'
import {
  activeLocalGrabOps,
  canAccessLocalBrowserGuestDocument,
  deleteLocalBrowserGuest,
  getLocalBrowserGuest,
  grabModeEnabledByPageId,
  hasLocalBrowserGuest,
  setLocalBrowserGuest
} from './web-client-local-browser-guest-registry'

export function isWebClientLocalBrowserGuestEnabled(): boolean {
  return Boolean((globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__)
}

export function registerWebClientLocalBrowserGuest(
  browserPageId: string,
  iframe: HTMLIFrameElement
): void {
  setLocalBrowserGuest(browserPageId, {
    iframe,
    captureHost: null,
    highlightBox: null,
    currentElement: null,
    pointerMoveHandler: null,
    savedIframePointerEvents: null
  })
}

export function unregisterWebClientLocalBrowserGuest(browserPageId: string): void {
  grabModeEnabledByPageId.delete(browserPageId)
  teardownLocalGrabOverlay(browserPageId)
  deleteLocalBrowserGuest(browserPageId)
  cancelLocalGrabOp(browserPageId)
}

export function notifyWebClientLocalBrowserGuestLoaded(browserPageId: string): void {
  if (!grabModeEnabledByPageId.has(browserPageId)) {
    return
  }
  installLocalGrabOverlay(browserPageId)
  const op = activeLocalGrabOps.get(browserPageId)
  const host = getLocalBrowserGuest(browserPageId)?.captureHost
  if (op && host) {
    op.attachSelectionListeners(host)
  }
}

export async function setWebClientLocalGrabMode(
  args: BrowserSetGrabModeArgs
): Promise<BrowserSetGrabModeResult> {
  if (resolveWebBrowserGrabRoute(args.browserPageId)) {
    return { ok: false, reason: 'not-ready' }
  }
  if (!canAccessLocalBrowserGuestDocument(args.browserPageId)) {
    return { ok: false, reason: 'not-ready' }
  }
  if (!args.enabled) {
    grabModeEnabledByPageId.delete(args.browserPageId)
    cancelLocalGrabOp(args.browserPageId)
    teardownLocalGrabOverlay(args.browserPageId)
    return { ok: true }
  }
  grabModeEnabledByPageId.add(args.browserPageId)
  return installLocalGrabOverlay(args.browserPageId)
    ? { ok: true }
    : { ok: false, reason: 'not-ready' }
}

export async function awaitWebClientLocalGrabSelection(
  args: BrowserAwaitGrabSelectionArgs
): Promise<BrowserGrabResult> {
  if (resolveWebBrowserGrabRoute(args.browserPageId)) {
    return {
      opId: args.opId,
      kind: 'error',
      reason: 'Remote browser tab is not ready for grab mode.'
    }
  }
  const guest = getLocalBrowserGuest(args.browserPageId)
  const host = guest?.captureHost
  if (!guest || !host) {
    return { opId: args.opId, kind: 'error', reason: 'Browser tab is not ready for grab mode.' }
  }

  const existing = activeLocalGrabOps.get(args.browserPageId)
  if (existing) {
    existing.resolve({ opId: existing.opId, kind: 'cancelled', reason: 'user' })
    existing.cleanup()
    activeLocalGrabOps.delete(args.browserPageId)
  }

  return new Promise<BrowserGrabResult>((resolve) => {
    const settle = (result: BrowserGrabResult): void => {
      const op = activeLocalGrabOps.get(args.browserPageId)
      if (!op || op.opId !== args.opId) {
        return
      }
      activeLocalGrabOps.delete(args.browserPageId)
      op.cleanup()
      resolve(result)
    }
    const binding = createLocalGrabSelectionListenerBinding({
      browserPageId: args.browserPageId,
      opId: args.opId,
      settle
    })
    activeLocalGrabOps.set(args.browserPageId, {
      opId: args.opId,
      resolve: settle,
      cleanup: binding.cleanup,
      attachSelectionListeners: binding.attachSelectionListeners
    })
    binding.attachSelectionListeners(host)
  })
}

export async function cancelWebClientLocalGrab(args: BrowserCancelGrabArgs): Promise<boolean> {
  if (resolveWebBrowserGrabRoute(args.browserPageId)) {
    return false
  }
  grabModeEnabledByPageId.delete(args.browserPageId)
  cancelLocalGrabOp(args.browserPageId)
  teardownLocalGrabOverlay(args.browserPageId)
  return true
}

export async function captureWebClientLocalSelectionScreenshot(
  args: BrowserCaptureSelectionScreenshotArgs
): Promise<BrowserCaptureSelectionScreenshotResult> {
  if (!canAccessLocalBrowserGuestDocument(args.browserPageId)) {
    return { ok: false, reason: 'Browser tab is not ready for screenshot capture.' }
  }
  return {
    ok: true,
    screenshot: {
      mimeType: 'image/png',
      dataUrl: '',
      width: Math.round(args.rect.width),
      height: Math.round(args.rect.height)
    }
  }
}

export async function extractWebClientLocalHoverPayload(
  args: BrowserExtractHoverArgs
): Promise<BrowserExtractHoverResult> {
  const guest = getLocalBrowserGuest(args.browserPageId)
  const element = guest?.currentElement
  if (!guest || !element) {
    return { ok: false, reason: 'No element is currently hovered.' }
  }
  const payload = buildLocalBrowserGrabPayload(args.browserPageId, element)
  if (!payload) {
    return { ok: false, reason: 'No element is currently hovered.' }
  }
  return { ok: true, payload }
}

export async function openWebClientLocalBrowserDevTools(browserPageId: string): Promise<boolean> {
  if (!canAccessLocalBrowserGuestDocument(browserPageId)) {
    return false
  }
  const guest = getLocalBrowserGuest(browserPageId)
  const doc = guest?.iframe.contentDocument
  if (!doc || !guest) {
    return false
  }
  const snapshot = {
    url: guest.iframe.src,
    title: doc.title,
    html: doc.documentElement.outerHTML.slice(0, 50_000)
  }
  await window.api.ui.writeClipboardText(JSON.stringify(snapshot, null, 2))
  return true
}

export function shouldHandleWebClientLocalBrowserApi(browserPageId: string): boolean {
  return isWebClientLocalBrowserGuestEnabled() && hasLocalBrowserGuest(browserPageId)
}
