import type { TuiAgentModelOption } from './tui-agent-models'

export type TuiAgentModelProviderCategory = {
  id: string
  label: string
  order: number
}

const TUI_AGENT_MODEL_PROVIDER_CATEGORIES = [
  { id: 'provider-default', label: 'Provider default', order: 0 },
  { id: 'opencode', label: 'OpenCode', order: 10 },
  { id: 'openai', label: 'OpenAI', order: 20 },
  { id: 'openai-codex', label: 'OpenAI Codex', order: 21 },
  { id: 'anthropic', label: 'Anthropic / Claude', order: 30 },
  { id: 'kimi', label: 'Kimi', order: 40 },
  { id: 'kimi-coding', label: 'Kimi Coding', order: 41 },
  { id: 'kimi-for-coding', label: 'Kimi For Coding', order: 42 },
  { id: 'deepseek', label: 'DeepSeek', order: 50 },
  { id: 'minimax', label: 'MiniMax', order: 60 },
  { id: 'google', label: 'Google / Gemini', order: 70 },
  { id: 'github-copilot', label: 'GitHub Copilot', order: 80 },
  { id: 'other', label: 'Other', order: 1000 }
] as const

export function getTuiAgentModelProviderCategory(
  option: TuiAgentModelOption
): TuiAgentModelProviderCategory {
  const category = getProviderCategoryByIdPrefix(option.id) ?? getProviderCategoryByLabel(option)
  return {
    id: category.id,
    label: category.label,
    order: category.order
  }
}

function getProviderCategoryByIdPrefix(id: string): TuiAgentModelProviderCategory | undefined {
  const separatorIndex = id.indexOf('/')
  const namespace =
    separatorIndex >= 0 ? id.slice(0, separatorIndex).trim().toLowerCase() : id.toLowerCase()
  if (!namespace) {
    return undefined
  }
  if (namespace === 'provider-default') {
    return findProviderCategory('provider-default')
  }
  if (namespace === 'github-copilot') {
    return findProviderCategory('github-copilot')
  }
  if (namespace === 'openai' || namespace === 'openai-codex') {
    return findProviderCategory(namespace)
  }
  if (namespace === 'codex') {
    return findProviderCategory('openai-codex')
  }
  if (namespace === 'anthropic' || namespace === 'claude') {
    return findProviderCategory('anthropic')
  }
  if (namespace === 'kimi' || namespace === 'kimi-coding' || namespace === 'kimi-for-coding') {
    return findProviderCategory(namespace)
  }
  if (namespace === 'deepseek') {
    return findProviderCategory('deepseek')
  }
  if (namespace === 'minimax') {
    return findProviderCategory('minimax')
  }
  if (namespace === 'google' || namespace === 'gemini') {
    return findProviderCategory('google')
  }
  if (namespace === 'opencode') {
    return findProviderCategory('opencode')
  }
  if (separatorIndex < 0) {
    return undefined
  }
  return {
    id: namespace,
    label: labelFromModelProviderId(namespace),
    order: 900
  }
}

function findProviderCategory(id: string): TuiAgentModelProviderCategory {
  const category =
    TUI_AGENT_MODEL_PROVIDER_CATEGORIES.find((candidate) => candidate.id === id) ??
    TUI_AGENT_MODEL_PROVIDER_CATEGORIES.at(-1)!
  return {
    id: category.id,
    label: category.label,
    order: category.order
  }
}

function getProviderCategoryByLabel(option: TuiAgentModelOption): TuiAgentModelProviderCategory {
  const searchable = `${option.id} ${option.label}`.trim()
  if (/\b(gpt|codex)\b/i.test(searchable)) {
    return findProviderCategory('openai-codex')
  }
  if (/\b(claude|haiku|sonnet|opus)\b/i.test(searchable)) {
    return findProviderCategory('anthropic')
  }
  if (/\bkimi\b/i.test(searchable)) {
    return findProviderCategory('kimi')
  }
  if (/\bdeepseek\b/i.test(searchable)) {
    return findProviderCategory('deepseek')
  }
  if (/\bminimax\b/i.test(searchable)) {
    return findProviderCategory('minimax')
  }
  if (/\bgemini\b/i.test(searchable)) {
    return findProviderCategory('google')
  }
  if (/\bgithub copilot\b/i.test(searchable)) {
    return findProviderCategory('github-copilot')
  }
  return findProviderCategory('other')
}

function labelFromModelProviderId(id: string): string {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => {
      if (/^ai$/i.test(part)) {
        return 'AI'
      }
      if (/^api$/i.test(part)) {
        return 'API'
      }
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}
