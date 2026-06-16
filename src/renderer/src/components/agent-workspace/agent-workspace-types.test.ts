import { describe, expect, it } from 'vitest'
import * as agentWorkspaceTypesModule from './agent-workspace-types'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePhase,
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

const emptySnapshot = {
  activeWorktreeId: null,
  projects: [],
  threads: [],
  plans: [],
  timeline: [],
  diffs: [],
  terminalAvailable: false
} satisfies AgentWorkspaceSnapshot

const runningPhase: AgentWorkspacePhase = 'running'

const runningProject: AgentWorkspaceProject = {
  id: 'project-local-orca',
  label: 'Orca',
  path: '/workspace/orca',
  hostKind: 'local'
}

const runningThread: AgentWorkspaceThread = {
  id: 'thread-running',
  worktreeId: 'worktree-running',
  title: 'Implement GUI workspace',
  agentKind: 'codex',
  phase: runningPhase,
  updatedAt: '2026-06-15T14:30:00.000Z',
  branchName: 'feature/t3code-gui-workspace',
  cwd: '/workspace/orca'
}

const runningTimelineEntry: AgentWorkspaceTimelineEntry = {
  id: 'timeline-running',
  threadId: runningThread.id,
  kind: 'agent',
  text: 'Building the workspace surface.',
  createdAt: '2026-06-15T14:31:00.000Z',
  status: 'running'
}

const runningDiff: AgentWorkspaceDiffSummary = {
  id: 'diff-running',
  threadId: runningThread.id,
  filePath: 'src/renderer/src/components/agent-workspace/agent-workspace-types.ts',
  additions: 24,
  deletions: 0,
  status: 'added'
}

const runningSnapshot = {
  activeWorktreeId: runningThread.worktreeId,
  projects: [runningProject],
  threads: [runningThread],
  plans: [
    {
      id: 'plan-running',
      threadId: runningThread.id,
      title: 'Run the workspace build',
      explanation: 'Track the GUI workspace implementation.',
      steps: [
        {
          id: 'plan-running-step-1',
          title: 'Render the shell',
          status: 'in-progress'
        }
      ],
      markdown: '# Run the workspace build',
      updatedAt: '2026-06-15T14:32:00.000Z'
    }
  ],
  timeline: [runningTimelineEntry],
  diffs: [runningDiff],
  terminalAvailable: true
} satisfies AgentWorkspaceSnapshot

const completedPhase: AgentWorkspacePhase = 'completed'

const completedProject: AgentWorkspaceProject = {
  id: 'project-remote-orca',
  label: 'Orca Remote',
  path: '/srv/orca',
  hostKind: 'runtime'
}

const completedThread: AgentWorkspaceThread = {
  id: 'thread-completed',
  worktreeId: 'worktree-completed',
  title: 'Review completed workspace',
  agentKind: 't3-code',
  phase: completedPhase,
  updatedAt: null,
  branchName: null,
  cwd: null
}

const completedTimelineEntry: AgentWorkspaceTimelineEntry = {
  id: 'timeline-completed',
  threadId: completedThread.id,
  kind: 'system',
  text: 'Workspace completed.',
  createdAt: null,
  status: 'done'
}

const completedDiff: AgentWorkspaceDiffSummary = {
  id: 'diff-completed',
  threadId: completedThread.id,
  filePath: 'src/renderer/src/components/agent-workspace/agent-workspace-types.test.ts',
  oldPath: 'src/renderer/src/components/agent-workspace/legacy-workspace-types.test.ts',
  additions: 12,
  deletions: 2,
  status: 'renamed'
}

const completedSnapshot = {
  activeWorktreeId: completedThread.worktreeId,
  projects: [completedProject],
  threads: [completedThread],
  plans: [],
  timeline: [completedTimelineEntry],
  diffs: [completedDiff],
  terminalAvailable: false
} satisfies AgentWorkspaceSnapshot

describe('agent workspace types', () => {
  it('loads the renderer-only type module', () => {
    expect(Object.keys(agentWorkspaceTypesModule)).toEqual([])
  })

  it('supports empty, running, and completed workspace snapshots', () => {
    const snapshots: readonly AgentWorkspaceSnapshot[] = [
      emptySnapshot,
      runningSnapshot,
      completedSnapshot
    ]

    expect(snapshots.map((snapshot) => snapshot.threads.length)).toEqual([0, 1, 1])
    expect(runningSnapshot.threads[0]?.phase).toBe('running')
    expect(runningSnapshot.plans[0]?.steps[0]?.status).toBe('in-progress')
    expect(completedSnapshot.timeline[0]?.status).toBe('done')
    expect(completedSnapshot.diffs[0]?.oldPath).toBe(
      'src/renderer/src/components/agent-workspace/legacy-workspace-types.test.ts'
    )
  })
})
