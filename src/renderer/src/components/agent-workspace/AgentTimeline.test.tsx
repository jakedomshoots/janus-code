// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AgentTimeline } from './AgentTimeline'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Retro command session',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-18T14:00:00.000Z',
  branchName: 'codex/chat-polish',
  cwd: '/Users/jakedom/janus-code'
}

describe('AgentTimeline', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('announces timeline updates through a log region', () => {
    act(() => {
      root.render(<AgentTimeline thread={thread} timeline={[]} />)
    })

    const log = container.querySelector('[role="log"][aria-live="polite"]')
    expect(log?.getAttribute('aria-label')).toBe('Agent conversation timeline')
  })

  it('labels slash commands and marks running entries as busy', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'user',
        text: '/review',
        status: 'done',
        createdAt: '2026-06-18T14:01:00.000Z'
      },
      {
        id: 'entry-2',
        threadId: thread.id,
        kind: 'agent',
        text: 'Reviewing the current diff.',
        status: 'running',
        createdAt: '2026-06-18T14:01:02.000Z'
      }
    ]

    act(() => {
      root.render(<AgentTimeline thread={thread} timeline={timeline} />)
    })

    const commandBadge = container.querySelector('[data-agent-command-label="/review"]')
    const runningEntry = container.querySelector('[data-agent-timeline-entry-status="running"]')

    expect(commandBadge?.textContent).toContain('Command')
    expect(runningEntry?.getAttribute('aria-busy')).toBe('true')
    expect(runningEntry?.getAttribute('aria-label')).toContain('Agent')
  })
})
