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
  const setRightSidebarTab = vi.fn()
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
    setRightSidebarTab,
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
    setRightSidebarTab,
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
  storeMocks.setAgentWorkspaceRightPanelExpanded.mockClear()
  storeMocks.setRightSidebarOpen.mockClear()
  storeMocks.setRightSidebarTab.mockClear()
  storeMocks.showRightSidebarFiles.mockClear()
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

  it('opens the complete Source Control sidebar from floating source-control rows', async () => {
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
      getButton(container, 'Changes').click()
    })
    expect(storeMocks.setRightSidebarTab).toHaveBeenLastCalledWith('source-control')
    expect(storeMocks.setRightSidebarOpen).toHaveBeenLastCalledWith(true)
    expect(container.querySelector('.agent-workspace-right-panel-shell')).toBeNull()
  })

  it('opens files and agent-session surfaces from non-source-control rows', async () => {
    const container = renderLayout()

    await act(async () => {
      getButton(container, 'Side chat').click()
    })
    expect(storeMocks.setRightSidebarTab).toHaveBeenLastCalledWith('vault')
    expect(storeMocks.setRightSidebarOpen).toHaveBeenLastCalledWith(true)

    roots.splice(0).forEach((root) => {
      act(() => root.unmount())
    })
    document.body.replaceChildren()
    storeMocks.setRightSidebarTab.mockClear()
    storeMocks.setRightSidebarOpen.mockClear()
    storeMocks.showRightSidebarFiles.mockClear()
    const nextContainer = renderLayout()

    await act(async () => {
      getButton(nextContainer, 'Worktree').click()
    })
    expect(storeMocks.showRightSidebarFiles).toHaveBeenCalledTimes(1)
  })
})
