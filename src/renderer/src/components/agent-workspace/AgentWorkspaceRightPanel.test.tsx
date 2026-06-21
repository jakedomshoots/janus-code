// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceApproval,
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import type { MemorySnapshot } from '../../../../shared/types'

const approvalMocks = vi.hoisted(() => ({
  respondToAgentWorkspaceApproval: vi.fn(async () => ({ status: 'sent' as const }))
}))

vi.mock('./agent-workspace-approval-response', () => ({
  respondToAgentWorkspaceApproval: approvalMocks.respondToAgentWorkspaceApproval,
  getAgentWorkspaceApprovalResponseMessage: () => 'Approval sent to the agent terminal.'
}))

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement right panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'janus-code',
  path: '/Users/jakedom/janus-code',
  hostKind: 'local',
  branchName: 'feature/janus-gui-workspace'
}

const diffSummary: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx',
  additions: 42,
  deletions: 7,
  status: 'modified'
}

const reviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'gitlab',
  providerLabel: 'GitLab',
  number: 42,
  title: 'Tighten workspace context',
  state: 'open',
  url: 'https://gitlab.example.com/janus/merge_requests/42',
  status: 'pending',
  updatedAt: '2026-06-16T12:00:00.000Z'
} as const

const approvalRequest: AgentWorkspaceApproval = {
  id: 'thread-1:approval:approval-1',
  threadId: 'thread-1',
  providerKind: 'codex',
  worktreeId: 'worktree-1',
  status: 'requested',
  title: 'Approve Bash',
  description: 'Run the test suite before commit.',
  toolName: 'Bash',
  toolInput: 'pnpm test',
  fallbackText: 'Approve Bash: pnpm test',
  updatedAt: '2026-06-16T12:01:00.000Z'
}

const riskyApprovalRequest: AgentWorkspaceApproval = {
  ...approvalRequest,
  toolInput: 'rm -rf dist',
  fallbackText: 'Approve Bash: rm -rf dist',
  risk: {
    category: 'delete',
    level: 'high',
    reason: 'Deletes files or directories.'
  },
  protectedResourcePolicyMatches: [
    {
      policyId: 'prod-delete',
      label: 'Production deletes',
      scope: { kind: 'global' },
      requiresApproval: true,
      reasons: ['command']
    }
  ]
}

const runEvents: AgentWorkspaceRunEvent[] = [
  {
    id: 'thread-1:state:running',
    threadId: 'thread-1',
    kind: 'state',
    title: 'Running',
    detail: 'Implement right panel',
    createdAt: '2026-06-16T12:00:00.000Z',
    status: 'running',
    telemetry: 'partial'
  },
  {
    id: 'thread-1:tool:tool-1',
    threadId: 'thread-1',
    kind: 'tool',
    title: 'Bash',
    detail: 'pnpm test',
    createdAt: '2026-06-16T12:01:00.000Z',
    status: 'running',
    telemetry: 'structured'
  }
]

const riskyRunEvents: AgentWorkspaceRunEvent[] = [
  {
    id: 'thread-1:tool:tool-delete',
    threadId: 'thread-1',
    kind: 'tool',
    title: 'Bash',
    detail: 'rm -rf dist',
    createdAt: '2026-06-16T12:01:00.000Z',
    status: 'running',
    telemetry: 'structured',
    risk: {
      category: 'delete',
      level: 'high',
      reason: 'Deletes files or directories.'
    },
    protectedResourcePolicyMatches: [
      {
        policyId: 'prod-delete',
        label: 'Production deletes',
        scope: { kind: 'global' },
        requiresApproval: true,
        reasons: ['command']
      }
    ]
  }
]

const memorySnapshot: MemorySnapshot = {
  app: {
    cpu: 1,
    memory: 1024,
    main: { cpu: 1, memory: 512 },
    renderer: { cpu: 0, memory: 256 },
    other: { cpu: 0, memory: 256 },
    history: [1024]
  },
  worktrees: [
    {
      worktreeId: 'worktree-1',
      worktreeName: 'janus-code',
      repoId: 'repo-janus',
      repoName: 'Janus',
      cpu: 1,
      memory: 2048,
      sessions: [],
      history: [2048]
    }
  ],
  host: {
    totalMemory: 8192,
    freeMemory: 4096,
    usedMemory: 4096,
    memoryUsagePercent: 50,
    cpuCoreCount: 8,
    loadAverage1m: 1
  },
  totalCpu: 2,
  totalMemory: 3072,
  collectedAt: Date.UTC(2026, 5, 21, 16, 0)
}

describe('AgentWorkspaceRightPanel', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    approvalMocks.respondToAgentWorkspaceApproval.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
  })

  it('renders a live conversation info card', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={[]}
          review={null}
          terminalAvailable
          selectedTab="diff"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('Output')
    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('Context')
    expect(container.textContent).toContain('AgentWorkspaceLayout.tsx')
    expect(container.textContent).toContain('modified')
  })

  it('offers review-only launches from changes and review tabs', async () => {
    const onLaunchReviewOnly = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={[]}
          review={reviewSummary}
          terminalAvailable
          selectedTab="diff"
          onSelectedTabChange={() => undefined}
          onLaunchReviewOnly={onLaunchReviewOnly}
          reviewOnlyWarning="Best-effort review-only mode. This agent may still be able to edit files."
        />
      )
    })

    const diffReviewButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((button) => button.textContent?.includes('Review only'))
    expect(diffReviewButton).toBeDefined()
    expect(container.textContent).toContain('Best-effort review-only mode')

    await act(async () => {
      diffReviewButton?.click()
    })
    expect(onLaunchReviewOnly).toHaveBeenCalledWith('diff')

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={[]}
          review={reviewSummary}
          terminalAvailable
          selectedTab="review"
          onSelectedTabChange={() => undefined}
          onLaunchReviewOnly={onLaunchReviewOnly}
          reviewOnlyWarning={null}
        />
      )
    })

    const reviewTabButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((button) => button.textContent?.includes('Review only'))
    expect(reviewTabButton).toBeDefined()
    expect(container.textContent).not.toContain('Best-effort review-only mode')

    await act(async () => {
      reviewTabButton?.click()
    })
    expect(onLaunchReviewOnly).toHaveBeenLastCalledWith('review')
  })

  it('renders structured review-only findings as prioritized review notes', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={[]}
          review={reviewSummary}
          reviewFindings={[
            {
              id: 'finding-1',
              threadId: runningThread.id,
              severity: 'high',
              filePath: 'src/renderer/src/App.tsx',
              lineNumber: 42,
              title: 'Cleanup is skipped',
              rationale: 'The effect starts a subscription but never returns a cleanup.'
            },
            {
              id: 'finding-2',
              threadId: runningThread.id,
              severity: 'low',
              filePath: 'src/renderer/src/App.tsx',
              lineNumber: null,
              title: 'Copy is vague',
              rationale: 'The empty state does not name the next action.'
            }
          ]}
          terminalAvailable
          selectedTab="review"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('Review findings')
    expect(container.textContent).toContain('High')
    expect(container.textContent).toContain('src/renderer/src/App.tsx:42')
    expect(container.textContent).toContain('Cleanup is skipped')
    expect(container.textContent).toContain('Low')
    expect(container.textContent).toContain('Copy is vague')
  })

  it('sends approve and deny decisions from the info card', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={{
            ...runningThread,
            phase: 'needs-approval',
            cwd: '/Users/jakedom/janus-code'
          }}
          threads={[runningThread]}
          plan={null}
          approval={approvalRequest}
          diffs={[]}
          runEvents={[]}
          review={null}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const approveButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Approve')
    )
    const denyButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Deny')
    )
    expect(approveButton).toBeDefined()
    expect(denyButton).toBeDefined()

    await act(async () => {
      approveButton?.click()
    })

    expect(approvalMocks.respondToAgentWorkspaceApproval).toHaveBeenCalledWith({
      threadId: 'thread-1',
      worktreeId: 'worktree-1',
      agentKind: 'codex',
      decision: 'approve',
      onOpenTerminalDrawer
    })

    await act(async () => {
      denyButton?.click()
    })

    expect(approvalMocks.respondToAgentWorkspaceApproval).toHaveBeenLastCalledWith({
      threadId: 'thread-1',
      worktreeId: 'worktree-1',
      agentKind: 'codex',
      decision: 'deny',
      onOpenTerminalDrawer
    })
  })

  it('shows the run ledger in the context tab', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={runEvents}
          review={null}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('Run ledger')
    expect(container.textContent).toContain('Partial telemetry')
    expect(container.textContent).toContain('Bash')
    expect(container.textContent).toContain('pnpm test')
    expect(container.textContent).toContain('Changed files')
    expect(container.textContent).toContain('1 file changed')
    expect(container.textContent).toContain('Verification unknown')
  })

  it('shows the memory inspector in the context tab', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={runEvents}
          review={null}
          terminalAvailable
          selectedTab="details"
          memorySnapshot={memorySnapshot}
          memorySnapshotError={null}
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('Memory inspector')
    expect(container.textContent).toContain('Janus resource snapshot')
    expect(container.textContent).toContain('Workspace sessions')
  })

  it('shows risk labels in the run ledger and approval prompt', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={{
            ...runningThread,
            phase: 'needs-approval',
            cwd: '/Users/jakedom/janus-code'
          }}
          threads={[runningThread]}
          plan={null}
          approval={riskyApprovalRequest}
          diffs={[]}
          runEvents={riskyRunEvents}
          review={null}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).toContain('High risk')
    expect(container.textContent).toContain('Delete')
    expect(container.textContent).toContain('Protected')
    expect(container.textContent).toContain('Production deletes')
    expect(container.textContent).toContain('rm -rf dist')
  })

  it('copies a redacted run replay markdown report', async () => {
    const writeClipboardText = vi.fn<(text: string) => Promise<void>>(async () => undefined)
    window.api = {
      ui: {
        writeClipboardText
      }
    } as never

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          runEvents={[
            ...runEvents,
            {
              id: 'thread-1:tool:secret',
              threadId: 'thread-1',
              kind: 'tool',
              title: 'Bash',
              detail: 'OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456',
              createdAt: '2026-06-16T12:02:00.000Z',
              status: 'done',
              telemetry: 'structured'
            }
          ]}
          timeline={[
            {
              id: 'thread-1:user:1',
              threadId: 'thread-1',
              kind: 'user',
              text: 'Build the replay export.',
              createdAt: '2026-06-16T12:00:00.000Z',
              status: 'done'
            }
          ]}
          runReplayContext={{
            threadId: 'thread-1',
            prompt: 'Build the replay export.',
            promptContextManifest: {
              items: [
                {
                  id: 'workspace-context',
                  kind: 'workspace',
                  label: 'janus-code',
                  path: '/Users/jakedom/janus-code',
                  hostKind: 'local',
                  branchName: 'feature/janus-gui-workspace',
                  stale: false
                }
              ]
            }
          }}
          review={null}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    const copyButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Copy replay')
    )
    expect(copyButton).not.toBeNull()

    await act(async () => {
      copyButton?.click()
      await Promise.resolve()
    })

    expect(writeClipboardText).toHaveBeenCalledTimes(1)
    const markdown = writeClipboardText.mock.calls[0]?.[0] ?? ''
    expect(markdown).toContain('# Agent Run Replay: Implement right panel')
    expect(markdown).toContain('## Context Manifest')
    expect(markdown).toContain('[REDACTED]')
    expect(markdown).not.toContain('sk-proj-abcdefghijklmnopqrstuvwxyz123456')
    expect(container.textContent).toContain('Replay copied.')
  })
})
