import { describe, expect, it } from 'vitest'
import { discoverTuiAgentSlashCommands } from './tui-agent-slash-commands'

describe('discoverTuiAgentSlashCommands', () => {
  it('returns common and Codex-specific commands without probing a running session', () => {
    const result = discoverTuiAgentSlashCommands('codex')

    expect(result).toMatchObject({ success: true, agentId: 'codex' })
    expect(result.success && result.commands.map((command) => command.command)).toEqual(
      expect.arrayContaining(['/commands', '/help', '/approvals', '/mcp'])
    )
  })

  it('keeps agent-specific commands scoped to the selected agent', () => {
    const result = discoverTuiAgentSlashCommands('claude')

    expect(result.success && result.commands.map((command) => command.command)).toEqual(
      expect.arrayContaining(['/doctor', '/cost'])
    )
    expect(result.success && result.commands.map((command) => command.command)).not.toContain(
      '/approvals'
    )
  })
})
