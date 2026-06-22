import type {
  BrowserGrabComputedStyles,
  BrowserGrabPayload,
  BrowserPageAnnotation
} from '../../../../shared/browser-grab-types'
import { stripInjectedBrowserGrabDump } from './strip-browser-grab-dump'

function formatPageHeading(payload: BrowserGrabPayload): string {
  try {
    const url = new URL(payload.page.sanitizedUrl)
    return `${url.pathname}${url.search}`
  } catch {
    return payload.page.sanitizedUrl || 'current page'
  }
}

function annotationElementLabel(payload: BrowserGrabPayload): string {
  const react = payload.target.reactComponents
  const accessibleName = payload.target.accessibility.accessibleName
  const base = accessibleName
    ? `${payload.target.tagName} "${inlineText(accessibleName)}"`
    : payload.target.textSnippet
      ? `${payload.target.tagName} "${inlineText(payload.target.textSnippet).slice(0, 60)}"`
      : payload.target.tagName
  return react ? `${inlineText(react)} ${base}` : base
}

function inlineText(content: string): string {
  return content.replace(/\s+/g, ' ').trim()
}

function formatStyles(styles: BrowserGrabComputedStyles): string[] {
  const lines: string[] = []
  const entries: [string, string][] = [
    ['display', styles.display],
    ['position', styles.position],
    ['width', styles.width],
    ['height', styles.height],
    ['margin', styles.margin],
    ['padding', styles.padding],
    ['color', styles.color],
    ['background', styles.backgroundColor],
    ['border', styles.border],
    ['border-radius', styles.borderRadius],
    ['font-family', styles.fontFamily],
    ['font-size', styles.fontSize],
    ['font-weight', styles.fontWeight],
    ['line-height', styles.lineHeight],
    ['text-align', styles.textAlign],
    ['z-index', styles.zIndex]
  ]
  for (const [name, value] of entries) {
    if (!value || value === 'auto' || value === 'normal') {
      continue
    }
    if (name === 'position' && value === 'static') {
      continue
    }
    if (name === 'display' && value === 'inline') {
      continue
    }
    if (name === 'background' && value === 'rgba(0, 0, 0, 0)') {
      continue
    }
    lines.push(`- ${name}: ${value}`)
  }
  return lines
}

// Why: annotation snippets come from page DOM; avoid spreading every backtick
// run into Math.max when generated HTML contains many fence characters.
function maxBacktickRunLength(content: string, floor: number): number {
  let maxRun = floor
  for (const match of content.matchAll(/`+/g)) {
    maxRun = Math.max(maxRun, match[0].length)
  }
  return maxRun
}

function fence(language: string, content: string): string[] {
  const maxRun = maxBacktickRunLength(content, 3)
  const marker = '`'.repeat(maxRun + 1)
  return [`${marker}${language}`, content, marker]
}

function inlineCode(content: string): string {
  const maxRun = maxBacktickRunLength(content, 0)
  const marker = '`'.repeat(maxRun + 1)
  const padding = content.startsWith('`') || content.endsWith('`') ? ' ' : ''
  return `${marker}${padding}${content}${padding}${marker}`
}

export function formatBrowserAnnotationsAsMarkdown(annotations: BrowserPageAnnotation[]): string {
  if (annotations.length === 0) {
    return ''
  }

  const firstAnnotation = annotations[0]
  const first = firstAnnotation.payload
  const lines: string[] = [
    `## Design Feedback: ${formatPageHeading(first)}`,
    '',
    `**URL:** ${first.page.sanitizedUrl}`,
    `**Browser tab id:** ${firstAnnotation.browserPageId}`,
    `**Janus CLI:** Use ${inlineCode(`--page ${firstAnnotation.browserPageId}`)} to target this browser tab.`,
    `**Viewport:** ${first.page.viewportWidth}x${first.page.viewportHeight}`,
    ''
  ]

  annotations.forEach((annotation, index) => {
    const { payload } = annotation
    const { target } = payload
    const rect = target.rectViewport
    const styleLines = formatStyles(target.computedStyles)

    lines.push(`### ${index + 1}. ${annotationElementLabel(payload)}`)
    lines.push(`**Intent:** ${annotation.intent}`)
    lines.push(`**Selector:** ${inlineCode(target.selector)}`)
    if (target.elementPath) {
      lines.push(`**Location:** ${inlineCode(target.elementPath)}`)
    }
    if (target.sourceFile) {
      lines.push(`**Source:** ${inlineText(target.sourceFile)}`)
    }
    if (target.reactComponents) {
      lines.push(`**React:** ${inlineText(target.reactComponents)}`)
    }
    lines.push(
      `**Bounds:** x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, ${Math.round(rect.width)}x${Math.round(rect.height)}`
    )
    if (target.cssClasses) {
      lines.push(`**Classes:** ${inlineCode(target.cssClasses)}`)
    }
    if (target.selectedText) {
      lines.push(`**Selected text:** "${inlineText(target.selectedText)}"`)
    } else if (target.textSnippet) {
      lines.push(`**Text:** "${inlineText(target.textSnippet)}"`)
    }
    if (payload.nearbyText.length > 0) {
      lines.push('**Nearby text:**')
      for (const text of payload.nearbyText) {
        lines.push(`- ${inlineText(text)}`)
      }
    }
    if (target.nearbyElements?.length) {
      lines.push('**Nearby elements:**')
      for (const element of target.nearbyElements) {
        lines.push(`- ${inlineText(element)}`)
      }
    }
    if (styleLines.length > 0) {
      lines.push('**Computed styles:**')
      lines.push(...styleLines)
    }
    if (target.fullPath) {
      lines.push(`**Full DOM path:** ${inlineCode(target.fullPath)}`)
    }
    if (target.htmlSnippet) {
      lines.push('**HTML:**')
      lines.push(...fence('html', target.htmlSnippet))
    }
    lines.push(`**Feedback:** ${inlineText(annotation.comment)}`)
    lines.push('')
  })

  return lines.join('\n').trimEnd()
}

export const ORCA_BROWSER_ANNOTATION_MARKER = '[orca-browser-annotation]'

function formatAnnotationForClipboard(
  annotation: BrowserPageAnnotation,
  index: number | null
): string {
  const { payload, comment, intent } = annotation
  const { page, target } = payload
  const label =
    target.accessibility.accessibleName?.trim() ||
    target.textSnippet?.trim() ||
    target.accessibility.ariaLabel?.trim() ||
    ''
  const prefix =
    index === null ? ORCA_BROWSER_ANNOTATION_MARKER : `[orca-browser-annotation ${index}]`
  const lines = [
    prefix,
    `url: ${page.sanitizedUrl}`,
    `tag: ${target.tagName}`,
    `selector: ${target.selector}`,
    ...(label ? [`label: ${inlineText(label)}`] : []),
    `intent: ${intent}`,
    `feedback: ${inlineText(comment)}`
  ]
  if (target.elementPath) {
    lines.push(`path: ${target.elementPath}`)
  }
  if (target.sourceFile) {
    lines.push(`source: ${inlineText(target.sourceFile)}`)
  }
  return lines.join('\n')
}

// Why: clipboard copy should include element targeting plus feedback so the user
// can paste a complete note into the agent composer without the legacy DOM dump.
export function formatBrowserAnnotationsForClipboard(annotations: BrowserPageAnnotation[]): string {
  if (annotations.length === 0) {
    return ''
  }
  if (annotations.length === 1) {
    return formatAnnotationForClipboard(annotations[0], null)
  }
  return annotations
    .map((annotation, index) => formatAnnotationForClipboard(annotation, index + 1))
    .join('\n\n')
}

// Why: composer attach should only carry the user's annotation notes — browser
// tab metadata and DOM targeting already live in the annotation store/CLI.
export function formatBrowserAnnotationsForAgentPrompt(
  annotations: BrowserPageAnnotation[]
): string {
  const comments = annotations
    .map((annotation) => stripInjectedBrowserGrabDump(inlineText(annotation.comment)))
    .filter((comment) => comment.length > 0)

  if (comments.length === 0) {
    return ''
  }
  if (comments.length === 1) {
    return comments[0]
  }
  return comments.map((comment, index) => `${index + 1}. ${comment}`).join('\n\n')
}
