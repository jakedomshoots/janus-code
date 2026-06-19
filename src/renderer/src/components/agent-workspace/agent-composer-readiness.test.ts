import { describe, expect, it } from 'vitest'
import { getAgentComposerPlaceholder, isSelectedThreadReady } from './agent-composer-readiness'
import type { AgentWorkspaceThread } from './agent-workspace-types'

function makeThread(phase: AgentWorkspaceThread['phase']): AgentWorkspaceThread {
  return {
    id: 'thread-1',
    worktreeId: 'worktree-1',
    title: 'Implement composer',
    agentKind: 'codex',
    phase,
    updatedAt: null,
    branchName: null,
    cwd: null
  }
}

describe('agent composer readiness', () => {
  it.each(['running', 'waiting-for-user', 'completed'] as const)(
    'treats %s threads as messageable',
    (phase) => {
      const thread = makeThread(phase)
      expect(isSelectedThreadReady(thread, 'worktree-1')).toBe(true)
      expect(getAgentComposerPlaceholder(thread, 'worktree-1')).toBe(
        phase === 'completed'
          ? 'Ask a follow-up in this thread...'
          : 'Message the selected agent...'
      )
    }
  )

  it('does not treat failed threads as messageable', () => {
    expect(isSelectedThreadReady(makeThread('failed'), 'worktree-1')).toBe(false)
  })
})
