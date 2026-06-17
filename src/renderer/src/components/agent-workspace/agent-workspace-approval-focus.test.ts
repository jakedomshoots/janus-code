import { describe, expect, it } from 'vitest'
import { pickAgentWorkspaceApprovalThreadId } from './agent-workspace-approval-focus'
import type { AgentWorkspaceThread } from './agent-workspace-types'

const threads: readonly AgentWorkspaceThread[] = [
  {
    id: 'thread-running',
    worktreeId: 'worktree-1',
    title: 'Running thread',
    agentKind: 'codex',
    phase: 'running',
    updatedAt: '2026-06-16T12:00:00.000Z',
    branchName: 'feature/running',
    cwd: '/Users/jakedom/janus-code'
  },
  {
    id: 'thread-approval',
    worktreeId: 'worktree-1',
    title: 'Needs approval',
    agentKind: 'codex',
    phase: 'needs-approval',
    updatedAt: '2026-06-16T12:01:00.000Z',
    branchName: 'feature/approval',
    cwd: '/Users/jakedom/janus-code'
  }
]

describe('pickAgentWorkspaceApprovalThreadId', () => {
  it('returns null when a thread is already selected', () => {
    expect(pickAgentWorkspaceApprovalThreadId(threads, 'thread-running')).toBeNull()
  })

  it('auto-selects the first needs-approval thread on a draft tab', () => {
    expect(pickAgentWorkspaceApprovalThreadId(threads, null)).toBe('thread-approval')
  })

  it('returns null when no thread needs approval', () => {
    expect(
      pickAgentWorkspaceApprovalThreadId(
        threads.filter((thread) => thread.phase !== 'needs-approval'),
        null
      )
    ).toBeNull()
  })
})
