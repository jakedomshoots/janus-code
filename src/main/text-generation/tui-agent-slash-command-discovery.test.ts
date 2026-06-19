import { describe, expect, it } from 'vitest'
import { planTuiAgentSlashCommandDiscovery } from './tui-agent-slash-command-discovery'

describe('planTuiAgentSlashCommandDiscovery', () => {
  it('uses the selected agent launch command for help discovery', () => {
    expect(planTuiAgentSlashCommandDiscovery('hermes')).toEqual({
      ok: true,
      plan: {
        binary: 'hermes',
        args: ['--tui', '--help'],
        stdinPayload: null,
        label: 'Hermes'
      }
    })
  })

  it('uses command overrides for the selected backend', () => {
    expect(planTuiAgentSlashCommandDiscovery('codex', 'npx codex')).toEqual({
      ok: true,
      plan: {
        binary: 'npx',
        args: ['codex', '--help'],
        stdinPayload: null,
        label: 'Codex'
      }
    })
  })
})
