import type { AgentStatusApprovalChoice } from '../../../shared/agent-status-types'

const MAX_TERMINAL_PROMPT_LINES = 10
const MAX_TERMINAL_PROMPT_CHARS = 1_200
const MAX_TERMINAL_PROMPT_CHOICES = 8

export function extractTerminalPromptText(tail: readonly string[]): string {
  const lines = tail
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-MAX_TERMINAL_PROMPT_LINES)
  const text = trimToInteractivePrompt(lines.join('\n'))
  return text.length > MAX_TERMINAL_PROMPT_CHARS
    ? text.slice(text.length - MAX_TERMINAL_PROMPT_CHARS)
    : text
}

function trimToInteractivePrompt(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const numberedStarts = Array.from(normalized.matchAll(/\s1[.)]\s+/g))
  const firstChoiceIndex = numberedStarts.at(-1)?.index
  if (firstChoiceIndex === undefined) {
    return normalized
  }
  const promptHeadings = Array.from(
    normalized.slice(0, firstChoiceIndex).matchAll(/\b(?:Select|Choose)\s+/g)
  )
  const promptStart = promptHeadings.at(-1)?.index
  const promptText = promptStart === undefined ? normalized : normalized.slice(promptStart)
  return trimAfterTerminalInstruction(promptText)
}

function trimAfterTerminalInstruction(text: string): string {
  const instructionPatterns = [
    /\bPress enter\b.*?\bgo back\b/i,
    /\bPress enter\b.*?\bcontinue\b/i,
    /\bPress enter\b.*?\bconfirm\b/i
  ]
  const instruction = instructionPatterns
    .map((pattern) => pattern.exec(text))
    .find((match) => match?.index !== undefined)
  return instruction ? text.slice(0, instruction.index + instruction[0].length) : text
}

export function parseNumberedTerminalChoices(text: string): AgentStatusApprovalChoice[] {
  const choices: AgentStatusApprovalChoice[] = []
  const seen = new Set<string>()
  const normalized = text.replace(/\s+/g, ' ').trim()
  const pattern = /(?:^|\s)([0-9]{1,2})[.)]\s+(.+?)(?=\s+[0-9]{1,2}[.)]\s+|\s+Press enter\b|$)/g
  for (const match of normalized.matchAll(pattern)) {
    const input = match[1]
    const label = match[2]?.trim()
    if (!input || !label || seen.has(input)) {
      continue
    }
    seen.add(input)
    choices.push({ id: input, label, input })
    if (choices.length >= MAX_TERMINAL_PROMPT_CHOICES) {
      break
    }
  }
  return choices
}
