import { describe, expect, it } from 'vitest'
import { buildAgentRunReplayMarkdown, redactRunReplayMarkdown } from './agent-run-replay-export'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'Janus Code',
  path: '/repo/janus-code',
  hostKind: 'local',
  branchName: 'feature/replay-export',
  repoId: 'repo-1'
}

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Replay export',
  agentKind: 'codex',
  phase: 'completed',
  updatedAt: '2026-06-21T14:00:00.000Z',
  branchName: 'feature/replay-export',
  cwd: '/repo/janus-code'
}

describe('agent run replay export', () => {
  it('exports stable markdown sections for a selected run', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'agent-1',
        threadId: 'thread-1',
        kind: 'agent',
        text: 'Done',
        createdAt: '2026-06-21T13:03:00.000Z',
        status: 'done'
      },
      {
        id: 'user-1',
        threadId: 'thread-1',
        kind: 'user',
        text: 'Build replay export',
        createdAt: '2026-06-21T13:00:00.000Z',
        status: 'done'
      }
    ]
    const runEvents: AgentWorkspaceRunEvent[] = [
      {
        id: 'verification',
        threadId: 'thread-1',
        kind: 'verification',
        title: 'Verification passed',
        detail: 'pnpm test',
        createdAt: '2026-06-21T13:02:00.000Z',
        status: 'done',
        telemetry: 'partial'
      },
      {
        id: 'command',
        threadId: 'thread-1',
        kind: 'tool',
        title: 'Bash',
        detail: 'pnpm test',
        createdAt: '2026-06-21T13:01:00.000Z',
        status: 'done',
        telemetry: 'structured',
        risk: {
          category: 'safe-read',
          level: 'low',
          reason: 'Read-only command.'
        }
      }
    ]
    const diffs: AgentWorkspaceDiffSummary[] = [
      {
        id: 'z',
        threadId: 'thread-1',
        filePath: 'src/z.ts',
        additions: 1,
        deletions: 0,
        status: 'modified'
      },
      {
        id: 'a',
        threadId: 'thread-1',
        filePath: 'src/a.ts',
        additions: 3,
        deletions: 1,
        status: 'added'
      }
    ]
    const approvals: AgentWorkspaceApproval[] = [
      {
        id: 'approval-1',
        threadId: 'thread-1',
        providerKind: 'codex',
        worktreeId: 'worktree-1',
        status: 'approved',
        title: 'Approve Bash',
        description: null,
        toolName: 'Bash',
        toolInput: 'pnpm test',
        fallbackText: 'Approve Bash: pnpm test',
        updatedAt: '2026-06-21T13:01:30.000Z'
      }
    ]

    const markdown = buildAgentRunReplayMarkdown({
      project,
      thread,
      timeline,
      runEvents,
      diffs,
      approvals,
      replayContext: {
        threadId: 'thread-1',
        prompt: 'Build replay export',
        promptContextManifest: {
          items: [
            {
              id: 'workspace-context',
              kind: 'workspace',
              label: 'Janus Code',
              path: '/repo/janus-code',
              hostKind: 'local',
              branchName: 'feature/replay-export',
              stale: false
            },
            {
              id: 'verification-command',
              kind: 'verification',
              command: 'pnpm test'
            }
          ]
        }
      },
      exportedAt: '2026-06-21T14:05:00.000Z'
    })

    expect(markdown).toContain('# Agent Run Replay: Replay export')
    expect(markdown).toContain('- Final state: completed')
    expect(markdown).toContain('- Build replay export')
    expect(markdown).toContain('- workspace Janus Code (local) /repo/janus-code')
    expect(markdown.indexOf('src/a.ts')).toBeLessThan(markdown.indexOf('src/z.ts'))
    expect(markdown.indexOf('Bash: pnpm test')).toBeLessThan(
      markdown.indexOf('Verification passed: pnpm test')
    )
    expect(markdown).toContain('## Approvals')
    expect(markdown).toContain('approved | Bash: pnpm test')
  })

  it('redacts configured values and credential-looking strings', () => {
    const markdown = redactRunReplayMarkdown(
      [
        'curl -H "Authorization: Bearer abcdefghijklmnopqrstuvwxyz"',
        'OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456',
        'deploy --token=super-secret-token',
        'https://example.test?access_token=abcd1234&ok=true'
      ].join('\n'),
      ['super-secret-token']
    )

    expect(markdown).not.toContain('abcdefghijklmnopqrstuvwxyz')
    expect(markdown).not.toContain('super-secret-token')
    expect(markdown).not.toContain('abcd1234')
    expect(markdown).toContain('Bearer [REDACTED]')
    expect(markdown).toContain('OPENAI_API_KEY=[REDACTED]')
    expect(markdown).toContain('access_token=[REDACTED]')
  })
})
