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

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement right panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/t3code-gui-workspace',
  cwd: '/Users/jakedom/orca'
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
    expect(findTab(container, 'Terminal').getAttribute('data-state')).toBe('inactive')
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
      findTab(container, 'Terminal').dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })
      )
    })

    expect(onSelectedTabChange).toHaveBeenCalledWith('terminal')
  })

  it('renders thread details in the details tab', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          thread={{
            ...runningThread,
            phase: 'needs-approval',
            cwd: '/Users/jakedom/orca'
          }}
          plan={null}
          approval={approvalRequest}
          diffs={[]}
          review={null}
          terminalAvailable={false}
          selectedTab="details"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    expect(findTab(container, 'Details').getAttribute('data-state')).toBe('active')
    expect(container.textContent).toContain('This thread needs approval before it can continue.')
    expect(container.textContent).toContain('Approve Bash: pnpm test')
    expect(container.textContent).toContain('/Users/jakedom/orca')
  })

  it('opens the terminal drawer from the terminal tab', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          thread={runningThread}
          plan={null}
          approval={null}
          diffs={[]}
          review={null}
          terminalAvailable
          selectedTab="terminal"
          onSelectedTabChange={() => undefined}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const openButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Open drawer')
    )
    expect(openButton).toBeDefined()

    await act(async () => {
      openButton?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('right-panel')
  })
})
