// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceRunEvent,
  AgentWorkspaceThread
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

  it('renders a compact environment info card', async () => {
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

    expect(container.textContent).toContain('Environment')
    expect(container.textContent).toContain('Implement right panel')
    expect(container.textContent).toContain('Codex')
    expect(container.textContent).toContain('running')
    expect(container.textContent).toContain('No plan')
    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('+42')
    expect(container.textContent).toContain('-7')
    expect(container.textContent).toContain('Worktree')
    expect(container.textContent).toContain('janus-code')
    expect(container.textContent).toContain('Branch')
    expect(container.textContent).toContain('feature/janus-gui-workspace')
    expect(container.textContent).toContain('Sources')
  })

  it('floats above the chat surface instead of reserving a side panel column', async () => {
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
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    const shell = container.querySelector<HTMLElement>('.agent-workspace-right-panel')
    expect(shell?.classList.contains('absolute')).toBe(true)
    expect(shell?.classList.contains('right-0')).toBe(true)
    expect(shell?.classList.contains('relative')).toBe(false)
    expect(shell?.classList.contains('shrink-0')).toBe(false)
  })

  it('routes source glyphs to real workspace actions', async () => {
    const onOpenBrowserWorkbench = vi.fn()
    const onOpenProjectFiles = vi.fn()
    const onOpenSourceControl = vi.fn()

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
          selectedTab="details"
          onSelectedTabChange={() => undefined}
          onOpenBrowserWorkbench={onOpenBrowserWorkbench}
          onOpenProjectFiles={onOpenProjectFiles}
          onOpenSourceControl={onOpenSourceControl}
        />
      )
    })

    const openFiles = container.querySelector<HTMLButtonElement>('button[aria-label="Open files"]')
    const openBrowser = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open browser workbench"]'
    )
    const openSourceControl = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open source control"]'
    )

    await act(async () => {
      openFiles?.click()
      openBrowser?.click()
      openSourceControl?.click()
    })

    expect(onOpenProjectFiles).toHaveBeenCalledTimes(1)
    expect(onOpenBrowserWorkbench).toHaveBeenCalledTimes(1)
    expect(onOpenSourceControl).toHaveBeenCalledTimes(1)
  })

  it('omits the old tabbed ledger, replay, and inspector controls', async () => {
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
          review={{
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
          }}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(container.textContent).not.toContain('Output')
    expect(container.textContent).not.toContain('Context')
    expect(container.textContent).not.toContain('Run ledger')
    expect(container.textContent).not.toContain('Copy replay')
    expect(container.textContent).not.toContain('Memory inspector')
    expect(container.textContent).not.toContain('AgentWorkspaceLayout.tsx')
    expect(container.textContent).not.toContain('Review only')
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

  it('keeps approval risk labels visible in the compact card', async () => {
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
          runEvents={runEvents}
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
  })
})
