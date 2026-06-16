import type { TuiAgent } from './types'

export type TuiAgentThinkingMode = 'quick' | 'standard' | 'deep'

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
