import { describe, expect, it } from 'vitest'
import { resolveAgentWorkspaceLifecycle } from './agent-workspace-lifecycle'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Add review mode',
  agentKind: 'codex',
  phase: 'completed',
  updatedAt: '2026-06-22T14:00:00.000Z',
  branchName: 'feature/review-mode',
  cwd: '/Users/jakedom/janus-code'
}

const diff: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx',
  additions: 18,
  deletions: 4,
  status: 'modified'
}

const review: AgentWorkspaceReviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'github',
  providerLabel: 'GitHub',
  number: 42,
  title: 'Add review mode',
  state: 'open',
  status: 'pending',
  url: 'https://example.test/review/42',
  updatedAt: '2026-06-22T14:10:00.000Z'
}

describe('resolveAgentWorkspaceLifecycle', () => {
  it('treats completed work with unmerged changes as needing review', () => {
    const lifecycle = resolveAgentWorkspaceLifecycle({
      thread,
      diffs: [diff],
      review: null
    })

    expect(lifecycle.current).toBe('needs-review')
    expect(lifecycle.currentLabel).toBe('Needs review')
    expect(lifecycle.steps.map((step) => [step.id, step.state])).toEqual([
      ['draft', 'complete'],
      ['running', 'complete'],
      ['needs-review', 'current'],
      ['changes-requested', 'upcoming'],
      ['ready', 'upcoming'],
      ['merged', 'upcoming'],
      ['closed', 'upcoming']
    ])
  })

  it('uses hosted review state for merged and closed outcomes', () => {
    expect(
      resolveAgentWorkspaceLifecycle({
        thread,
        diffs: [],
        review: { ...review, state: 'merged', status: 'success' }
      }).current
    ).toBe('merged')

    expect(
      resolveAgentWorkspaceLifecycle({
        thread,
        diffs: [],
        review: { ...review, state: 'closed', status: 'failure' }
      }).current
    ).toBe('closed')
  })
})
