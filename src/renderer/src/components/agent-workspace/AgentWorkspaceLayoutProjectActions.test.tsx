// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'

const storeMocks = vi.hoisted(() => ({
  setActiveWorktree: vi.fn(),
  openDiff: vi.fn(),
  openModal: vi.fn()
}))
const deleteFlowMocks = vi.hoisted(() => ({
  runWorktreeDelete: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: {
      setActiveWorktree: (worktreeId: string | null) => void
      openDiff: (
        worktreeId: string,
        absolutePath: string,
        displayPath: string,
        language: string,
        staged: boolean
      ) => void
      openModal: (modal: string, data?: Record<string, unknown>) => void
    }) => unknown
  ) =>
    selector({
      setActiveWorktree: storeMocks.setActiveWorktree,
      openDiff: storeMocks.openDiff,
      openModal: storeMocks.openModal
    })
}))

vi.mock('../sidebar/delete-worktree-flow', () => ({
  runWorktreeDelete: deleteFlowMocks.runWorktreeDelete
}))

const roots: Root[] = []

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  storeMocks.setActiveWorktree.mockClear()
  storeMocks.openDiff.mockClear()
  storeMocks.openModal.mockClear()
  deleteFlowMocks.runWorktreeDelete.mockClear()
  document.body.replaceChildren()
})

function makeSelectionSnapshot(activeWorktreeId: string): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId,
    projects: [
      {
        id: 'worktree-1',
        label: 'orca one',
        path: '/Users/jakedom/orca-one',
        hostKind: 'local',
        repoId: 'repo-orca',
        canCreateWorktree: true,
        canDeleteWorktree: true
      },
      {
        id: 'worktree-2',
        label: 'orca two',
        path: '/Users/jakedom/orca-two',
        hostKind: 'local',
        repoId: 'repo-orca',
        canCreateWorktree: true,
        canDeleteWorktree: true
      }
    ],
    threads: [
      {
        id: 'thread-1',
        worktreeId: 'worktree-1',
        title: 'First thread',
        agentKind: 'codex',
        phase: 'running',
        updatedAt: '2026-06-15T12:00:00.000Z',
        branchName: 'feature/first',
        cwd: '/Users/jakedom/orca-one'
      },
      {
        id: 'thread-2',
        worktreeId: 'worktree-2',
        title: 'Second thread',
        agentKind: 'codex',
        phase: 'waiting-for-user',
        updatedAt: '2026-06-15T12:05:00.000Z',
        branchName: 'feature/second',
        cwd: '/Users/jakedom/orca-two'
      }
    ],
    plans: [],
    timeline: [
      {
        id: 'timeline-1',
        threadId: 'thread-1',
        kind: 'agent',
        text: 'First timeline event',
        createdAt: '2026-06-15T12:00:00.000Z'
      },
      {
        id: 'timeline-2',
        threadId: 'thread-2',
        kind: 'agent',
        text: 'Second timeline event',
        createdAt: '2026-06-15T12:05:00.000Z'
      }
    ],
    approvals: [],
    diffs: [],
    terminalAvailable: false
  }
}

function renderLayout(snapshot = makeSelectionSnapshot('worktree-1')): HTMLElement {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  roots.push(root)
  act(() => {
    root.render(<AgentWorkspaceLayout snapshot={snapshot} />)
  })
  return container
}

describe('AgentWorkspaceLayout project actions', () => {
  it('follows active worktree changes when the snapshot changes', () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    act(() => {
      root.render(<AgentWorkspaceLayout snapshot={makeSelectionSnapshot('worktree-1')} />)
    })

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')

    act(() => {
      root.render(<AgentWorkspaceLayout snapshot={makeSelectionSnapshot('worktree-2')} />)
    })

    expect(container.textContent).toContain('Second timeline event')
  })

  it('activates a selected project through the Orca worktree store', () => {
    const container = renderLayout()

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')

    const secondProjectButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('orca two')
    )
    expect(secondProjectButton).toBeDefined()

    act(() => {
      secondProjectButton?.click()
    })

    expect(storeMocks.setActiveWorktree).toHaveBeenCalledWith('worktree-2')
    expect(container.textContent).toContain('Second timeline event')
  })

  it('opens the existing workspace composer for the selected project repo', () => {
    const container = renderLayout()

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'Create worktree'
    )
    expect(createButton).toBeDefined()

    act(() => {
      createButton?.click()
    })

    expect(storeMocks.openModal).toHaveBeenCalledWith('new-workspace-composer', {
      initialRepoId: 'repo-orca',
      telemetrySource: 'sidebar'
    })
  })

  it('routes project deletion through the existing worktree delete preflight flow', () => {
    const container = renderLayout()

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'Delete worktree'
    )
    expect(deleteButton).toBeDefined()

    act(() => {
      deleteButton?.click()
    })

    expect(deleteFlowMocks.runWorktreeDelete).toHaveBeenCalledWith('worktree-1')
  })
})
