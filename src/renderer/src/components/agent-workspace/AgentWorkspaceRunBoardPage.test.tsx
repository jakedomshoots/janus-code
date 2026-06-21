// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'

const emptySnapshot: AgentWorkspaceSnapshot = {
  activeWorktreeId: null,
  projects: [],
  threads: [],
  plans: [],
  timeline: [],
  approvals: [],
  diffs: [],
  terminalAvailable: false
}

let currentSnapshot: AgentWorkspaceSnapshot = emptySnapshot
const roots: Root[] = []
const worktreeActivationMocks = vi.hoisted(() => ({
  activateAndRevealWorktree: vi.fn(() => true)
}))
const storeMocks = vi.hoisted(() => {
  const state = {
    agentWorkspaceTestSnapshot: {
      activeWorktreeId: null,
      projects: [],
      threads: [],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      terminalAvailable: false
    } as AgentWorkspaceSnapshot,
    settings: { guiAgentWorkspaceEnabled: false },
    setActiveWorktree: vi.fn(),
    openDiff: vi.fn(),
    openModal: vi.fn(),
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {},
    repos: [],
    worktreesByRepo: {},
    unifiedTabsByWorktree: {},
    activeGroupIdByWorktree: {
      'worktree-1': 'group-1',
      'worktree-2': 'group-2'
    },
    groupsByWorktree: {
      'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }],
      'worktree-2': [{ id: 'group-2', activeTabId: null, tabOrder: [] }]
    },
    createBrowserTab: vi.fn(),
    focusBrowserTabInWorktree: vi.fn(),
    closeBrowserTab: vi.fn(),
    setAgentWorkspaceRightPanelExpanded: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    showRightSidebarFiles: vi.fn()
  }

  return {
    state,
    setActiveWorktree: state.setActiveWorktree,
    openDiff: state.openDiff,
    openModal: state.openModal
  }
})

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) =>
      selector({
        ...storeMocks.state,
        agentWorkspaceTestSnapshot: currentSnapshot
      }),
    {
      getState: () => ({
        ...storeMocks.state,
        agentWorkspaceTestSnapshot: currentSnapshot
      })
    }
  )
}))

vi.mock('./orca-agent-workspace-selectors', () => ({
  selectAgentWorkspaceSnapshot: (state: {
    agentWorkspaceTestSnapshot: AgentWorkspaceSnapshot
  }): AgentWorkspaceSnapshot => state.agentWorkspaceTestSnapshot
}))

vi.mock('@/lib/worktree-activation', () => ({
  activateAndRevealWorktree: worktreeActivationMocks.activateAndRevealWorktree
}))

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

afterEach(async () => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  storeMocks.setActiveWorktree.mockClear()
  storeMocks.openDiff.mockClear()
  storeMocks.openModal.mockClear()
  worktreeActivationMocks.activateAndRevealWorktree.mockClear()
  document.body.replaceChildren()
  await setRendererUiLanguage('en')
})

describe('AgentWorkspaceLayout active worktree selection', () => {
  it('opens same-worktree run-board rows in the active pane', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    await act(async () => {
      root.render(
        <AgentWorkspaceLayout
          snapshot={{
            activeWorktreeId: 'worktree-1',
            projects: [
              {
                id: 'worktree-1',
                label: 'janus-code',
                path: '/Users/jakedom/janus-code',
                hostKind: 'local'
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
                cwd: '/Users/jakedom/janus-code'
              },
              {
                id: 'thread-2',
                worktreeId: 'worktree-1',
                title: 'Second thread',
                agentKind: 'codex',
                phase: 'waiting-for-user',
                updatedAt: '2026-06-15T12:05:00.000Z',
                branchName: 'feature/second',
                cwd: '/Users/jakedom/janus-code'
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
          }}
        />
      )
    })

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')

    const runBoardRow = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open run: Second thread"]'
    )
    expect(runBoardRow).not.toBeNull()

    await act(async () => {
      runBoardRow?.click()
    })

    expect(worktreeActivationMocks.activateAndRevealWorktree).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('First timeline event')
    expect(container.textContent).toContain('Second timeline event')
  })

  it('activates cross-worktree run-board rows and selects their thread after activation', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    const makeSnapshot = (activeWorktreeId: string): AgentWorkspaceSnapshot => ({
      activeWorktreeId,
      projects: [
        {
          id: 'worktree-1',
          label: 'janus one',
          path: '/Users/jakedom/janus-one',
          hostKind: 'local'
        },
        {
          id: 'worktree-2',
          label: 'janus two',
          path: '/Users/jakedom/janus-two',
          hostKind: 'local'
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
          id: 'thread-2a',
          worktreeId: 'worktree-2',
          title: 'Other second thread',
          agentKind: 'codex',
          phase: 'running',
          updatedAt: '2026-06-15T12:01:00.000Z',
          branchName: 'feature/other',
          cwd: '/Users/jakedom/janus-two'
        },
        {
          id: 'thread-2b',
          worktreeId: 'worktree-2',
          title: 'Target second thread',
          agentKind: 'codex',
          phase: 'waiting-for-user',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/target',
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
          id: 'timeline-2a',
          threadId: 'thread-2a',
          kind: 'agent',
          text: 'Other second timeline event',
          createdAt: '2026-06-15T12:01:00.000Z'
        },
        {
          id: 'timeline-2b',
          threadId: 'thread-2b',
          kind: 'agent',
          text: 'Target second timeline event',
          createdAt: '2026-06-15T12:05:00.000Z'
        }
      ],
      approvals: [],
      diffs: [],
      terminalAvailable: false
    })

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-1')} />)
    })

    const runBoardRow = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open run: Target second thread"]'
    )
    expect(runBoardRow).not.toBeNull()

    await act(async () => {
      runBoardRow?.click()
    })

    expect(worktreeActivationMocks.activateAndRevealWorktree).toHaveBeenCalledWith('worktree-2')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-2')} />)
    })

    expect(container.textContent).not.toContain('Other second timeline event')
    expect(container.textContent).toContain('Target second timeline event')
  })

  it('shows best-of-n compare attempts and activates the chosen attempt worktree', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    await act(async () => {
      root.render(
        <AgentWorkspaceLayout
          snapshot={{
            activeWorktreeId: 'worktree-1',
            projects: [
              {
                id: 'worktree-1',
                repoId: 'repo-janus',
                label: 'Attempt one',
                path: '/Users/jakedom/janus-one',
                hostKind: 'local',
                branchName: 'best/one'
              },
              {
                id: 'worktree-2',
                repoId: 'repo-janus',
                label: 'Attempt two',
                path: '/Users/jakedom/janus-two',
                hostKind: 'local',
                branchName: 'best/two'
              }
            ],
            threads: [
              {
                id: 'thread-1',
                worktreeId: 'worktree-1',
                title: 'Try Codex',
                agentKind: 'codex',
                phase: 'completed',
                updatedAt: '2026-06-15T12:00:00.000Z',
                branchName: 'best/one',
                cwd: '/Users/jakedom/janus-one'
              },
              {
                id: 'thread-2',
                worktreeId: 'worktree-2',
                title: 'Try Claude',
                agentKind: 'claude',
                phase: 'completed',
                updatedAt: '2026-06-15T12:05:00.000Z',
                branchName: 'best/two',
                cwd: '/Users/jakedom/janus-two'
              }
            ],
            plans: [],
            timeline: [],
            runEvents: [
              {
                id: 'verify-1',
                threadId: 'thread-1',
                kind: 'verification',
                title: 'Verification passed',
                detail: 'pnpm test',
                createdAt: '2026-06-15T12:01:00.000Z',
                status: 'done',
                telemetry: 'structured'
              },
              {
                id: 'verify-2',
                threadId: 'thread-2',
                kind: 'verification',
                title: 'Verification failed',
                detail: 'pnpm test',
                createdAt: '2026-06-15T12:06:00.000Z',
                status: 'failed',
                telemetry: 'structured'
              }
            ],
            approvals: [],
            diffs: [
              {
                id: 'diff-1',
                threadId: 'thread-1',
                filePath: 'src/one.ts',
                additions: 10,
                deletions: 2,
                status: 'modified'
              },
              {
                id: 'diff-2',
                threadId: 'thread-2',
                filePath: 'src/two.ts',
                additions: 5,
                deletions: 1,
                status: 'modified'
              }
            ],
            terminalAvailable: false
          }}
        />
      )
    })

    expect(container.textContent).toContain('Best-of-N compare')
    expect(container.textContent).toContain('Try Codex')
    expect(container.textContent).toContain('Try Claude')
    expect(container.textContent).toContain('Verification failed')

    const openAttempt = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open attempt: Try Claude"]'
    )
    expect(openAttempt).not.toBeNull()

    await act(async () => {
      openAttempt?.click()
    })

    expect(worktreeActivationMocks.activateAndRevealWorktree).toHaveBeenCalledWith('worktree-2')
  })
})
