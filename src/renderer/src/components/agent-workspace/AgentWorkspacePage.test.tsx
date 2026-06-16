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
  timeline: [],
  diffs: [],
  terminalAvailable: false
}

let currentSnapshot: AgentWorkspaceSnapshot = emptySnapshot
const roots: Root[] = []

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: {
      agentWorkspaceTestSnapshot: AgentWorkspaceSnapshot
      settings: { guiAgentWorkspaceEnabled: boolean }
    }) => unknown
  ) =>
    selector({
      agentWorkspaceTestSnapshot: currentSnapshot,
      settings: { guiAgentWorkspaceEnabled: false }
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

  it('renders the GUI branch when the GUI agent workspace flag is on', () => {
    const markup = renderToStaticMarkup(
      <TerminalViewSwitch
        guiAgentWorkspaceEnabled
        agentWorkspace={<span>GUI agent workspace</span>}
        terminalWorkspace={<span>Terminal workspace</span>}
      />
    )

    expect(markup).toContain('GUI agent workspace')
    expect(markup).not.toContain('Terminal workspace')
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
          timeline: [],
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

describe('AgentWorkspaceLayout thread selection', () => {
  function makeSelectionSnapshot(activeWorktreeId: string): AgentWorkspaceSnapshot {
    return {
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
          phase: 'waiting-for-user',
          updatedAt: '2026-06-15T12:05:00.000Z',
          branchName: 'feature/second',
          cwd: '/Users/jakedom/orca-two'
        }
      ],
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
      diffs: [],
      terminalAvailable: false
    }
  }

  it('lets users select another thread from the left rail', async () => {
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
            diffs: [],
            terminalAvailable: false
          }}
        />
      )
    })

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')

    const secondThreadButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Second thread')
    )
    expect(secondThreadButton).toBeDefined()

    await act(async () => {
      secondThreadButton?.click()
    })

    expect(container.textContent).toContain('Second timeline event')
  })

  it('follows active worktree changes when the snapshot changes', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSelectionSnapshot('worktree-1')} />)
    })

    expect(container.textContent).toContain('First timeline event')
    expect(container.textContent).not.toContain('Second timeline event')

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={makeSelectionSnapshot('worktree-2')} />)
    })

    expect(container.textContent).toContain('Second timeline event')
  })

  it('preserves right-panel tab state while selected thread data changes', async () => {
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
                phase: 'running',
                updatedAt: '2026-06-15T12:05:00.000Z',
                branchName: 'feature/second',
                cwd: '/Users/jakedom/orca'
              }
            ],
            timeline: [],
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
          }}
        />
      )
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

    const secondThreadButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Second thread')
    )
    expect(secondThreadButton).toBeDefined()

    await act(async () => {
      secondThreadButton?.click()
    })

    expect(diffTab?.getAttribute('data-state')).toBe('active')
    expect(container.textContent).not.toContain('src/first.tsx')
    expect(container.textContent).toContain('src/second.tsx')
  })

  it('re-defaults to details when selecting a thread that needs approval', async () => {
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
                title: 'Needs approval thread',
                agentKind: 'codex',
                phase: 'needs-approval',
                updatedAt: '2026-06-15T12:05:00.000Z',
                branchName: 'feature/approval',
                cwd: '/Users/jakedom/orca'
              }
            ],
            timeline: [],
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
          }}
        />
      )
    })

    const diffTab = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
      (button) => button.textContent === 'Diff'
    )
    expect(diffTab?.getAttribute('data-state')).toBe('active')

    const approvalThreadButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Needs approval thread')
    )
    expect(approvalThreadButton).toBeDefined()

    await act(async () => {
      approvalThreadButton?.click()
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
                cwd: '/Users/jakedom/orca',
                hasStructuredPlan: true
              }
            ],
            timeline: [],
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
    expect(container.textContent).toContain('codex is running on Planned thread.')
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
            timeline: [],
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
})
