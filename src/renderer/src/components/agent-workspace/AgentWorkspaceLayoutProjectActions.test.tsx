// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'

const storeMocks = vi.hoisted(() => ({
  setActiveWorktree: vi.fn(),
  openDiff: vi.fn(),
  openModal: vi.fn(),
  setGitStatus: vi.fn(),
  updateWorktreeGitIdentity: vi.fn(),
  setUpstreamStatus: vi.fn(),
  fetchUpstreamStatus: vi.fn().mockResolvedValue(undefined),
  createBrowserTab: vi.fn(),
  focusBrowserTabInWorktree: vi.fn(),
  setAgentWorkspaceRightPanelExpanded: vi.fn(),
  setRightSidebarOpen: vi.fn(),
  showRightSidebarFiles: vi.fn()
}))
const deleteFlowMocks = vi.hoisted(() => ({
  runWorktreeDelete: vi.fn()
}))
const runtimeGitMocks = vi.hoisted(() => ({
  stageRuntimeGitPath: vi.fn().mockResolvedValue(undefined),
  discardRuntimeGitPath: vi.fn().mockResolvedValue(undefined),
  commitRuntimeGit: vi.fn().mockResolvedValue({ success: true }),
  getRuntimeGitStatus: vi.fn().mockResolvedValue({ entries: [], conflictOperation: 'unknown' })
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
      settings: { activeRuntimeEnvironmentId: string | null }
      repos: {
        id: string
        path: string
        displayName: string
        connectionId?: string | null
        executionHostId?: string | null
      }[]
      setGitStatus: (worktreeId: string, status: unknown) => void
      updateWorktreeGitIdentity: (
        worktreeId: string,
        identity: { head?: string; branch?: string | null }
      ) => void
      setUpstreamStatus: (worktreeId: string, status: unknown) => void
      fetchUpstreamStatus: () => Promise<void>
      browserTabsByWorktree: Record<string, unknown[]>
      browserAnnotationsByPageId: Record<string, unknown[]>
      activeBrowserTabIdByWorktree: Record<string, string | null>
      createBrowserTab: typeof storeMocks.createBrowserTab
      focusBrowserTabInWorktree: typeof storeMocks.focusBrowserTabInWorktree
      setAgentWorkspaceRightPanelExpanded: (expanded: boolean) => void
      setRightSidebarOpen: (open: boolean) => void
      showRightSidebarFiles: () => void
    }) => unknown
  ) =>
    selector({
      setActiveWorktree: storeMocks.setActiveWorktree,
      openDiff: storeMocks.openDiff,
      openModal: storeMocks.openModal,
      settings: { activeRuntimeEnvironmentId: 'focused-runtime' },
      repos: [
        {
          id: 'repo-janus',
          path: '/Users/jakedom/janus-code',
          displayName: 'Janus Code'
        }
      ],
      setGitStatus: storeMocks.setGitStatus,
      updateWorktreeGitIdentity: storeMocks.updateWorktreeGitIdentity,
      setUpstreamStatus: storeMocks.setUpstreamStatus,
      fetchUpstreamStatus: storeMocks.fetchUpstreamStatus,
      browserTabsByWorktree: {},
      browserAnnotationsByPageId: {},
      activeBrowserTabIdByWorktree: {},
      createBrowserTab: storeMocks.createBrowserTab,
      focusBrowserTabInWorktree: storeMocks.focusBrowserTabInWorktree,
      setAgentWorkspaceRightPanelExpanded: storeMocks.setAgentWorkspaceRightPanelExpanded,
      setRightSidebarOpen: storeMocks.setRightSidebarOpen,
      showRightSidebarFiles: storeMocks.showRightSidebarFiles
    })
}))

vi.mock('../sidebar/delete-worktree-flow', () => ({
  runWorktreeDelete: deleteFlowMocks.runWorktreeDelete
}))

vi.mock('@/runtime/runtime-git-client', () => runtimeGitMocks)

const roots: Root[] = []

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  storeMocks.setActiveWorktree.mockClear()
  storeMocks.openDiff.mockClear()
  storeMocks.openModal.mockClear()
  storeMocks.setGitStatus.mockClear()
  storeMocks.updateWorktreeGitIdentity.mockClear()
  storeMocks.setUpstreamStatus.mockClear()
  storeMocks.fetchUpstreamStatus.mockClear()
  storeMocks.createBrowserTab.mockClear()
  storeMocks.focusBrowserTabInWorktree.mockClear()
  deleteFlowMocks.runWorktreeDelete.mockClear()
  runtimeGitMocks.stageRuntimeGitPath.mockClear()
  runtimeGitMocks.discardRuntimeGitPath.mockClear()
  runtimeGitMocks.commitRuntimeGit.mockClear()
  runtimeGitMocks.getRuntimeGitStatus.mockClear()
  document.body.replaceChildren()
})

function makeSelectionSnapshot(activeWorktreeId: string): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId,
    projects: [
      {
        id: 'worktree-1',
        label: 'janus one',
        path: '/Users/jakedom/janus-one',
        hostKind: 'local',
        repoId: 'repo-janus',
        canCreateWorktree: true,
        canDeleteWorktree: true
      },
      {
        id: 'worktree-2',
        label: 'janus two',
        path: '/Users/jakedom/janus-two',
        hostKind: 'local',
        repoId: 'repo-janus',
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
        cwd: '/Users/jakedom/janus-one'
      },
      {
        id: 'thread-2',
        worktreeId: 'worktree-2',
        title: 'Second thread',
        agentKind: 'codex',
        phase: 'waiting-for-user',
        updatedAt: '2026-06-15T12:05:00.000Z',
        branchName: 'feature/second',
        cwd: '/Users/jakedom/janus-two'
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

function getButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
    (candidate) =>
      candidate.getAttribute('aria-label') === label ||
      candidate.getAttribute('title') === label ||
      candidate.textContent?.includes(label)
  )
  if (!button) {
    throw new Error(`${label} button not found`)
  }
  return button
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), 'value')?.set
  valueSetter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
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

  it('leaves project switching and worktree actions to the app shell sidebar', () => {
    const container = renderLayout()

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')
    expect(container.textContent).not.toContain('janus two')
    expect(
      Array.from(container.querySelectorAll('button')).some((button) =>
        button.textContent?.includes('janus two')
      )
    ).toBe(false)
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.getAttribute('aria-label') === 'Create worktree'
      )
    ).toBe(false)
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.getAttribute('aria-label') === 'Delete worktree'
      )
    ).toBe(false)
    expect(storeMocks.setActiveWorktree).not.toHaveBeenCalled()
    expect(storeMocks.openModal).not.toHaveBeenCalled()
    expect(deleteFlowMocks.runWorktreeDelete).not.toHaveBeenCalled()
  })

  it('runs source-control actions against the selected local project host', async () => {
    const snapshot = {
      ...makeSelectionSnapshot('worktree-1'),
      diffs: [
        {
          id: 'diff-1',
          threadId: 'thread-1',
          area: 'unstaged' as const,
          filePath: 'src/app.ts',
          additions: 4,
          deletions: 1,
          status: 'modified' as const
        },
        {
          id: 'diff-2',
          threadId: 'thread-1',
          area: 'staged' as const,
          filePath: 'src/index.ts',
          additions: 2,
          deletions: 0,
          status: 'modified' as const
        }
      ]
    } satisfies AgentWorkspaceSnapshot
    const container = renderLayout(snapshot)

    await act(async () => {
      getButton(container, 'Stage').click()
      await Promise.resolve()
    })

    expect(runtimeGitMocks.stageRuntimeGitPath).toHaveBeenCalledWith(
      {
        settings: { activeRuntimeEnvironmentId: null },
        worktreeId: 'worktree-1',
        worktreePath: '/Users/jakedom/janus-one',
        connectionId: undefined
      },
      'src/app.ts'
    )
    expect(runtimeGitMocks.getRuntimeGitStatus).toHaveBeenCalled()

    await act(async () => {
      getButton(container, 'Discard').click()
      await Promise.resolve()
    })

    expect(runtimeGitMocks.discardRuntimeGitPath).toHaveBeenCalledWith(
      {
        settings: { activeRuntimeEnvironmentId: null },
        worktreeId: 'worktree-1',
        worktreePath: '/Users/jakedom/janus-one',
        connectionId: undefined
      },
      'src/app.ts'
    )

    await act(async () => {
      getButton(container, 'src/index.ts').click()
    })
    const messageInput = container.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Commit message"]'
    )
    expect(messageInput).not.toBeNull()

    await act(async () => {
      if (messageInput) {
        setTextareaValue(messageInput, 'feat: wire gui source control')
      }
    })
    await act(async () => {
      getButton(container, 'Commit').click()
      await Promise.resolve()
    })

    expect(runtimeGitMocks.commitRuntimeGit).toHaveBeenCalledWith(
      {
        settings: { activeRuntimeEnvironmentId: null },
        worktreeId: 'worktree-1',
        worktreePath: '/Users/jakedom/janus-one',
        connectionId: undefined
      },
      'feat: wire gui source control'
    )
  })
})
