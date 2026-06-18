import { describe, expect, it } from 'vitest'
import { getTuiAgentModelProviderCategory } from './tui-agent-model-provider-categories'
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

  it('normalizes persisted selections to known and dynamically discovered provider models', () => {
    expect(
      normalizeTuiAgentModelSelections({
        codex: 'gpt-5.4-mini',
        opencode: 'opencode/claude-opus-4-8',
        grok: 'grok-composer-2.5-fast',
        'command-code': 'moonshotai/Kimi-K2.7-Code',
        hermes: 'moonshotai/kimi-k2.7-code',
        kimi: 'kimi-code/kimi-for-coding',
        claude: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
        nope: 'gpt-5.5',
        gemini: 'retired'
      })
    ).toEqual({
      codex: 'gpt-5.4-mini',
      opencode: 'opencode/claude-opus-4-8',
      grok: 'grok-composer-2.5-fast',
      'command-code': 'moonshotai/Kimi-K2.7-Code',
      hermes: 'moonshotai/kimi-k2.7-code',
      kimi: 'kimi-code/kimi-for-coding'
    })
  })

  it('falls back to provider default when a static-agent persisted model is stale', () => {
    expect(resolveTuiAgentSelectedModel('gemini', { gemini: 'retired' })).toBe(
      TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID
    )
    expect(resolveTuiAgentSelectedModel('opencode', { opencode: 'opencode/claude-opus-4-8' })).toBe(
      'opencode/claude-opus-4-8'
    )
    expect(resolveTuiAgentSelectedModel('grok', { grok: 'grok-build' })).toBe('grok-build')
    expect(resolveTuiAgentSelectedModel('command-code', { 'command-code': 'gpt-5.5' })).toBe(
      'gpt-5.5'
    )
  })

  it('builds model launch args with provider-specific flags', () => {
    expect(resolveTuiAgentModelLaunchArgs('codex', 'gpt-5.4-mini')).toBe('--model gpt-5.4-mini')
    expect(resolveTuiAgentModelLaunchArgs('amp', 'large')).toBe('--mode large')
  })

  it('lists configured local CLI model fallbacks for OpenCode, Pi, OMP, Kimi, Grok, Command Code, and Hermes', () => {
    expect(getTuiAgentModelOptions('opencode').map((option) => option.id)).toEqual([
      TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
      'opencode/deepseek-v4-flash-free',
      'opencode/gpt-5.5',
      'opencode/gpt-5.4',
      'opencode/gpt-5.4-mini',
      'kimi-for-coding/k2p7'
    ])
    expect(getTuiAgentModelOptions('pi').map((option) => option.id)).toEqual([
      TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
      'kimi-coding/kimi-for-coding',
      'openai-codex/gpt-5.5',
      'openai-codex/gpt-5.4',
      'openai-codex/gpt-5.4-mini',
      'minimax/MiniMax-M2.7'
    ])
    expect(getTuiAgentModelOptions('omp').map((option) => option.id)).toEqual([
      TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
      'opencode/gpt-5.5',
      'opencode/gpt-5.4',
      'opencode/gpt-5.4-mini',
      'opencode/deepseek-v4-flash-free',
      'kimi-for-coding/k2p7'
    ])
    expect(getTuiAgentModelOptions('kimi')).toContainEqual({
      id: 'kimi-code/kimi-for-coding',
      label: 'Kimi K2.7 Code'
    })
    expect(getTuiAgentModelOptions('grok').map((option) => option.id)).toContain(
      'grok-composer-2.5-fast'
    )
    expect(getTuiAgentModelOptions('command-code').map((option) => option.id)).toContain(
      'moonshotai/Kimi-K2.7-Code'
    )
    expect(getTuiAgentModelOptions('hermes').map((option) => option.id)).toContain(
      'moonshotai/kimi-k2.7-code'
    )
  })

  it('categorizes dynamic CLI model ids by their provider namespace first', () => {
    expect(
      getTuiAgentModelProviderCategory({
        id: 'provider-default',
        label: 'Provider default'
      }).label
    ).toBe('Provider default')
    expect(
      getTuiAgentModelProviderCategory({
        id: 'openai-codex/gpt-5.5',
        label: 'OpenAI Codex GPT-5.5'
      }).label
    ).toBe('OpenAI Codex')
    expect(
      getTuiAgentModelProviderCategory({
        id: 'opencode/claude-opus-4-8',
        label: 'Claude Opus 4.8'
      }).label
    ).toBe('OpenCode')
    expect(
      getTuiAgentModelProviderCategory({
        id: 'opencode/deepseek-v4-flash-free',
        label: 'DeepSeek V4 Flash Free'
      }).label
    ).toBe('OpenCode')
    expect(
      getTuiAgentModelProviderCategory({
        id: 'github-copilot/gpt-5.4-mini',
        label: 'Github Copilot GPT 5.4 Mini'
      }).label
    ).toBe('GitHub Copilot')
    expect(
      getTuiAgentModelProviderCategory({
        id: 'Gemini 3.5 Flash (Medium)',
        label: 'Gemini 3.5 Flash (Medium)'
      }).label
    ).toBe('Google / Gemini')
  })

  it('quotes model ids that contain spaces before startup tokenization', () => {
    expect(resolveTuiAgentModelLaunchArgs('antigravity', 'Gemini 3.5 Flash (Medium)')).toBe(
      '--model "Gemini 3.5 Flash (Medium)"'
    )
  })

  it('omits launch args for provider default and unsupported selections', () => {
    expect(resolveTuiAgentModelLaunchArgs('codex', TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID)).toBe('')
    expect(resolveTuiAgentModelLaunchArgs('gemini', 'retired')).toBe('')
    expect(resolveTuiAgentModelLaunchArgs('opencode', 'opencode/claude-opus-4-8')).toBe(
      '--model opencode/claude-opus-4-8'
    )
    expect(resolveTuiAgentModelLaunchArgs('hermes', 'moonshotai/kimi-k2.7-code')).toBe(
      '--model moonshotai/kimi-k2.7-code'
    )
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
