import { describe, expect, it } from 'vitest'
import { buildAgentWorkspaceCandidates } from './agent-workspace-candidates'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

function makeThread(
  id: string,
  overrides: Partial<AgentWorkspaceThread> = {}
): AgentWorkspaceThread {
  return {
    id,
    worktreeId: 'worktree-1',
    title: 'Improve review flow',
    agentKind: id.includes('claude') ? 'claude' : 'codex',
    phase: 'running',
    updatedAt: '2026-06-22T14:00:00.000Z',
    branchName: `feature/${id}`,
    cwd: '/Users/jakedom/janus-code',
    ...overrides
  }
}

function makeDiff(
  threadId: string,
  additions: number,
  deletions: number
): AgentWorkspaceDiffSummary {
  return {
    id: `${threadId}:diff`,
    threadId,
    filePath: `${threadId}.tsx`,
    additions,
    deletions,
    status: 'modified'
  }
}

const review: AgentWorkspaceReviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'github',
  providerLabel: 'GitHub',
  number: 7,
  title: 'Improve review flow',
  state: 'open',
  status: 'success',
  url: 'https://example.test/review/7',
  updatedAt: '2026-06-22T14:20:00.000Z'
}

describe('buildAgentWorkspaceCandidates', () => {
  it('labels parallel threads as candidates and recommends the strongest evidence', () => {
    const running = makeThread('codex-running', {
      phase: 'running',
      updatedAt: '2026-06-22T14:05:00.000Z'
    })
    const completed = makeThread('claude-completed', {
      phase: 'completed',
      updatedAt: '2026-06-22T14:10:00.000Z'
    })

    const model = buildAgentWorkspaceCandidates({
      threads: [running, completed],
      selectedThreadId: running.id,
      diffs: [makeDiff(running.id, 4, 1), makeDiff(completed.id, 24, 3)],
      reviews: [review]
    })

    expect(model.candidates.map((candidate) => candidate.label)).toEqual([
      'Candidate A',
      'Candidate B'
    ])
    expect(model.candidates[0]).toMatchObject({
      threadId: running.id,
      selected: true,
      diffCount: 1,
      changedLines: 5
    })
    expect(model.recommendedCandidateId).toBe(completed.id)
    expect(model.recommendation).toContain('Candidate B')
    expect(model.recommendation).toContain('completed work')
  })

  it('does not invent a recommendation when there is only one candidate', () => {
    const model = buildAgentWorkspaceCandidates({
      threads: [makeThread('codex-running')],
      selectedThreadId: 'codex-running',
      diffs: [],
      reviews: []
    })

    expect(model.candidates).toHaveLength(1)
    expect(model.recommendedCandidateId).toBeNull()
    expect(model.recommendation).toBe('Only one implementation candidate is available.')
  })
})
