// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { AgentWorkspaceSidebar } from './AgentWorkspaceSidebar'

const projects: readonly AgentWorkspaceProject[] = [
  {
    id: 'worktree-1',
    label: 'orca',
    path: '/Users/jakedom/orca',
    hostKind: 'local',
    branchName: 'project-rail-branch'
  },
  {
    id: 'worktree-2',
    label: 'remote runtime',
    path: '/srv/orca',
    hostKind: 'ssh'
  }
]

const threads: readonly AgentWorkspaceThread[] = [
  {
    id: 'thread-1',
    worktreeId: 'worktree-1',
    title: 'Implement GUI workspace shell',
    agentKind: 'codex',
    phase: 'running',
    updatedAt: '2026-06-15T12:00:00.000Z',
    branchName: 'feature/t3code-gui-workspace',
    cwd: '/Users/jakedom/orca'
  },
  {
    id: 'thread-2',
    worktreeId: 'worktree-1',
    title: 'Review sidebar density',
    agentKind: 'codex',
    phase: 'waiting-for-user',
    updatedAt: '2026-06-15T12:05:00.000Z',
    branchName: 'feature/t3code-gui-workspace',
    cwd: '/Users/jakedom/orca'
  }
]

const roots: Root[] = []

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  document.body.replaceChildren()
})

function renderSidebar(
  props: Partial<React.ComponentProps<typeof AgentWorkspaceSidebar>> = {}
): React.JSX.Element {
  return (
    <AgentWorkspaceSidebar
      projects={projects}
      threads={threads}
      selectedProjectId="worktree-1"
      selectedThreadId="thread-1"
      activeWorktreeId="worktree-1"
      onSelectProject={() => undefined}
      onSelectThread={() => undefined}
      {...props}
    />
  )
}

describe('AgentWorkspaceSidebar', () => {
  it('renders an empty thread list for a project without threads', () => {
    const markup = renderToStaticMarkup(
      renderSidebar({
        selectedProjectId: 'worktree-2',
        selectedThreadId: null
      })
    )

    expect(markup).toContain('remote runtime')
    expect(markup).toContain('No threads')
  })

  it('labels the active worktree in the project rail', () => {
    const markup = renderToStaticMarkup(renderSidebar())

    expect(markup).toContain('orca')
    expect(markup).toContain('Active worktree')
  })

  it('renders project branch status when Orca has branch metadata', () => {
    const markup = renderToStaticMarkup(renderSidebar())

    expect(markup).toContain('project-rail-branch')
  })

  it('calls the selected thread callback with the project and thread ids', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    const onSelectThread = vi.fn()

    await act(async () => {
      root.render(renderSidebar({ onSelectThread }))
    })

    const secondThreadButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Review sidebar density')
    )
    expect(secondThreadButton).toBeDefined()
    expect(secondThreadButton?.getAttribute('aria-pressed')).toBeNull()
    expect(secondThreadButton?.getAttribute('aria-selected')).toBe('false')

    await act(async () => {
      secondThreadButton?.click()
    })

    expect(onSelectThread).toHaveBeenCalledWith('worktree-1', 'thread-2')
  })

  it('renders thread status badges with localized phase text', () => {
    const markup = renderToStaticMarkup(renderSidebar())

    expect(markup).toContain('data-agent-thread-status="running"')
    expect(markup).toContain('running')
    expect(markup).toContain('data-agent-thread-status="waiting-for-user"')
    expect(markup).toContain('waiting for user')
  })
})
