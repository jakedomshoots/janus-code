import { describe, expect, it } from 'vitest'
import { extractTerminalPromptText, parseNumberedTerminalChoices } from './terminal-prompt-choices'

describe('parseNumberedTerminalChoices', () => {
  it('parses choices from separate terminal lines', () => {
    expect(parseNumberedTerminalChoices('Select model\n1. gpt-5.5\n2. gpt-5.4')).toEqual([
      { id: '1', label: 'gpt-5.5', input: '1' },
      { id: '2', label: 'gpt-5.4', input: '2' }
    ])
  })

  it('parses choices from wrapped terminal picker output', () => {
    expect(
      parseNumberedTerminalChoices(
        'Select Reasoning Level 1. Low Fast responses 2. Medium (default) Balanced 3. High Complex problems Press enter to confirm'
      )
    ).toEqual([
      { id: '1', label: 'Low Fast responses', input: '1' },
      { id: '2', label: 'Medium (default) Balanced', input: '2' },
      { id: '3', label: 'High Complex problems', input: '3' }
    ])
  })

  it('trims noisy terminal history before the latest interactive picker', () => {
    expect(
      extractTerminalPromptText([
        'Working Working final slash test ready.',
        'Run /review on my current changes gpt-5.5 xhigh /repo',
        '/model/model choose what model and reasoning effort to use',
        'Select Model and Effort Access legacy models by running codex -m <model_name> or in your config.toml 1. gpt-5.5 (current) 2. gpt-5.4 Press enter to confirm'
      ])
    ).toBe(
      'Select Model and Effort Access legacy models by running codex -m <model_name> or in your config.toml 1. gpt-5.5 (current) 2. gpt-5.4 Press enter to confirm'
    )
  })

  it('trims shell prompts after chained interactive picker instructions', () => {
    expect(
      extractTerminalPromptText([
        'Select Reasoning Level for gpt-5.5 1. Low Fast responses 2. Medium 3. High 4. Extra high',
        'Press enter to confirm or esc to go back Explain this codebase gpt-5.5 xhigh ~/work/project'
      ])
    ).toBe(
      'Select Reasoning Level for gpt-5.5 1. Low Fast responses 2. Medium 3. High 4. Extra high Press enter to confirm or esc to go back'
    )
  })
})
