// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import { AgentWorkspacePage } from './AgentWorkspacePage'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import { TerminalViewSwitch } from '../terminal/terminal-view-switch'

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
const storeMocks = vi.hoisted(() => ({
  setActiveWorktree: vi.fn(),
  openDiff: vi.fn(),
  openModal: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: {
      agentWorkspaceTestSnapshot: AgentWorkspaceSnapshot
      settings: { guiAgentWorkspaceEnabled: boolean }
      setActiveWorktree: typeof storeMocks.setActiveWorktree
      openDiff: typeof storeMocks.openDiff
      openModal: typeof storeMocks.openModal
    }) => unknown
  ) =>
    selector({
      agentWorkspaceTestSnapshot: currentSnapshot,
      settings: { guiAgentWorkspaceEnabled: false },
      setActiveWorktree: storeMocks.setActiveWorktree,
      openDiff: storeMocks.openDiff,
      openModal: storeMocks.openModal
    })
}))

vi.mock('./orca-agent-workspace-selectors', () => ({
  selectAgentWorkspaceSnapshot: (state: {
    agentWorkspaceTestSnapshot: AgentWorkspaceSnapshot
  }): AgentWorkspaceSnapshot => state.agentWorkspaceTestSnapshot
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

  it('renders the project, thread, header, and right-panel shell for a running thread', () => {
    const markup = renderPage({
      activeWorktreeId: 'worktree-1',
      projects: [
        {
          id: 'worktree-1',
          label: 'orca',
          path: '/Users/jakedom/orca',
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
          branchName: 'feature/t3code-gui-workspace',
          cwd: '/Users/jakedom/orca'
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

    expect(markup).toContain('orca')
    expect(markup).toContain('feature/t3code-gui-workspace')
    expect(markup).toContain('Implement GUI workspace shell')
    expect(markup).toContain('running')
    expect(markup).toContain('Build the first shell')
    expect(markup).toContain('Plan')
    expect(markup).toContain('Diff')
    expect(markup).toContain('Terminal')
    expect(markup).toContain('Message the selected agent')
    expect(markup).toContain('src/renderer/src/components/Terminal.tsx')
  })

  it('uses the app shell sidebar instead of rendering an internal project rail', () => {
    const markup = renderPage({
      activeWorktreeId: 'worktree-1',
      projects: [
        {
          id: 'worktree-1',
          repoId: 'repo-1',
          label: 'orca',
          path: '/Users/jakedom/orca',
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
          branchName: 'feature/t3code-gui-workspace',
          cwd: '/Users/jakedom/orca'
        }
      ],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      terminalAvailable: true
    })

    expect(markup).toContain('orca')
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
    expect(markup).toContain('Split right')
    expect(markup).toContain('Split down')
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

describe('Terminal GUI agent workspace flag boundary', () => {
  it('renders the terminal workspace branch when the GUI agent workspace flag is off', () => {
    const markup = renderToStaticMarkup(
      <TerminalViewSwitch
        guiAgentWorkspaceEnabled={false}
        agentWorkspace={<span>GUI agent workspace</span>}
        terminalWorkspace={<span>Terminal workspace</span>}
      />
    )

    expect(markup).toContain('Terminal workspace')
    expect(markup).not.toContain('GUI agent workspace')
  })

  it('renders the GUI branch while preserving the terminal workspace when the GUI flag is on', () => {
    const markup = renderToStaticMarkup(
      <TerminalViewSwitch
        guiAgentWorkspaceEnabled
        agentWorkspace={<span>GUI agent workspace</span>}
        terminalWorkspace={<span>Terminal workspace</span>}
      />
    )

    expect(markup).toContain('GUI agent workspace')
    expect(markup).toContain('Terminal workspace')
    expect(markup).toContain('data-terminal-view="gui-agent-workspace"')
    expect(markup).toContain('data-terminal-view="preserved-terminal-workspace"')
  })
})

describe('AgentWorkspace phase labels', () => {
  it('localizes user-action phases instead of showing raw enum text', async () => {
    await setRendererUiLanguage('es')

    expect(formatAgentWorkspacePhase('waiting-for-user')).toBe('esperando al usuario')
    expect(formatAgentWorkspacePhase('needs-approval')).toBe('necesita aprobacion')
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
              label: 'orca',
              path: '/Users/jakedom/orca',
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
              cwd: '/Users/jakedom/orca'
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

  it('localizes timeline and diff enum labels', async () => {
    await setRendererUiLanguage('es')

    const markup = renderToStaticMarkup(
      <AgentWorkspaceLayout
        snapshot={{
          activeWorktreeId: 'worktree-1',
          projects: [
            {
              id: 'worktree-1',
              label: 'orca',
              path: '/Users/jakedom/orca',
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
              cwd: '/Users/jakedom/orca'
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
    expect(markup).toContain('modificado')
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
                label: 'orca',
                path: '/Users/jakedom/orca',
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
                cwd: '/Users/jakedom/orca'
              },
              {
                id: 'thread-2',
                worktreeId: 'worktree-1',
                title: 'Second thread',
                agentKind: 'codex',
                phase: 'waiting-for-user',
                updatedAt: '2026-06-15T12:05:00.000Z',
                branchName: 'feature/second',
                cwd: '/Users/jakedom/orca'
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
          label: 'orca one',
          path: '/Users/jakedom/orca-one',
          hostKind: 'local'
        },
        {
          id: 'worktree-2',
          label: 'orca two',
          path: '/Users/jakedom/orca-two',
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
          cwd: '/Users/jakedom/orca-one'
        },
        {
          id: 'thread-2',
          worktreeId: 'worktree-2',
          title: 'Second thread',
          agentKind: 'codex',
          phase: 'running',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/second',
          cwd: '/Users/jakedom/orca-two'
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

    const diffTab = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent === 'Diff'
    )
    expect(diffTab).toBeDefined()

    await act(async () => {
      diffTab?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    })

    expect(diffTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).toContain('src/first.tsx')
    expect(container.textContent).not.toContain('src/second.tsx')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-2')} />)
    })

    const updatedDiffTab = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).find((button) => button.textContent === 'Diff')
    expect(updatedDiffTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).not.toContain('src/first.tsx')
    expect(container.textContent).toContain('src/second.tsx')
  })

  it('re-defaults to details when the active worktree changes to a thread that needs approval', async () => {
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
          label: 'orca one',
          path: '/Users/jakedom/orca-one',
          hostKind: 'local'
        },
        {
          id: 'worktree-2',
          label: 'orca two',
          path: '/Users/jakedom/orca-two',
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
          cwd: '/Users/jakedom/orca-one'
        },
        {
          id: 'thread-2',
          worktreeId: 'worktree-2',
          title: 'Needs approval thread',
          agentKind: 'codex',
          phase: 'needs-approval',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/approval',
          cwd: '/Users/jakedom/orca-two'
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

    const diffTab = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent === 'Diff'
    )
    expect(diffTab?.getAttribute('data-state')).toBe('active')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSnapshot('worktree-2')} />)
    })

    const detailsTab = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).find((button) => button.textContent === 'Details')
    expect(detailsTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).toContain('This thread needs approval before it can continue.')
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
                label: 'orca',
                path: '/Users/jakedom/orca',
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
                cwd: '/Users/jakedom/orca'
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

    const planTab = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent === 'Plan'
    )
    expect(planTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).toContain('Planned thread execution')
    expect(container.textContent).toContain('Render the plan tab')
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
                label: 'orca',
                path: '/Users/jakedom/orca',
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
                cwd: '/Users/jakedom/orca'
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

    const detailsTab = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).find((button) => button.textContent === 'Details')
    expect(detailsTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).toContain('This thread needs approval before it can continue.')
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
                label: 'orca',
                path: '/Users/jakedom/orca',
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
                cwd: '/Users/jakedom/orca'
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
