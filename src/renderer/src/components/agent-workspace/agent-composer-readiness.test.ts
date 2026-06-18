import { describe, expect, it } from 'vitest'
import { getAgentComposerPlaceholder, isSelectedThreadReady } from './agent-composer-readiness'
import type { AgentWorkspaceThread } from './agent-workspace-types'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement composer',
  agentKind: 'codex',
  phase: 'waiting-for-user',
  updatedAt: null,
  branchName: null,
  cwd: null
}

describe('agent composer readiness', () => {
  it('treats waiting-for-user threads as messageable', () => {
    expect(isSelectedThreadReady(thread, 'worktree-1')).toBe(true)
    expect(getAgentComposerPlaceholder(thread, 'worktree-1')).toBe('Message the selected agent...')
  })
})
