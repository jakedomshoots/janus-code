// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'

const storeMocks = vi.hoisted(() => {
  const setActiveWorktree = vi.fn()
  const openDiff = vi.fn()
  const openModal = vi.fn()
  const setGitStatus = vi.fn()
  const updateWorktreeGitIdentity = vi.fn()
  const setUpstreamStatus = vi.fn()
  const fetchUpstreamStatus = vi.fn().mockResolvedValue(undefined)
  const createBrowserTab = vi.fn()
  const focusBrowserTabInWorktree = vi.fn()
  const closeBrowserTab = vi.fn()
  const setAgentWorkspaceRightPanelExpanded = vi.fn()
  const setRightSidebarOpen = vi.fn()
  const showRightSidebarFiles = vi.fn()
  const state = {
    setActiveWorktree,
    openDiff,
    openModal,
    settings: { activeRuntimeEnvironmentId: 'focused-runtime', guiAgentWorkspaceEnabled: false },
    repos: [
      {
        id: 'repo-janus',
        path: '/Users/jakedom/janus-code',
        displayName: 'Janus Code'
      }
    ],
    setGitStatus,
    updateWorktreeGitIdentity,
    setUpstreamStatus,
    fetchUpstreamStatus,
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {},
    remoteDetectedAgentIds: {},
    runtimeDetectedAgentIds: {},
    isDetectingRemoteAgents: {},
    isDetectingRuntimeAgents: {},
    detectedAgentIds: [],
    isDetectingAgents: false,
    isRefreshingAgents: false,
    ensureDetectedAgents: vi.fn().mockResolvedValue([]),
    ensureRemoteDetectedAgents: vi.fn().mockResolvedValue([]),
    ensureRuntimeDetectedAgents: vi.fn().mockResolvedValue([]),
    refreshDetectedAgents: vi.fn().mockResolvedValue([]),
    activeGroupIdByWorktree: {
      'worktree-1': 'group-1',
      'worktree-2': 'group-2'
    },
    groupsByWorktree: {
      'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }],
      'worktree-2': [{ id: 'group-2', activeTabId: null, tabOrder: [] }]
    },
    unifiedTabsByWorktree: {},
    worktreesByRepo: {},
    remoteBrowserPageHandlesByPageId: {},
    createBrowserTab,
    focusBrowserTabInWorktree,
    closeBrowserTab,
    setAgentWorkspaceRightPanelExpanded,
    setRightSidebarOpen,
    showRightSidebarFiles
  }

  return {
    state,
    setActiveWorktree,
    openDiff,
    openModal,
    setGitStatus,
    updateWorktreeGitIdentity,
    setUpstreamStatus,
    fetchUpstreamStatus,
    createBrowserTab,
    focusBrowserTabInWorktree,
    setAgentWorkspaceRightPanelExpanded,
    setRightSidebarOpen,
    showRightSidebarFiles
  }
})
const deleteFlowMocks = vi.hoisted(() => ({
  runWorktreeDelete: vi.fn()
}))
const runtimeGitMocks = vi.hoisted(() => ({
  stageRuntimeGitPath: vi.fn().mockResolvedValue(undefined),
  unstageRuntimeGitPath: vi.fn().mockResolvedValue(undefined),
  discardRuntimeGitPath: vi.fn().mockResolvedValue(undefined),
  commitRuntimeGit: vi.fn().mockResolvedValue({ success: true }),
  getRuntimeGitStatus: vi.fn().mockResolvedValue({ entries: [], conflictOperation: 'unknown' })
}))
const editorAutosaveMocks = vi.hoisted(() => ({
  requestEditorSaveQuiesce: vi.fn().mockResolvedValue(undefined),
  notifyEditorExternalFileChange: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

vi.mock('../sidebar/delete-worktree-flow', () => ({
  runWorktreeDelete: deleteFlowMocks.runWorktreeDelete
}))

vi.mock('@/runtime/runtime-git-client', () => runtimeGitMocks)

vi.mock('@/components/editor/editor-autosave', () => editorAutosaveMocks)

vi.mock('@/components/tab-group/useTabGroupWorkspaceModel', () => ({
  useTabGroupWorkspaceModel: () => ({
    commands: {
      newTerminalTab: vi.fn(),
      newTerminalWithShell: vi.fn(),
      newBrowserTab: vi.fn(),
      newFileTab: vi.fn(async () => undefined),
      newSimulatorTab: vi.fn(),
      openEntry: vi.fn(async () => undefined),
      duplicateBrowserTab: vi.fn()
    },
    browserItems: [],
    activeTab: null,
    groupTabs: []
  })
}))

vi.mock('./useAgentBrowserWorkbench', () => ({
  useAgentBrowserWorkbench: () => ({
    browserWorkbenchReady: true,
    canOpenBrowserDrawer: true,
    browserAvailable: true,
    browserTabCount: 0,
    browserAnnotationCount: 0,
    browserAnnotationMarkdown: '',
    canAttachBrowserContext: false,
    openBrowserWorkbench: vi.fn()
  })
}))

vi.mock('@/components/tab-bar/TabBarNewTabMenu', () => ({
  TabBarNewTabMenu: () => (
    <button type="button" aria-label="New tab">
      New tab
    </button>
  )
}))

vi.mock('@/components/tab-group/TabGroupPaneActionChrome', () => ({
  TabGroupPaneActionChrome: () => (
    <button type="button" aria-label="Pane Actions">
      Pane Actions
    </button>
  )
}))

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
  runtimeGitMocks.unstageRuntimeGitPath.mockClear()
  runtimeGitMocks.discardRuntimeGitPath.mockClear()
  runtimeGitMocks.commitRuntimeGit.mockClear()
  runtimeGitMocks.getRuntimeGitStatus.mockClear()
  editorAutosaveMocks.requestEditorSaveQuiesce.mockClear()
  editorAutosaveMocks.notifyEditorExternalFileChange.mockClear()
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
    expect(container.querySelector('button[aria-label="Open run: Second thread"]')).toBeNull()
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (button) => button.textContent?.trim() === 'janus two'
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

  it('renders selected-thread run evidence in the header chrome', () => {
    const container = renderLayout({
      ...makeSelectionSnapshot('worktree-1'),
      runEvents: [
        {
          id: 'state-thread-1',
          threadId: 'thread-1',
          kind: 'state',
          title: 'Working',
          detail: 'First thread',
          createdAt: '2026-06-15T12:00:00.000Z',
          status: 'running',
          telemetry: 'partial'
        },
        {
          id: 'tool-thread-1',
          threadId: 'thread-1',
          kind: 'tool',
          title: 'Bash',
          detail: 'pnpm test',
          createdAt: '2026-06-15T12:01:00.000Z',
          status: 'running',
          telemetry: 'structured'
        },
        {
          id: 'approval-thread-1',
          threadId: 'thread-1',
          kind: 'approval',
          title: 'Approval requested',
          detail: 'Run pnpm test',
          createdAt: '2026-06-15T12:02:00.000Z',
          status: 'pending',
          telemetry: 'structured'
        },
        {
          id: 'tool-thread-2',
          threadId: 'thread-2',
          kind: 'tool',
          title: 'Bash',
          detail: 'pnpm lint',
          createdAt: '2026-06-15T12:03:00.000Z',
          status: 'done',
          telemetry: 'structured'
        }
      ],
      diffs: [
        {
          id: 'diff-thread-1',
          threadId: 'thread-1',
          filePath: 'src/app.ts',
          additions: 2,
          deletions: 1,
          status: 'modified'
        },
        {
          id: 'diff-thread-2',
          threadId: 'thread-2',
          filePath: 'src/other.ts',
          additions: 1,
          deletions: 0,
          status: 'modified'
        }
      ]
    })

    const headerText = container.querySelector('header')?.textContent ?? ''
    expect(headerText).toContain('Approval requested')
    expect(headerText).toContain('pnpm test')
    expect(headerText).toContain('1 file')
    expect(headerText).toContain('Needs attention')
    expect(headerText).not.toContain('pnpm lint')
  })

  it('keeps source-control mutation controls out of the persistent local info card', () => {
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
    expect(container.textContent).toContain('Environment')
    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('+6')
    expect(container.textContent).toContain('-1')
    expect(container.textContent).not.toContain('Stage')
    expect(container.textContent).not.toContain('Discard')
    expect(container.textContent).not.toContain('Commit')
    expect(runtimeGitMocks.stageRuntimeGitPath).not.toHaveBeenCalled()
    expect(runtimeGitMocks.discardRuntimeGitPath).not.toHaveBeenCalled()
    expect(runtimeGitMocks.commitRuntimeGit).not.toHaveBeenCalled()
  })

  it('keeps source-control mutation controls out of the persistent SSH info card', () => {
    const snapshot = {
      ...makeSelectionSnapshot('worktree-ssh'),
      projects: [
        {
          id: 'worktree-ssh',
          label: 'janus ssh',
          path: '/home/jake/janus-code',
          hostKind: 'ssh' as const,
          repoId: 'repo-janus',
          canCreateWorktree: true,
          canDeleteWorktree: true,
          agentDetectionTarget: { kind: 'ssh' as const, connectionId: 'ssh-1' }
        }
      ],
      threads: [
        {
          id: 'thread-ssh',
          worktreeId: 'worktree-ssh',
          title: 'SSH thread',
          agentKind: 'codex',
          phase: 'waiting-for-user' as const,
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/ssh',
          cwd: '/home/jake/janus-code'
        }
      ],
      timeline: [],
      diffs: [
        {
          id: 'diff-ssh-unstaged',
          threadId: 'thread-ssh',
          area: 'unstaged' as const,
          filePath: 'src/app.ts',
          additions: 4,
          deletions: 1,
          status: 'modified' as const
        },
        {
          id: 'diff-ssh-staged',
          threadId: 'thread-ssh',
          area: 'staged' as const,
          filePath: 'src/index.ts',
          additions: 2,
          deletions: 0,
          status: 'modified' as const
        }
      ]
    } satisfies AgentWorkspaceSnapshot
    const container = renderLayout(snapshot)
    expect(container.textContent).toContain('Environment')
    expect(container.textContent).toContain('janus ssh')
    expect(container.textContent).toContain('feature/ssh')
    expect(container.textContent).toContain('+6')
    expect(container.textContent).toContain('-1')
    expect(container.textContent).not.toContain('Stage')
    expect(container.textContent).not.toContain('Discard')
    expect(container.textContent).not.toContain('Unstage')
    expect(container.textContent).not.toContain('Commit')
    expect(runtimeGitMocks.stageRuntimeGitPath).not.toHaveBeenCalled()
    expect(runtimeGitMocks.unstageRuntimeGitPath).not.toHaveBeenCalled()
    expect(runtimeGitMocks.discardRuntimeGitPath).not.toHaveBeenCalled()
    expect(runtimeGitMocks.commitRuntimeGit).not.toHaveBeenCalled()
    expect(editorAutosaveMocks.requestEditorSaveQuiesce).not.toHaveBeenCalled()
    expect(editorAutosaveMocks.notifyEditorExternalFileChange).not.toHaveBeenCalled()
  })
})
