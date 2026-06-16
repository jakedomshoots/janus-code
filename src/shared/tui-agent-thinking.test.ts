import { describe, expect, it } from 'vitest'
import {
  mergeTuiAgentLaunchArgs,
  resolveTuiAgentThinkingArgs,
  type TuiAgentThinkingMode
} from './tui-agent-thinking'

describe('resolveTuiAgentThinkingArgs', () => {
  it.each([
    ['quick', '-c model_reasoning_effort=low'],
    ['standard', '-c model_reasoning_effort=medium'],
    ['deep', '-c model_reasoning_effort=high']
  ] satisfies [TuiAgentThinkingMode, string][])(
    'maps Codex %s mode to reasoning effort args',
    (mode, expected) => {
      expect(resolveTuiAgentThinkingArgs('codex', mode)).toBe(expected)
    }
  )

  it('omits args for agents without a known thinking flag', () => {
    expect(resolveTuiAgentThinkingArgs('opencode', 'deep')).toBe('')
  })
})

describe('mergeTuiAgentLaunchArgs', () => {
  it('appends thinking args without dropping existing launch defaults', () => {
    expect(
      mergeTuiAgentLaunchArgs(
        '--dangerously-bypass-approvals-and-sandbox',
        '-c model_reasoning_effort=high'
      )
    ).toBe('--dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort=high')
  })

  it('returns only the extra args when no base args exist', () => {
    expect(mergeTuiAgentLaunchArgs('', '-c model_reasoning_effort=low')).toBe(
      '-c model_reasoning_effort=low'
    )
  })
})
