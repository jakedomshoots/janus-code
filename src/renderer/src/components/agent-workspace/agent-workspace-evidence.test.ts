import { describe, expect, it } from 'vitest'
import { buildAgentWorkspaceEvidence } from './agent-workspace-evidence'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Wire evidence rail',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-22T14:00:00.000Z',
  branchName: 'feature/evidence',
  cwd: '/Users/jakedom/janus-code'
}

const plan: AgentWorkspacePlan = {
  id: 'plan-1',
  threadId: 'thread-1',
  title: 'Evidence plan',
  explanation: null,
  steps: [
    { id: 'step-1', title: 'Inspect UI', status: 'completed' },
    { id: 'step-2', title: 'Implement rail', status: 'in-progress' }
  ],
  markdown: null,
  updatedAt: '2026-06-22T14:01:00.000Z'
}

const diff: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx',
  additions: 32,
  deletions: 8,
  status: 'modified'
}

const review: AgentWorkspaceReviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'gitlab',
  providerLabel: 'GitLab',
  number: 12,
  title: 'Wire evidence rail',
  state: 'open',
  status: 'pending',
  url: 'https://example.test/review/12',
  updatedAt: '2026-06-22T14:08:00.000Z'
}

const timeline: readonly AgentWorkspaceTimelineEntry[] = [
  {
    id: 'entry-user',
    threadId: 'thread-1',
    kind: 'user',
    text: 'Add the trust rail.',
    createdAt: '2026-06-22T14:00:00.000Z',
    status: 'done'
  },
  {
    id: 'entry-tool',
    threadId: 'thread-1',
    kind: 'tool',
    text: 'pnpm vitest run agent-workspace-evidence.test.ts',
    createdAt: '2026-06-22T14:03:00.000Z',
    status: 'running'
  }
]

describe('buildAgentWorkspaceEvidence', () => {
  it('summarizes concrete agent evidence without claiming missing test or preview data', () => {
    const evidence = buildAgentWorkspaceEvidence({
      thread,
      plan,
      approval: null,
      diffs: [diff],
      review,
      timeline,
      terminalAvailable: true,
      browserAvailable: false
    })

    expect(evidence.items.map((item) => item.id)).toEqual([
      'lifecycle',
      'last-user-message',
      'active-tool',
      'plan-progress',
      'changed-files',
      'hosted-review',
      'terminal'
    ])
    expect(evidence.items.find((item) => item.id === 'changed-files')?.detail).toBe(
      '1 file · +32 -8'
    )
    expect(evidence.preview.status).toBe('unavailable')
    expect(evidence.preview.recoverySteps).toContain(
      'Open the terminal drawer to start or inspect the app server.'
    )
  })
})
