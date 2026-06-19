import { describe, expect, it } from 'vitest'
import { getAgentComposerSlashCommandMatches } from './agent-composer-slash-command-model'
import { learnAgentComposerSlashCommandsFromTimeline } from './agent-composer-learned-slash-commands'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

const timeline: AgentWorkspaceTimelineEntry[] = [
  {
    id: 'turn-1-user',
    threadId: 'thread-1',
    kind: 'user',
    text: '/help',
    createdAt: '2026-06-18T20:00:00.000Z',
    status: 'done'
  },
  {
    id: 'turn-1-agent',
    threadId: 'thread-1',
    kind: 'agent',
    text: [
      'Available commands:',
      '/deploy <env> Deploy the selected environment',
      '/trace Show trace output'
    ].join('\n'),
    createdAt: '2026-06-18T20:00:02.000Z',
    status: 'done'
  }
]

describe('learnAgentComposerSlashCommandsFromTimeline', () => {
  it('extracts commands from the latest agent help response', () => {
    const learnedCommands = learnAgentComposerSlashCommandsFromTimeline(timeline)

    expect(learnedCommands.map((command) => command.command)).toEqual(['/deploy', '/trace'])
    expect(learnedCommands[0]?.descriptionFallback).toBe('Deploy the selected environment')
  })

  it('feeds learned commands into slash command matching', () => {
    const commands = getAgentComposerSlashCommandMatches(
      '/dep',
      'codex',
      learnAgentComposerSlashCommandsFromTimeline(timeline)
    )

    expect(commands.map((command) => command.command)).toContain('/deploy')
  })
})
