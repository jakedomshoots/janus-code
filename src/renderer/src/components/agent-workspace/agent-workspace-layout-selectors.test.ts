import { describe, expect, it } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceRunEvent,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { getThreadChromeSummary } from './agent-workspace-layout-selectors'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Build the recorder',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-21T18:00:00.000Z',
  branchName: 'feature/recorder',
  cwd: '/repo/janus-code'
}

function runEvent(overrides: Partial<AgentWorkspaceRunEvent>): AgentWorkspaceRunEvent {
  return {
    id: overrides.id ?? 'event-1',
    threadId: overrides.threadId ?? thread.id,
    kind: overrides.kind ?? 'state',
    title: overrides.title ?? 'Working',
    detail: overrides.detail ?? 'Build the recorder',
    createdAt: overrides.createdAt ?? '2026-06-21T18:00:00.000Z',
    status: overrides.status ?? 'running',
    telemetry: overrides.telemetry ?? 'partial'
  }
}

function diff(overrides: Partial<AgentWorkspaceDiffSummary>): AgentWorkspaceDiffSummary {
  return {
    id: overrides.id ?? 'diff-1',
    threadId: overrides.threadId ?? thread.id,
    filePath: overrides.filePath ?? 'src/app.ts',
    additions: overrides.additions ?? 1,
    deletions: overrides.deletions ?? 0,
    status: overrides.status ?? 'modified',
    ...overrides
  }
}

describe('agent workspace layout selectors', () => {
  it('summarizes selected-thread run evidence for the header chrome', () => {
    const summary = getThreadChromeSummary(
      thread,
      [
        runEvent({
          id: 'state-1',
          title: 'Working',
          createdAt: '2026-06-21T18:00:00.000Z',
          status: 'running'
        }),
        runEvent({
          id: 'tool-other',
          threadId: 'thread-other',
          kind: 'tool',
          title: 'Bash',
          detail: 'pnpm lint',
          createdAt: '2026-06-21T18:02:00.000Z',
          status: 'done',
          telemetry: 'structured'
        }),
        runEvent({
          id: 'tool-1',
          kind: 'tool',
          title: 'Bash',
          detail: 'pnpm test',
          createdAt: '2026-06-21T18:01:00.000Z',
          status: 'running',
          telemetry: 'structured'
        }),
        runEvent({
          id: 'approval-1',
          kind: 'approval',
          title: 'Approval requested',
          detail: 'Run pnpm test',
          createdAt: '2026-06-21T18:03:00.000Z',
          status: 'pending',
          telemetry: 'structured'
        })
      ],
      [
        diff({ id: 'diff-1', filePath: 'src/app.ts' }),
        diff({ id: 'diff-other', threadId: 'thread-other', filePath: 'src/other.ts' })
      ]
    )

    expect(summary).toEqual({
      currentStep: 'Approval requested',
      lastCommand: 'pnpm test',
      changedFileCount: 1,
      attentionState: 'needs-attention'
    })
  })

  it('falls back to the selected thread phase when run evidence is not available yet', () => {
    expect(getThreadChromeSummary({ ...thread, phase: 'starting' }, [], [])).toEqual({
      currentStep: 'Starting',
      lastCommand: null,
      changedFileCount: 0,
      attentionState: 'running'
    })
    expect(getThreadChromeSummary(null, [], [])).toBeNull()
  })
})
