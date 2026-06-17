// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'

const roots: Root[] = []
const storeMocks = vi.hoisted(() => ({
  openDiff: vi.fn(),
  openModal: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: {
      settings: { guiAgentWorkspaceEnabled: boolean }
      openDiff: typeof storeMocks.openDiff
      openModal: typeof storeMocks.openModal
    }) => unknown
  ) =>
    selector({
      settings: { guiAgentWorkspaceEnabled: false },
      openDiff: storeMocks.openDiff,
      openModal: storeMocks.openModal
    })
}))

function baseSnapshot(overrides: Partial<AgentWorkspaceSnapshot> = {}): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'worktree-1',
    projects: [
      {
        id: 'worktree-1',
        label: 'orca',
        path: '/Users/jakedom/orca',
        hostKind: 'local'
      }
    ],
    threads: [],
    plans: [],
    timeline: [],
    approvals: [],
    diffs: [],
    terminalAvailable: false,
    ...overrides
  }
}

function buttons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
}

function hasButton(container: HTMLElement, label: string): boolean {
  return buttons(container).some((button) => button.getAttribute('aria-label') === label)
}

async function renderLayout(snapshot: AgentWorkspaceSnapshot): Promise<HTMLElement> {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  roots.push(root)

  await act(async () => {
    root.render(<AgentWorkspaceLayout snapshot={snapshot} />)
  })

  return container
}

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  storeMocks.openDiff.mockClear()
  storeMocks.openModal.mockClear()
  document.body.replaceChildren()
})

describe('AgentWorkspace pane workflow', () => {
  it('splits and closes agent workspace panes from the tab strip', async () => {
    const container = await renderLayout(baseSnapshot())

    expect(container.querySelectorAll('[role="tab"]').length).toBe(1)
    expect(hasButton(container, 'Close pane')).toBe(false)

    const splitRight = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Split right'
    )

    await act(async () => {
      splitRight?.click()
    })

    expect(container.querySelectorAll('[role="tab"]').length).toBe(2)
    expect(hasButton(container, 'Close pane')).toBe(true)

    const closePane = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Close pane'
    )

    await act(async () => {
      closePane?.click()
    })

    expect(container.querySelectorAll('[role="tab"]').length).toBe(1)
    expect(hasButton(container, 'Close pane')).toBe(false)
  })

  it('shows one new-session affordance at a time in the tab strip', async () => {
    const container = await renderLayout(
      baseSnapshot({
        threads: [
          {
            id: 'thread-1',
            worktreeId: 'worktree-1',
            title: 'Running thread',
            agentKind: 'codex',
            phase: 'running',
            updatedAt: '2026-06-15T12:00:00.000Z',
            branchName: 'feature/running',
            cwd: '/Users/jakedom/orca'
          }
        ]
      })
    )

    expect(container.textContent).not.toContain('New session')
    expect(hasButton(container, 'Start new session')).toBe(true)

    const newSessionButton = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Start new session'
    )

    await act(async () => {
      newSessionButton?.click()
    })

    expect(container.textContent).toContain('New session')
    expect(hasButton(container, 'Start new session')).toBe(false)
  })
})
