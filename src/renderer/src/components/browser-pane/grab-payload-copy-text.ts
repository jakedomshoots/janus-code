import type { BrowserGrabPayload } from '../../../../shared/browser-grab-types'
import { stripInjectedBrowserGrabDump } from './strip-browser-grab-dump'

// Why: grab copy must never emit the legacy DOM report shape — that dump was
// leaking into agent composer drafts via clipboard paste and stale HMR bundles.
export function formatGrabPayloadAsText(_payload: BrowserGrabPayload): string {
  return ''
}

// Why: stale dev bundles can keep the old formatter alive; scrub right before
// clipboard write and clear the clipboard when the payload is dump-only.
export function copyBrowserGrabPayloadToClipboard(payload: BrowserGrabPayload): boolean {
  const text = stripInjectedBrowserGrabDump(formatGrabPayloadAsText(payload))
  void window.api.ui.writeClipboardText(text)
  return text.length > 0
}
