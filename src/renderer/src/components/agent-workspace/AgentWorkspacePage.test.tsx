// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import { AgentWorkspacePage } from './AgentWorkspacePage'
import { formatAgentWorkspaceDiffStatus, formatAgentWorkspacePhase } from './agent-workspace-labels'

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

function renderPage(snapshot: AgentWorkspaceSnapshot): string {
  currentSnapshot = snapshot
  return renderToStaticMarkup(<AgentWorkspacePage />)
}

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

describe('AgentWorkspacePage', () => {
  it('renders an empty state when there are no projects', () => {
    const markup = renderPage(emptySnapshot)

    expect(markup).toContain('Agent workspace')
    expect(markup).toContain('No agent workspaces yet')
    expect(markup).toContain(
      'Add a project or open a worktree to start tracking agent threads here.'
    )
  })

  it('renders the project, thread, and collapsed details affordance for a running thread', () => {
    const markup = renderPage({
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
          title: 'Implement GUI workspace shell',
          agentKind: 'codex',
          phase: 'running',
          updatedAt: '2026-06-15T12:00:00.000Z',
          branchName: 'feature/janus-gui-workspace',
          cwd: '/Users/jakedom/janus-code'
        }
      ],
      plans: [],
      timeline: [
        {
          id: 'timeline-1',
          threadId: 'thread-1',
          kind: 'user',
          text: 'Build the first shell',
          createdAt: '2026-06-15T12:00:00.000Z',
          status: 'done'
        }
      ],
      approvals: [],
      diffs: [
        {
          id: 'diff-1',
          threadId: 'thread-1',
          filePath: 'src/renderer/src/components/Terminal.tsx',
          additions: 12,
          deletions: 2,
          status: 'modified'
        }
      ],
      terminalAvailable: true
    })

    expect(markup).toContain('janus-code')
    expect(markup).toContain('feature/janus-gui-workspace')
    expect(markup).toContain('Implement GUI workspace shell')
    expect(markup).toContain('running')
    expect(markup).toContain('Build the first shell')
    expect(markup).toContain('Message the selected agent')
    expect(markup).toContain('Show details')
    expect(markup).toContain('1 file')
    expect(markup).not.toContain('Run replay export')
  })

  it('does not render the empty workspace header when no thread is selected', () => {
    const markup = renderPage({
      activeWorktreeId: 'worktree-1',
      projects: [
        {
          id: 'worktree-1',
          label: 'janus-code',
          path: '/Users/jakedom/janus-code',
          hostKind: 'local'
        }
      ],
      threads: [],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      terminalAvailable: true
    })

    expect(markup).toContain('Start a new agent session')
    expect(markup).toContain('Ready for Janus Code')
    expect(markup).toContain('New session')
    expect(markup).not.toContain('border-b border-border/60 bg-background px-4')
  })

  it('uses the app shell sidebar instead of rendering an internal project rail', () => {
    const markup = renderPage({
      activeWorktreeId: 'worktree-1',
      projects: [
        {
          id: 'worktree-1',
          repoId: 'repo-1',
          label: 'janus-code',
          path: '/Users/jakedom/janus-code',
          hostKind: 'local',
          canCreateWorktree: true
        }
      ],
      threads: [
        {
          id: 'thread-1',
          worktreeId: 'worktree-1',
          title: 'Blend the GUI into the app shell',
          agentKind: 'codex',
          phase: 'running',
          updatedAt: '2026-06-15T12:00:00.000Z',
          branchName: 'feature/janus-gui-workspace',
          cwd: '/Users/jakedom/janus-code'
        }
      ],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      terminalAvailable: true
    })

    expect(markup).toContain('Blend the GUI into the app shell')
    expect(markup).not.toContain('Projects')
    expect(markup).not.toContain('Create worktree')
  })

  it('renders the Janus workbench without disabled scaffold controls', () => {
    const markup = renderPage({
      activeWorktreeId: 'worktree-1',
      projects: [
        {
          id: 'worktree-1',
          label: 'janus',
          path: '/Users/jakedom/janus',
          hostKind: 'local'
        }
      ],
      threads: [],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      terminalAvailable: true
    })

    expect(markup).toContain('Janus Code')
    expect(markup).toContain('New session')
    expect(markup).toContain('Pane Actions')
    expect(markup).not.toContain('Use New session in the tab strip above')
    expect(markup).not.toContain('Start new session')
    expect(markup).not.toContain('Ready for a Janus session')
    expect(markup).not.toContain('Describe the coding task below.')
    expect(markup).not.toContain('Refresh')
    expect(markup).not.toContain('Panels')
    expect(markup).not.toContain('Run')
    expect(markup).not.toContain('Terminal session is available as a debug panel.')
    expect(markup).not.toContain('Select a thread to view its timeline.')
  })
})

describe('AgentWorkspace phase labels', () => {
  it('localizes user-action phases instead of showing raw enum text', async () => {
    await setRendererUiLanguage('es')

    expect(formatAgentWorkspacePhase('waiting-for-user')).toBe('esperando al usuario')
    expect(formatAgentWorkspacePhase('needs-approval')).toBe('necesita aprobacion')
    expect(formatAgentWorkspaceDiffStatus('modified')).toBe('modificado')
  })

  it('does not apply CSS capitalization to localized phase labels', async () => {
    await setRendererUiLanguage('es')

    const markup = renderToStaticMarkup(
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
              title: 'Esperar aprobacion',
              agentKind: 'codex',
              phase: 'waiting-for-user',
              updatedAt: null,
              branchName: null,
              cwd: '/Users/jakedom/janus-code'
            }
          ],
          plans: [],
          timeline: [],
          approvals: [],
          diffs: [],
          terminalAvailable: false
        }}
      />
    )

    expect(markup).toContain('esperando al usuario')
    expect(markup).not.toContain('capitalize')
  })

  it('localizes timeline labels while details are collapsed', async () => {
    await setRendererUiLanguage('es')

    const markup = renderToStaticMarkup(
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
              title: 'Revisar diff',
              agentKind: 'codex',
              phase: 'completed',
              updatedAt: null,
              branchName: null,
              cwd: '/Users/jakedom/janus-code'
            }
          ],
          plans: [],
          timeline: [
            {
              id: 'timeline-1',
              threadId: 'thread-1',
              kind: 'agent',
              text: 'Cambios listos',
              createdAt: null,
              status: 'done'
            }
          ],
          approvals: [],
          diffs: [
            {
              id: 'diff-1',
              threadId: 'thread-1',
              filePath: 'src/renderer/src/components/Terminal.tsx',
              additions: 4,
              deletions: 1,
              status: 'modified'
            }
          ],
          terminalAvailable: false
        }}
      />
    )

    expect(markup).toContain('agente')
    expect(markup).toContain('completado')
    expect(markup).not.toContain('modified')
  })
})

describe('AgentWorkspaceLayout active worktree selection', () => {
  it('uses the active worktree thread and switches agent tabs inside the workbench', async () => {
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

    const secondThreadTab = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((button) => button.textContent?.includes('Second thread'))
    expect(secondThreadTab).toBeDefined()

    await act(async () => {
      secondThreadTab?.click()
    })

    expect(container.textContent).not.toContain('First timeline event')
    expect(container.textContent).toContain('Second timeline event')
  })
})
