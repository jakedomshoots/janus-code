export type LaunchedAgentTerminalTranscriptMirror = {
  observe: (args: { data: string; prompt: string }) => string | null
}

const ESC = String.fromCharCode(0x1b)
const BEL = String.fromCharCode(0x07)
const ANSI_ESCAPE_RE = new RegExp(
  `${ESC}(?:[@-Z\\\\-_]|\\[[0-?]*[ -/]*[@-~]|\\][^${BEL}]*(?:${BEL}|${ESC}\\\\))`,
  'g'
)
const INCOMPLETE_ANSI_ESCAPE_RE = new RegExp(
  `${ESC}(?:\\[[0-?]*[ -/]*|\\][^${BEL}${ESC}]*|\\S?)?$`,
  'g'
)
const RECENT_TEXT_LIMIT = 16_000
const ASSISTANT_PREVIEW_LIMIT = 6_000

export function createLaunchedAgentTerminalTranscriptMirror(): LaunchedAgentTerminalTranscriptMirror {
  let activePrompt = ''
  let recentText = ''

  return {
    observe({ data, prompt }) {
      const normalizedPrompt = prompt.trim()
      if (!normalizedPrompt) {
        return null
      }
      if (activePrompt !== normalizedPrompt) {
        activePrompt = normalizedPrompt
        recentText = ''
      }

      const cleanedData = stripTerminalControl(data).replace(/\r/g, '\n')
      if (!cleanedData.trim()) {
        return null
      }

      recentText = trimStartToLimit(`${recentText}\n${cleanedData}`, RECENT_TEXT_LIMIT)
      return extractAssistantPreview(recentText, normalizedPrompt)
    }
  }
}

function extractAssistantPreview(text: string, prompt: string): string | null {
  const lines = text.split('\n')
  const promptIndex = findLastPromptLineIndex(lines, prompt)
  const candidateLines = promptIndex >= 0 ? lines.slice(promptIndex + 1) : lines
  const usefulLines: string[] = []
  let previousWasBlank = false

  for (const rawLine of candidateLines) {
    const line = cleanTranscriptLine(rawLine)
    if (shouldDropTranscriptLine(line, prompt)) {
      continue
    }
    if (!line) {
      if (usefulLines.length > 0 && !previousWasBlank) {
        usefulLines.push('')
        previousWasBlank = true
      }
      continue
    }
    usefulLines.push(line)
    previousWasBlank = false
  }

  const preview = usefulLines.join('\n').trim()
  if (!hasReadableText(preview)) {
    return null
  }
  return preview.length > ASSISTANT_PREVIEW_LIMIT
    ? preview.slice(preview.length - ASSISTANT_PREVIEW_LIMIT).trim()
    : preview
}

function findLastPromptLineIndex(lines: string[], prompt: string): number {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (isPromptEchoLine(cleanTranscriptLine(lines[index]), prompt)) {
      return index
    }
  }
  return -1
}

function shouldDropTranscriptLine(line: string, prompt: string): boolean {
  if (!line) {
    return false
  }
  if (isPromptEchoLine(line, prompt)) {
    return true
  }

  const withoutPrefix = line.replace(/^[•●*-]\s+/, '')
  return (
    isTerminalProtocolResidueLine(withoutPrefix) ||
    isCliTrustPromptLine(withoutPrefix) ||
    isTerminalBannerLine(withoutPrefix) ||
    isShellNoiseLine(withoutPrefix) ||
    isCollapsedTerminalLine(withoutPrefix) ||
    isLeakedReasoningLine(withoutPrefix)
  )
}

function isPromptEchoLine(line: string, prompt: string): boolean {
  const normalizedLine = normalizeComparable(
    line
      .replace(/^[>❯]\s*/, '')
      .replace(/^[✨✦✧]\s*/, '')
      .replace(/^[•●*-]\s+/, '')
  )
  const normalizedPrompt = normalizeComparable(prompt)
  return normalizedLine === normalizedPrompt || normalizedLine.includes(normalizedPrompt)
}

function isTerminalBannerLine(line: string): boolean {
  return /^(welcome to .*(code|cli)!?|send \/help|directory:|session:|model:|version:)\b/i.test(
    line
  )
}

function isTerminalProtocolResidueLine(line: string): boolean {
  const compact = line.replace(/\s+/g, '')
  return /^(?:\d{1,4};[A-Za-z?])+$/.test(compact)
}

function isCliTrustPromptLine(line: string): boolean {
  const compact = normalizeComparable(line).replace(/\s+/g, '')
  return (
    compact.includes('doyoutrustthecontentsofthisdirectory') ||
    compact.includes('workingwithuntrustedcontents') ||
    compact.includes('trustingthedirectoryallows') ||
    compact.includes('pressentertocontinue') ||
    compact.includes('yes,continue2.no') ||
    compact.includes('0hquit')
  )
}

function isShellNoiseLine(line: string): boolean {
  return (
    /^\/.+\.zshrc:\d+:/i.test(line) ||
    /^[\w.-]+@.+\s[%$]\s+/.test(line) ||
    /^(yolo|YOLO)\b.*\b(thinking|code)\b/.test(line) ||
    /^(under-development features enabled|MCP startup interrupted|Tip:|context:|\/tasks:)/i.test(
      line
    ) ||
    /^Interrupted by user$/i.test(line)
  )
}

function isCollapsedTerminalLine(line: string): boolean {
  return /^\.\.\. \(\d+ more lines/i.test(line) || /ctrl\+o to expand/i.test(line)
}

function isLeakedReasoningLine(line: string): boolean {
  return /^(The user|I already|Maybe they|Let me|I need to|I should)\b/i.test(line)
}

function cleanTranscriptLine(rawLine: string): string {
  return removeControlCharacters(stripTerminalControl(rawLine))
    .replace(/\u00a0/g, ' ')
    .replace(/^[●]\s+/, '')
    .replace(/[ \t]+$/g, '')
    .trim()
}

function removeControlCharacters(value: string): string {
  let output = ''
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if ((code <= 0x1f && code !== 0x0a && code !== 0x0d) || (code >= 0x7f && code <= 0x9f)) {
      continue
    }
    output += value[index]
  }
  return output
}

function stripTerminalControl(data: string): string {
  const withoutAnsi = data.replace(ANSI_ESCAPE_RE, '').replace(INCOMPLETE_ANSI_ESCAPE_RE, '')
  let output = ''
  for (let index = 0; index < withoutAnsi.length; index += 1) {
    const code = withoutAnsi.charCodeAt(index)
    if ((code <= 0x1f && code !== 0x0a && code !== 0x0d) || (code >= 0x7f && code <= 0x9f)) {
      continue
    }
    output += withoutAnsi[index]
  }
  return output
}

function trimStartToLimit(value: string, limit: number): string {
  if (value.length <= limit) {
    return value
  }
  return value.slice(value.length - limit)
}

function hasReadableText(value: string): boolean {
  return /[\p{L}\p{N}]/u.test(value)
}

function normalizeComparable(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}
