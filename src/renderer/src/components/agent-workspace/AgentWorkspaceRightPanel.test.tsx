// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceApproval,
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

function findTab(container: HTMLElement, label: string): HTMLButtonElement {
  const tab = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
    (button) => button.textContent === label
  )
  if (!tab) {
    throw new Error(`${label} tab not found`)
  }
  return tab
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

  it('renders the selected controlled tab as active', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          thread={runningThread}
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

    expect(findTab(container, 'Plan').getAttribute('data-state')).toBe('inactive')
    expect(findTab(container, 'Diff').getAttribute('data-state')).toBe('active')
    expect(findTab(container, 'Review').getAttribute('data-state')).toBe('inactive')
    expect(findTab(container, 'Details').getAttribute('data-state')).toBe('inactive')
    expect(container.textContent).toContain(diffSummary.filePath)
  })

  it('reports tab changes through the controlled state callback', async () => {
    const onSelectedTabChange = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          thread={runningThread}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          review={null}
          terminalAvailable
          selectedTab="plan"
          onSelectedTabChange={onSelectedTabChange}
        />
      )
    })

    await act(async () => {
      findTab(container, 'Details').dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
      )
    })

    expect(onSelectedTabChange).toHaveBeenCalledWith('details')
  })

  it('sends approve and deny decisions from the details tab', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          thread={{
            ...runningThread,
            phase: 'needs-approval',
            cwd: '/Users/jakedom/janus-code'
          }}
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
})
