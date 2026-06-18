function extractAnnotationFeedbackFromMarkdown(text: string): string {
  const feedback = [...text.matchAll(/\*\*Feedback:\*\*\s*(.+)/g)]
    .map((match) => match[1].trim())
    .filter((comment) => comment.length > 0)
  if (feedback.length === 0) {
    return ''
  }
  if (feedback.length === 1) {
    return feedback[0]
  }
  return feedback.map((comment, index) => `${index + 1}. ${comment}`).join('\n\n')
}

function isLegacyAnnotationMarkdownDumpParagraph(paragraph: string): boolean {
  const trimmed = paragraph.trim()
  if (!trimmed) {
    return false
  }
  if (trimmed.startsWith('## Design Feedback:')) {
    return true
  }
  if (trimmed.startsWith('### ') && /\*\*Intent:\*\*/.test(trimmed)) {
    return true
  }
  if (/\*\*Browser tab id:\*\*/.test(trimmed) && /\*\*Viewport:\*\*/.test(trimmed)) {
    return true
  }
  if (/\*\*Full DOM path:\*\*/.test(trimmed) && /\*\*Selector:\*\*/.test(trimmed)) {
    return true
  }
  return false
}

function isLegacyGrabDumpParagraph(paragraph: string): boolean {
  const trimmed = paragraph.trim()
  if (!trimmed) {
    return false
  }
  if (trimmed.startsWith('Attached browser context from')) {
    return true
  }
  if (trimmed.startsWith('Selected element:')) {
    return true
  }
  if (trimmed.includes('\nNearby context:')) {
    return true
  }
  if (trimmed.includes('\nComputed styles:')) {
    return true
  }
  if (trimmed.includes('\nText content:')) {
    return true
  }
  if (trimmed.includes('\nDimensions:')) {
    return true
  }
  if (trimmed.includes('\nHTML:')) {
    return true
  }
  if (trimmed.includes('\nAncestor path:')) {
    return true
  }
  if (trimmed.includes('\nFull DOM path:')) {
    return true
  }
  if (/^Page: https?:\/\//m.test(trimmed) && /\nSelector: /m.test(trimmed)) {
    return true
  }
  return false
}

export function containsLegacyBrowserGrabDump(text: string): boolean {
  return stripInjectedBrowserGrabDump(text) !== text
}

// Why: grab copy and annotation export used to flood the composer with DOM
// metadata; strip those blocks and keep only user feedback when possible.
export function stripInjectedBrowserGrabDump(text: string): string {
  const attachedContextIndex = text.indexOf('Attached browser context from')
  let withoutAttachedBlock =
    attachedContextIndex === -1 ? text : text.slice(0, attachedContextIndex).trimEnd()

  if (withoutAttachedBlock.trimStart().startsWith('Selected element:')) {
    withoutAttachedBlock = ''
  }

  const designFeedbackIndex = withoutAttachedBlock.indexOf('## Design Feedback:')
  if (designFeedbackIndex !== -1) {
    const beforeDesignFeedback = withoutAttachedBlock.slice(0, designFeedbackIndex).trimEnd()
    const markdownBlock = withoutAttachedBlock.slice(designFeedbackIndex)
    const feedback = extractAnnotationFeedbackFromMarkdown(markdownBlock)
    withoutAttachedBlock = beforeDesignFeedback
      ? feedback
        ? `${beforeDesignFeedback}\n\n${feedback}`
        : beforeDesignFeedback
      : feedback
  }

  return withoutAttachedBlock
    .split(/\n{2,}/)
    .filter(
      (paragraph) =>
        !isLegacyGrabDumpParagraph(paragraph) && !isLegacyAnnotationMarkdownDumpParagraph(paragraph)
    )
    .join('\n\n')
    .trim()
}
