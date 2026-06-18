import { stripInjectedBrowserGrabDump } from '../../../shared/browser-grab-dump-strip'

let installed = false

function tryPatchClipboardWriteText(target: {
  writeText: (text: string) => Promise<void>
}): boolean {
  try {
    const writeText = target.writeText.bind(target)
    target.writeText = (text: string) => writeText(stripInjectedBrowserGrabDump(text))
    return true
  } catch {
    // Some hosts freeze navigator.clipboard; preload/web-preload scrub writeClipboardText instead.
    return false
  }
}

// Why: catch direct navigator.clipboard writes in web dev; Electron preload APIs are
// read-only so scrubbing happens in preload instead of patching window.api.ui here.
export function installClipboardGrabDumpGuards(): void {
  if (installed || typeof window === 'undefined') {
    return
  }

  const navigatorClipboard = navigator.clipboard
  if (!navigatorClipboard?.writeText) {
    return
  }

  if (tryPatchClipboardWriteText(navigatorClipboard)) {
    installed = true
  }
}
