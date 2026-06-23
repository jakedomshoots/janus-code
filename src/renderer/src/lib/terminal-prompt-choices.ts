import type { AgentStatusApprovalChoice } from '../../../shared/agent-status-types'

const MAX_TERMINAL_PROMPT_LINES = 10
const MAX_TERMINAL_PROMPT_CHARS = 1_200
const MAX_TERMINAL_PROMPT_CHOICES = 8

export function extractTerminalPromptText(tail: readonly string[]): string {
  const lines = tail
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-MAX_TERMINAL_PROMPT_LINES)
  const text = lines.join('\n')
  return text.length > MAX_TERMINAL_PROMPT_CHARS
    ? text.slice(text.length - MAX_TERMINAL_PROMPT_CHARS)
    : text
}

export function parseNumberedTerminalChoices(text: string): AgentStatusApprovalChoice[] {
  const choices: AgentStatusApprovalChoice[] = []
  const seen = new Set<string>()
  for (const line of text.split('\n')) {
    const match = line.trim().match(/^([0-9]{1,2})[.)]\s+(.+)$/)
    if (!match) {
      continue
    }
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
