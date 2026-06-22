import type { BrowserGrabPayload } from '../../../../shared/browser-grab-types'
import { stripInjectedBrowserGrabDump } from './strip-browser-grab-dump'

export const ORCA_BROWSER_ELEMENT_MARKER = '[orca-browser-element]'

function inlineClipboardText(content: string): string {
  return content.replace(/\s+/g, ' ').trim()
}

// Why: use a dedicated marker and field names that legacy grab-dump stripping does
// not recognize, so users can paste element context into the agent composer safely.
export function formatGrabPayloadAsText(payload: BrowserGrabPayload): string {
  const { page, target } = payload
  const label =
    target.accessibility.accessibleName?.trim() ||
    target.textSnippet?.trim() ||
    target.accessibility.ariaLabel?.trim() ||
    ''
  const lines = [
    ORCA_BROWSER_ELEMENT_MARKER,
    `url: ${page.sanitizedUrl}`,
    ...(page.title ? [`title: ${inlineClipboardText(page.title)}`] : []),
    `tag: ${target.tagName}`,
    `selector: ${target.selector}`,
    ...(label ? [`label: ${inlineClipboardText(label)}`] : []),
    `bounds: ${Math.round(target.rectViewport.width)}x${Math.round(target.rectViewport.height)} @ (${Math.round(target.rectViewport.x)}, ${Math.round(target.rectViewport.y)})`
  ]
  if (target.elementPath) {
    lines.push(`path: ${target.elementPath}`)
  }
  if (target.sourceFile) {
    lines.push(`source: ${inlineClipboardText(target.sourceFile)}`)
  }
  if (payload.nearbyText.length > 0) {
    lines.push(`nearby: ${payload.nearbyText.map((text) => inlineClipboardText(text)).join(' | ')}`)
  }
  if (target.htmlSnippet) {
    lines.push(`html: ${inlineClipboardText(target.htmlSnippet).slice(0, 2000)}`)
  }
  return lines.join('\n')
}

export function copyBrowserGrabPayloadToClipboard(payload: BrowserGrabPayload): boolean {
  const text = stripInjectedBrowserGrabDump(formatGrabPayloadAsText(payload))
  void window.api.ui.writeClipboardText(text)
  return text.length > 0
}
