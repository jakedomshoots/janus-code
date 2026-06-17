import { tokenizeCustomCommandTemplate } from './commit-message-prompt'
import { isTuiAgent } from './tui-agent-config'
import type { TuiAgent } from './types'

export const TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID = 'provider-default'

export type TuiAgentModelOption = {
  id: string
  label: string
}

type TuiAgentModelFlag = '--model' | '--mode'

const PROVIDER_DEFAULT_MODEL: TuiAgentModelOption = {
  id: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
  label: 'Provider default'
}

const TUI_AGENT_MODEL_OPTIONS: Partial<Record<TuiAgent, readonly TuiAgentModelOption[]>> = {
  claude: [
    { id: 'haiku', label: 'Haiku' },
    { id: 'sonnet', label: 'Sonnet' },
    { id: 'opus', label: 'Opus' }
  ],
  openclaude: [
    { id: 'haiku', label: 'Haiku' },
    { id: 'sonnet', label: 'Sonnet' },
    { id: 'opus', label: 'Opus' }
  ],
  codex: [
    { id: 'gpt-5.5', label: 'GPT-5.5' },
    { id: 'gpt-5.4', label: 'GPT-5.4' },
    { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
    { id: 'gpt-5.3-codex', label: 'GPT-5.3 Codex' },
    { id: 'gpt-5.3-codex-spark', label: 'GPT-5.3 Codex Spark' },
    { id: 'gpt-5.2', label: 'GPT-5.2' }
  ],
  opencode: [
    { id: 'opencode/deepseek-v4-flash-free', label: 'OpenCode DeepSeek V4 Flash Free' },
    { id: 'opencode/gpt-5.4-mini', label: 'OpenCode GPT-5.4 Mini' }
  ],
  pi: [{ id: 'github-copilot/gpt-5.4-mini', label: 'GitHub Copilot GPT-5.4 Mini' }],
  amp: [
    { id: 'smart', label: 'Smart' },
    { id: 'rush', label: 'Rush' },
    { id: 'large', label: 'Large' },
    { id: 'deep', label: 'Deep' }
  ],
  cursor: [{ id: 'auto', label: 'Auto' }],
  kimi: [{ id: 'kimi-code/kimi-for-coding', label: 'Kimi K2.6' }],
  copilot: [
    { id: 'auto', label: 'Auto' },
    { id: 'claude-sonnet-4.6', label: 'Claude Sonnet 4.6' },
    { id: 'claude-opus-4.6', label: 'Claude Opus 4.6' },
    { id: 'gpt-5.5', label: 'GPT-5.5' },
    { id: 'gpt-5.4', label: 'GPT-5.4' },
    { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' }
  ],
  antigravity: [
    { id: 'Gemini 3.5 Flash (Medium)', label: 'Gemini 3.5 Flash Medium' },
    { id: 'Gemini 3.5 Flash (High)', label: 'Gemini 3.5 Flash High' },
    { id: 'Gemini 3.5 Flash (Low)', label: 'Gemini 3.5 Flash Low' }
  ],
  gemini: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
  ]
}

const TUI_AGENT_MODEL_FLAG_BY_AGENT: Partial<Record<TuiAgent, TuiAgentModelFlag>> = {
  amp: '--mode'
}

export function getTuiAgentModelOptions(agent: TuiAgent | null | undefined): TuiAgentModelOption[] {
  if (!agent) {
    return [PROVIDER_DEFAULT_MODEL]
  }
  return [PROVIDER_DEFAULT_MODEL, ...(TUI_AGENT_MODEL_OPTIONS[agent] ?? [])]
}

export function isTuiAgentModelSelection(agent: TuiAgent, modelId: unknown): modelId is string {
  return (
    typeof modelId === 'string' &&
    getTuiAgentModelOptions(agent).some((option) => option.id === modelId)
  )
}

export function normalizeTuiAgentModelSelections(
  value: unknown
): Partial<Record<TuiAgent, string>> {
  const normalized: Partial<Record<TuiAgent, string>> = {}
  if (!value || typeof value !== 'object') {
    return normalized
  }
  for (const [agent, modelId] of Object.entries(value)) {
    if (!isTuiAgent(agent) || !isTuiAgentModelSelection(agent, modelId)) {
      continue
    }
    if (modelId !== TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID) {
      normalized[agent] = modelId
    }
  }
  return normalized
}

export function resolveTuiAgentSelectedModel(
  agent: TuiAgent,
  selections: Partial<Record<TuiAgent, string>> | null | undefined
): string {
  const selected = selections?.[agent]
  return isTuiAgentModelSelection(agent, selected) ? selected : TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
}

export function resolveTuiAgentModelLaunchArgs(agent: TuiAgent, modelId: string): string {
  if (
    modelId === TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID ||
    !isTuiAgentModelSelection(agent, modelId)
  ) {
    return ''
  }
  const flag = TUI_AGENT_MODEL_FLAG_BY_AGENT[agent] ?? '--model'
  return `${flag} ${formatCliArgValue(modelId)}`
}

export function stripTuiAgentModelLaunchArgs(agent: TuiAgent, args: string): string {
  const trimmed = args.trim()
  if (!trimmed) {
    return ''
  }
  const tokenized = tokenizeCustomCommandTemplate(trimmed)
  if (!tokenized.ok) {
    return trimmed
  }
  const modelFlag = TUI_AGENT_MODEL_FLAG_BY_AGENT[agent] ?? '--model'
  const stripped: string[] = []
  for (let index = 0; index < tokenized.tokens.length; index += 1) {
    const token = tokenized.tokens[index]
    if (token === modelFlag) {
      index += 1
      continue
    }
    if (token.startsWith(`${modelFlag}=`)) {
      continue
    }
    stripped.push(token)
  }
  return stripped.map(formatCliArgValue).join(' ')
}

function formatCliArgValue(value: string): string {
  if (/^[^\s"'\\]+$/.test(value)) {
    return value
  }
  return `"${value.replace(/(["\\])/g, '\\$1')}"`
}
