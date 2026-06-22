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

async function openDetailsPanel(container: HTMLElement): Promise<void> {
  const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
  if (buttons.some((candidate) => candidate.getAttribute('aria-label') === 'Hide details')) {
    return
  }
  const button = buttons.find(
    (candidate) => candidate.getAttribute('aria-label') === 'Show details'
  )

  expect(button).toBeDefined()
  await act(async () => {
    button?.click()
  })
}

describe('AgentWorkspaceLayout active worktree selection', () => {
  it('updates right-panel content when the app shell changes the active worktree', async () => {
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
          id: 'thread-2',
          worktreeId: 'worktree-2',
          title: 'Second thread',
          agentKind: 'codex',
          phase: 'running',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/second',
          cwd: '/Users/jakedom/janus-two'
        }
      ],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [
        {
          id: 'diff-1',
          threadId: 'thread-1',
          filePath: 'src/first.tsx',
          additions: 3,
          deletions: 1,
          status: 'modified'
        },
        {
          id: 'diff-2',
          threadId: 'thread-2',
          filePath: 'src/second.tsx',
          additions: 7,
          deletions: 2,
          status: 'added'
        }
      ],
      terminalAvailable: false
    })

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-1')} />)
    })
    await openDetailsPanel(container)

    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('first.tsx')
    expect(container.textContent).not.toContain('src/second.tsx')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-2')} />)
    })
    await openDetailsPanel(container)

    expect(container.textContent).not.toContain('src/first.tsx')
    expect(container.textContent).toContain('second.tsx')
  })

  it('shows approval details after the details panel opens', async () => {
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
          id: 'thread-2',
          worktreeId: 'worktree-2',
          title: 'Needs approval thread',
          agentKind: 'codex',
          phase: 'needs-approval',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/approval',
          cwd: '/Users/jakedom/janus-two'
        }
      ],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [
        {
          id: 'diff-1',
          threadId: 'thread-1',
          filePath: 'src/first.tsx',
          additions: 3,
          deletions: 1,
          status: 'modified'
        }
      ],
      terminalAvailable: false
    })

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-1')} />)
    })
    await openDetailsPanel(container)

    expect(container.textContent).toContain('first.tsx')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-2')} />)
    })
    await openDetailsPanel(container)

    expect(container.textContent).toContain('Needs approval thread')
    expect(container.textContent).toContain('needs approval')
  })

  it('chooses the plan tab by default for running threads with structured plan state', async () => {
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
                title: 'Planned thread',
                agentKind: 'codex',
                phase: 'running',
                updatedAt: '2026-06-15T12:00:00.000Z',
                branchName: 'feature/plan',
                cwd: '/Users/jakedom/janus-code'
              }
            ],
            plans: [
              {
                id: 'plan-1',
                threadId: 'thread-1',
                title: 'Planned thread execution',
                explanation: 'Use the structured plan state when it is available.',
                steps: [
                  {
                    id: 'step-1',
                    title: 'Render the plan tab',
                    status: 'in-progress'
                  }
                ],
                markdown: '# Planned thread execution\n\n## Summary\n\nRender the plan tab.',
                updatedAt: '2026-06-15T12:01:00.000Z'
              }
            ],
            timeline: [],
            approvals: [],
            diffs: [],
            terminalAvailable: false
          }}
        />
      )
    })
    await openDetailsPanel(container)

    expect(container.textContent).toContain('Environment')
    expect(container.textContent).toContain('Plan')
    expect(container.textContent).toContain('0/1 steps')
    expect(container.textContent).not.toContain('Outputs')
  })

  it('chooses the details tab by default for threads that need approval', async () => {
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
                title: 'Approve command',
                agentKind: 'codex',
                phase: 'needs-approval',
                updatedAt: '2026-06-15T12:00:00.000Z',
                branchName: 'feature/approval',
                cwd: '/Users/jakedom/janus-code'
              }
            ],
            plans: [],
            timeline: [],
            approvals: [],
            diffs: [
              {
                id: 'diff-1',
                threadId: 'thread-1',
                filePath: 'src/approval.tsx',
                additions: 3,
                deletions: 1,
                status: 'modified'
              }
            ],
            terminalAvailable: false
          }}
        />
      )
    })

    expect(container.textContent).toContain('Approve command')
    expect(container.textContent).toContain('needs approval')
  })

  it('opens the terminal drawer from failure and composer controls', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const onOpenTerminalDrawer = vi.fn()
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
                title: 'Failed thread',
                agentKind: 'codex',
                phase: 'failed',
                updatedAt: '2026-06-15T12:00:00.000Z',
                branchName: 'feature/failure',
                cwd: '/Users/jakedom/janus-code'
              }
            ],
            plans: [],
            timeline: [],
            approvals: [],
            diffs: [],
            terminalAvailable: true
          }}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    expect(container.textContent).toContain(
      'Thread failed. Open the terminal drawer to inspect raw output.'
    )

    const centerButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('main button'))
    const failureButton = centerButtons.find((button) =>
      button.textContent?.includes('Open drawer')
    )
    const composerTerminalButton = centerButtons.find(
      (button) => button.getAttribute('aria-label') === 'Open terminal drawer'
    )
    expect(failureButton).not.toBeUndefined()
    expect(composerTerminalButton).not.toBeUndefined()

    await act(async () => {
      failureButton?.click()
    })
    await act(async () => {
      composerTerminalButton?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenNthCalledWith(1, 'failure')
    expect(onOpenTerminalDrawer).toHaveBeenNthCalledWith(2, 'debug-button')
  })
})
