// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceApproval,
  AgentWorkspaceTimelineEntry,
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceReviewSummary
} from './agent-workspace-types'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'

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

const secondDiffSummary: AgentWorkspaceDiffSummary = {
  id: 'diff-2',
  threadId: 'thread-2',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceEvidenceRail.tsx',
  additions: 68,
  deletions: 9,
  status: 'added'
}

const secondThread: AgentWorkspaceThread = {
  id: 'thread-2',
  worktreeId: 'worktree-1',
  title: 'Implement evidence rail',
  agentKind: 'claude',
  phase: 'completed',
  updatedAt: '2026-06-16T12:10:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

const reviewSummary: AgentWorkspaceReviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'github',
  providerLabel: 'GitHub',
  number: 17,
  title: 'Implement evidence rail',
  state: 'open',
  status: 'success',
  url: 'https://example.test/review/17',
  updatedAt: '2026-06-16T12:11:00.000Z'
}

const timeline: AgentWorkspaceTimelineEntry[] = [
  {
    id: 'thread-1:user',
    threadId: 'thread-1',
    kind: 'user',
    text: 'Make agent work reviewable.',
    createdAt: '2026-06-16T12:00:00.000Z',
    status: 'done'
  },
  {
    id: 'thread-1:tool',
    threadId: 'thread-1',
    kind: 'tool',
    text: 'pnpm test',
    createdAt: '2026-06-16T12:02:00.000Z',
    status: 'running'
  }
]

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

  it('renders evidence, lifecycle, candidate, and preview recovery controls', async () => {
    const onSelectThread = vi.fn()
    const onOpenBrowserWorkbench = vi.fn()
    const onOpenTerminalDrawer = vi.fn()
    const onReviewDiffs = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread, secondThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          allDiffs={[diffSummary, secondDiffSummary]}
          review={reviewSummary}
          reviews={[reviewSummary]}
          timeline={timeline}
          terminalAvailable
          browserAvailable
          selectedTab="review"
          onSelectedTabChange={() => undefined}
          onSelectThread={onSelectThread}
          onOpenBrowserWorkbench={onOpenBrowserWorkbench}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
          onReviewDiffs={onReviewDiffs}
        />
      )
    })

    expect(container.textContent).toContain('Lifecycle')
    expect(container.textContent).toContain('Evidence')
    expect(container.textContent).toContain('Candidate A')
    expect(container.textContent).toContain('Candidate B')
    expect(container.textContent).toContain('Needs review')
    expect(container.textContent).toContain('Changed files')
    expect(container.textContent).toContain('Preview health')

    const candidateButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((button) => button.textContent?.includes('Candidate B'))
    const previewButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Open preview')
    )
    const terminalButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Open terminal')
    )
    const reviewButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Review changes')
    )

    await act(async () => {
      candidateButton?.click()
      previewButton?.click()
      terminalButton?.click()
      reviewButton?.click()
    })

    expect(onSelectThread).toHaveBeenCalledWith('thread-2')
    expect(onOpenBrowserWorkbench).toHaveBeenCalled()
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
    expect(onReviewDiffs).toHaveBeenCalled()
  })
})
