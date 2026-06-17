import { describe, expect, it } from 'vitest'
import {
  getTuiAgentModelOptions,
  normalizeTuiAgentModelSelections,
  resolveTuiAgentModelLaunchArgs,
  resolveTuiAgentSelectedModel,
  stripTuiAgentModelLaunchArgs,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
} from './tui-agent-models'

describe('tui agent models', () => {
  it('lists provider default before known Codex models', () => {
    const options = getTuiAgentModelOptions('codex')

    expect(options[0]).toEqual({
      id: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
      label: 'Provider default'
    })
    expect(options.map((option) => option.id)).toContain('gpt-5.4-mini')
  })

  it('normalizes persisted selections to known provider models', () => {
    expect(
      normalizeTuiAgentModelSelections({
        codex: 'gpt-5.4-mini',
        claude: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
        nope: 'gpt-5.5',
        gemini: 'retired'
      })
    ).toEqual({ codex: 'gpt-5.4-mini' })
  })

  it('falls back to provider default when a persisted model is stale', () => {
    expect(resolveTuiAgentSelectedModel('codex', { codex: 'retired' })).toBe(
      TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
    )
  })

  it('builds model launch args with provider-specific flags', () => {
    expect(resolveTuiAgentModelLaunchArgs('codex', 'gpt-5.4-mini')).toBe('--model gpt-5.4-mini')
    expect(resolveTuiAgentModelLaunchArgs('amp', 'large')).toBe('--mode large')
  })

  it('quotes model ids that contain spaces before startup tokenization', () => {
    expect(resolveTuiAgentModelLaunchArgs('antigravity', 'Gemini 3.5 Flash (Medium)')).toBe(
      '--model "Gemini 3.5 Flash (Medium)"'
    )
  })

  it('omits launch args for provider default and unsupported selections', () => {
    expect(resolveTuiAgentModelLaunchArgs('codex', TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID)).toBe('')
    expect(resolveTuiAgentModelLaunchArgs('codex', 'retired')).toBe('')
  })

  it('strips stale model args without dropping other custom launch args', () => {
    expect(stripTuiAgentModelLaunchArgs('codex', '--model old --sandbox read-only')).toBe(
      '--sandbox read-only'
    )
    expect(stripTuiAgentModelLaunchArgs('amp', '--mode smart --no-notifications')).toBe(
      '--no-notifications'
    )
  })
})
