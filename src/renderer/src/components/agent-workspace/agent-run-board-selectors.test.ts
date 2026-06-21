import { describe, expect, it } from 'vitest'
import { selectAgentRunBoardGroups } from './agent-run-board-selectors'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'

const projects: AgentWorkspaceProject[] = [
  {
    id: 'worktree-1',
    label: 'Janus Main',
    branchName: 'main',
    path: '/repo/janus-main',
    hostKind: 'local'
  },
  {
    id: 'worktree-2',
    label: 'Janus Spike',
    branchName: 'spike/run-board',
    path: '/repo/janus-spike',
    hostKind: 'local'
  }
]

function thread(id: string, overrides: Partial<AgentWorkspaceThread> = {}): AgentWorkspaceThread {
  return {
    id,
    worktreeId: overrides.worktreeId ?? 'worktree-1',
    title: overrides.title ?? id,
    agentKind: overrides.agentKind ?? 'codex',
    phase: overrides.phase ?? 'running',
    updatedAt: overrides.updatedAt ?? '2026-06-21T15:00:00.000Z',
    branchName: overrides.branchName ?? 'main',
    cwd: overrides.cwd ?? '/repo/janus-main',
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
    title: rest.title ?? 'Running',
    detail: rest.detail ?? '',
    status: rest.status ?? 'running',
    createdAt: rest.createdAt ?? '2026-06-21T15:00:00.000Z',
    telemetry,
    ...rest
  }
}

function snapshot(overrides: Partial<AgentWorkspaceSnapshot>): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'worktree-1',
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

describe('selectAgentRunBoardGroups', () => {
  it('groups visible runs by attention state in board order', () => {
    const groups = selectAgentRunBoardGroups(
      snapshot({
        threads: [
          thread('running-newer', { title: 'Newer running' }),
          thread('running-older', {
            title: 'Older running',
            updatedAt: '2026-06-21T14:00:00.000Z'
          }),
          thread('waiting', { title: 'Needs input', phase: 'needs-approval' }),
          thread('review-ready', { title: 'Ready to review', phase: 'completed' }),
          thread('failed', { title: 'Failed run' }),
          thread('done', { title: 'No changes done', phase: 'completed' })
        ],
        runEvents: [
          event('running-newer-event', 'running-newer', { title: 'Running tests' }),
          event('running-older-event', 'running-older', {
            title: 'Building',
            createdAt: '2026-06-21T14:00:00.000Z'
          }),
          event('failed-event', 'failed', { title: 'Command failed', status: 'failed' })
        ],
        diffs: [
          {
            id: 'diff-review',
            threadId: 'review-ready',
            filePath: 'src/App.tsx',
            additions: 8,
            deletions: 1,
            status: 'modified'
          }
        ]
      })
    )

    expect(groups.map((group) => group.id)).toEqual([
      'running',
      'waiting',
      'review-ready',
      'failed',
      'done'
    ])
    expect(groups[0]?.rows.map((row) => row.threadId)).toEqual(['running-newer', 'running-older'])
    expect(groups[1]?.rows[0]).toMatchObject({
      threadId: 'waiting',
      worktreeId: 'worktree-1',
      projectName: 'Janus Main'
    })
    expect(groups[2]?.rows[0]).toMatchObject({
      threadId: 'review-ready',
      changedFileCount: 1
    })
    expect(groups[3]?.rows[0]).toMatchObject({
      threadId: 'failed',
      currentStep: 'Command failed'
    })
    expect(groups[4]?.rows[0]?.threadId).toBe('done')
  })

  it('keeps cross-worktree link metadata and marks limited telemetry rows', () => {
    const groups = selectAgentRunBoardGroups(
      snapshot({
        threads: [
          thread('remote-running', {
            worktreeId: 'worktree-2',
            title: 'Remote running',
            agentKind: 'other',
            branchName: 'spike/run-board',
            cwd: '/repo/janus-spike'
          })
        ],
        runEvents: [
          event('remote-running-event', 'remote-running', {
            title: 'Running with partial telemetry',
            status: 'unknown'
          })
        ]
      })
    )

    expect(groups[0]?.rows[0]).toMatchObject({
      threadId: 'remote-running',
      worktreeId: 'worktree-2',
      projectName: 'Janus Spike',
      branchName: 'spike/run-board',
      currentStep: 'Running with partial telemetry',
      limitedTelemetry: true
    })
  })
})
