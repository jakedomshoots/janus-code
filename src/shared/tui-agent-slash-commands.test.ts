import { describe, expect, it } from 'vitest'
import { discoverTuiAgentSlashCommands, parseCliSlashCommands } from './tui-agent-slash-commands'

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

  it('parses slash-command rows from backend help output', () => {
    expect(
      parseCliSlashCommands(`
Slash commands:
  /model       Change the active model
  /permissions Inspect approval settings
  /mcp         Manage MCP servers
`)
    ).toEqual([
      {
        command: '/mcp',
        title: 'Mcp',
        description: 'Manage MCP servers',
        source: 'cli-help'
      },
      {
        command: '/model',
        title: 'Model',
        description: 'Change the active model',
        source: 'cli-help'
      },
      {
        command: '/permissions',
        title: 'Permissions',
        description: 'Inspect approval settings',
        source: 'cli-help'
      }
    ])
  })

  it('merges commands discovered from the selected backend over the safe catalog', () => {
    const result = discoverTuiAgentSlashCommands('codex', [
      {
        command: '/backend-only',
        title: 'Backend Only',
        description: 'Provided by the selected CLI.',
        source: 'cli-help'
      },
      {
        command: '/model',
        title: 'Model',
        description: 'Backend-specific model picker.',
        source: 'cli-help'
      }
    ])

    expect(result.success && result.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: '/backend-only',
          source: 'cli-help'
        }),
        expect.objectContaining({
          command: '/model',
          description: 'Backend-specific model picker.',
          source: 'cli-help'
        })
      ])
    )
  })
})
