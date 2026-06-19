import { describe, expect, it } from 'vitest'
import { getAgentComposerSlashCommandMatches } from './agent-composer-slash-command-model'

describe('getAgentComposerSlashCommandMatches', () => {
  it('adds Codex-specific commands for Codex conversations', () => {
    const commands = getAgentComposerSlashCommandMatches('/app', 'codex').map(
      (item) => item.command
    )

    expect(commands).toContain('/approvals')
  })

  it('adds Claude-specific commands for Claude conversations', () => {
    const commands = getAgentComposerSlashCommandMatches('/cost', 'claude').map(
      (item) => item.command
    )

    expect(commands).toEqual(['/cost'])
  })

  it('does not leak agent-specific commands into other agent menus', () => {
    const commands = getAgentComposerSlashCommandMatches('/cost', 'codex').map(
      (item) => item.command
    )

    expect(commands).toEqual([])
  })
})
