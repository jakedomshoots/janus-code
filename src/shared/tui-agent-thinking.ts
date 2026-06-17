import type { TuiAgent } from './types'

export type TuiAgentThinkingMode = 'quick' | 'standard' | 'deep'

export const TUI_AGENT_THINKING_MODES = ['quick', 'standard', 'deep'] as const

export function isTuiAgentThinkingMode(value: string): value is TuiAgentThinkingMode {
  return (TUI_AGENT_THINKING_MODES as readonly string[]).includes(value)
}

const THINKING_EFFORT_BY_MODE: Record<TuiAgentThinkingMode, string> = {
  quick: 'low',
  standard: 'medium',
  deep: 'high'
}

export function resolveTuiAgentThinkingArgs(agent: TuiAgent, mode: TuiAgentThinkingMode): string {
  const effort = THINKING_EFFORT_BY_MODE[mode]
  if (agent === 'codex') {
    return `-c model_reasoning_effort=${effort}`
  }
  return ''
}

export function mergeTuiAgentLaunchArgs(
  baseArgs: string | null | undefined,
  extraArgs: string | null | undefined
): string {
  return [baseArgs?.trim(), extraArgs?.trim()].filter(Boolean).join(' ')
}
