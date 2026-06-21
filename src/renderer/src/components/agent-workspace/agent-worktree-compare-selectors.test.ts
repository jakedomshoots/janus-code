import { describe, expect, it } from 'vitest'
import { selectAgentWorktreeCompareGroups } from './agent-worktree-compare-selectors'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'

const projects: AgentWorkspaceProject[] = [
  {
    id: 'attempt-a',
    repoId: 'repo-janus',
    label: 'Attempt A',
    branchName: 'best/a',
    path: '/repo/janus/attempt-a',
    hostKind: 'local'
  },
  {
    id: 'attempt-b',
    repoId: 'repo-janus',
    label: 'Attempt B',
    branchName: 'best/b',
    path: '/repo/janus/attempt-b',
    hostKind: 'local'
  },
  {
    id: 'other-repo',
    repoId: 'repo-other',
    label: 'Other Repo',
    branchName: 'other/main',
    path: '/repo/other',
    hostKind: 'local'
  }
]

function thread(id: string, overrides: Partial<AgentWorkspaceThread> = {}): AgentWorkspaceThread {
  return {
    id,
    worktreeId: overrides.worktreeId ?? 'attempt-a',
    title: overrides.title ?? id,
    agentKind: overrides.agentKind ?? 'codex',
    phase: overrides.phase ?? 'completed',
    updatedAt: overrides.updatedAt ?? '2026-06-21T15:00:00.000Z',
    branchName: overrides.branchName ?? 'best/a',
    cwd: overrides.cwd ?? '/repo/janus/attempt-a',
    ...overrides
  }
}

function event(
  id: string,
  threadId: string,
  overrides: Partial<AgentWorkspaceRunEvent> = {}
): AgentWorkspaceRunEvent {
  const { telemetry = 'structured', ...rest } = overrides
  return {
    id,
    threadId,
    kind: rest.kind ?? 'state',
    title: rest.title ?? 'Done',
    detail: rest.detail ?? '',
    status: rest.status ?? 'done',
    createdAt: rest.createdAt ?? '2026-06-21T15:00:00.000Z',
    telemetry,
    ...rest
  }
}

function snapshot(overrides: Partial<AgentWorkspaceSnapshot>): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'attempt-a',
    terminalAvailable: true,
    projects,
    threads: [],
    plans: [],
    timeline: [],
    runEvents: [],
    approvals: [],
    diffs: [],
    reviews: [],
    ...overrides
  }
}

describe('selectAgentWorktreeCompareGroups', () => {
  it('groups isolated attempts from the same repo with scoped evidence', () => {
    const groups = selectAgentWorktreeCompareGroups(
      snapshot({
        threads: [
          thread('thread-a', { title: 'Try Codex', worktreeId: 'attempt-a' }),
          thread('thread-b', {
            title: 'Try Claude',
            agentKind: 'claude',
            worktreeId: 'attempt-b',
            branchName: 'best/b',
            cwd: '/repo/janus/attempt-b'
          })
        ],
        runEvents: [
          event('verify-a', 'thread-a', {
            kind: 'verification',
            title: 'Verification passed',
            detail: 'pnpm test',
            status: 'done'
          }),
          event('deploy-risk', 'thread-a', {
            kind: 'tool',
            title: 'Bash',
            detail: 'git push origin best/a',
            risk: {
              category: 'deploy',
              level: 'high',
              reason: 'May publish, push, or deploy changes.'
            }
          }),
          event('verify-b', 'thread-b', {
            kind: 'verification',
            title: 'Verification failed',
            detail: 'pnpm test',
            status: 'failed'
          })
        ],
        diffs: [
          {
            id: 'diff-a',
            threadId: 'thread-a',
            filePath: 'src/a.ts',
            additions: 10,
            deletions: 2,
            status: 'modified'
          },
          {
            id: 'diff-b',
            threadId: 'thread-b',
            filePath: 'src/b.ts',
            additions: 3,
            deletions: 1,
            status: 'added'
          }
        ]
      })
    )

    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({
      id: 'repo-janus',
      label: 'Attempt A',
      attemptCount: 2
    })
    expect(groups[0]?.attempts).toEqual([
      expect.objectContaining({
        threadId: 'thread-a',
        worktreeId: 'attempt-a',
        projectName: 'Attempt A',
        title: 'Try Codex',
        verificationTitle: 'Verification passed',
        changedFileCount: 1,
        additions: 10,
        deletions: 2,
        riskNotes: ['deploy: May publish, push, or deploy changes.']
      }),
      expect.objectContaining({
        threadId: 'thread-b',
        worktreeId: 'attempt-b',
        projectName: 'Attempt B',
        title: 'Try Claude',
        verificationTitle: 'Verification failed',
        changedFileCount: 1,
        additions: 3,
        deletions: 1,
        riskNotes: []
      })
    ])
  })

  it('requires at least two distinct worktrees from the same repo', () => {
    const groups = selectAgentWorktreeCompareGroups(
      snapshot({
        threads: [
          thread('thread-a', { title: 'Only attempt', worktreeId: 'attempt-a' }),
          thread('thread-other', {
            title: 'Different repo',
            worktreeId: 'other-repo',
            branchName: 'other/main',
            cwd: '/repo/other'
          })
        ]
      })
    )

    expect(groups).toEqual([])
  })
})
