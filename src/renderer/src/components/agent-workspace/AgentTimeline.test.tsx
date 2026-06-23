// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentTimeline } from './AgentTimeline'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

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
    window.api = {
      ui: {
        writeClipboardText: vi.fn().mockResolvedValue(undefined)
      }
    } as never
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
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
    expect(runningEntry?.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders markdown artifact cards that open the document preview', () => {
    const onOpenMarkdownArtifact = vi.fn()
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'agent',
        text: 'Created docs/reference/handoff.md for the release.',
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      }
    ]

    act(() => {
      root.render(
        <AgentTimeline
          thread={thread}
          timeline={timeline}
          onOpenMarkdownArtifact={onOpenMarkdownArtifact}
        />
      )
    })

    const card = container.querySelector(
      '[data-agent-markdown-artifact="docs/reference/handoff.md"]'
    )
    const openButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Open'
    )

    expect(card?.textContent).toContain('handoff.md')
    expect(card?.textContent).toContain('Document · MD')

    act(() => {
      openButton?.click()
    })

    expect(onOpenMarkdownArtifact).toHaveBeenCalledWith({
      id: 'docs/reference/handoff.md',
      fileName: 'handoff.md',
      filePath: 'docs/reference/handoff.md',
      absolutePath: '/Users/jakedom/janus-code/docs/reference/handoff.md'
    })
  })

  it('renders assistant replies as structured markdown content', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'agent',
        text: [
          '## Summary',
          '',
          '- Render `markdown` inside chat replies.',
          '',
          '```ts',
          'const latencyBudgetMs = 250',
          '```',
          '',
          '[Open docs](https://example.com/docs)'
        ].join('\n'),
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      }
    ]

    act(() => {
      root.render(<AgentTimeline thread={thread} timeline={timeline} />)
    })

    const agentEntry = container.querySelector('[data-agent-timeline-entry-kind="agent"]')
    const markdown = agentEntry?.querySelector('[data-agent-message-markdown="true"]')

    expect(markdown?.querySelector('h2')?.textContent).toBe('Summary')
    expect(markdown?.querySelector('li')?.textContent).toContain(
      'Render markdown inside chat replies.'
    )
    expect(markdown?.querySelector('pre code')?.textContent).toContain('latencyBudgetMs')
    expect(markdown?.querySelector('a')?.getAttribute('href')).toBe('https://example.com/docs')
  })

  it('copies assistant code blocks through the app clipboard API', async () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'agent',
        text: ['```ts', 'const latencyBudgetMs = 250', '```'].join('\n'),
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      }
    ]

    act(() => {
      root.render(<AgentTimeline thread={thread} timeline={timeline} />)
    })

    const copyButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.getAttribute('aria-label') === 'Copy code block'
    )
    const languageLabel = container.querySelector('[data-agent-code-language="ts"]')
    expect(copyButton).toBeDefined()
    expect(languageLabel?.textContent).toBe('TypeScript')

    await act(async () => {
      copyButton?.click()
    })

    expect(window.api.ui.writeClipboardText).toHaveBeenCalledWith('const latencyBudgetMs = 250')
    expect(copyButton?.textContent).toContain('Copied')
  })

  it('renders an edited files card with review routing', () => {
    const onReviewDiffs = vi.fn()
    const diffs: AgentWorkspaceDiffSummary[] = [
      diff({ id: 'diff-1', filePath: 'docs/handoff.md', additions: 12, deletions: 2 }),
      diff({ id: 'diff-2', filePath: 'src/app.ts', additions: 5, deletions: 0 }),
      diff({ id: 'diff-3', filePath: 'src/app.test.ts', additions: 9, deletions: 1 }),
      diff({ id: 'diff-4', filePath: 'README.md', additions: 2, deletions: 4 })
    ]

    act(() => {
      root.render(
        <AgentTimeline thread={thread} timeline={[]} diffs={diffs} onReviewDiffs={onReviewDiffs} />
      )
    })

    const card = container.querySelector('[data-agent-edited-files-card="true"]')
    const reviewButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Review'
    )

    expect(card?.textContent).toContain('Edited 4 files')
    expect(card?.textContent).toContain('+28 -7')
    expect(card?.textContent).toContain('docs/handoff.md')
    expect(card?.textContent).toContain('src/app.ts')
    expect(card?.textContent).toContain('src/app.test.ts')
    expect(card?.textContent).toContain('Show 1 more file')

    act(() => {
      reviewButton?.click()
    })

    expect(onReviewDiffs).toHaveBeenCalledTimes(1)
  })

  it('keeps edited files attached to the agent message that mentioned those files', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'user',
        text: 'Create the handoff doc.',
        status: 'done',
        createdAt: '2026-06-18T14:01:00.000Z'
      },
      {
        id: 'entry-2',
        threadId: thread.id,
        kind: 'agent',
        text: 'Created docs/handoff.md for the release.',
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      },
      {
        id: 'entry-3',
        threadId: thread.id,
        kind: 'user',
        text: 'Thanks. Confirm follow-up chat works.',
        status: 'done',
        createdAt: '2026-06-18T14:03:00.000Z'
      },
      {
        id: 'entry-4',
        threadId: thread.id,
        kind: 'agent',
        text: 'Follow-up chat works.',
        status: 'done',
        createdAt: '2026-06-18T14:04:00.000Z'
      }
    ]

    act(() => {
      root.render(
        <AgentTimeline
          thread={thread}
          timeline={timeline}
          diffs={[diff({ id: 'diff-1', filePath: 'docs/handoff.md', additions: 12 })]}
        />
      )
    })

    const text = container.textContent ?? ''

    expect(container.querySelectorAll('[data-agent-edited-files-card="true"]')).toHaveLength(1)
    expect(text.indexOf('Edited 1 file')).toBeGreaterThan(text.indexOf('Created docs/handoff.md'))
    expect(text.indexOf('Edited 1 file')).toBeLessThan(
      text.indexOf('Thanks. Confirm follow-up chat works.')
    )
  })

  it('does not show an edited files card when an agent reply does not mention changed files', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'user',
        text: 'Say hello.',
        status: 'done',
        createdAt: '2026-06-18T14:01:00.000Z'
      },
      {
        id: 'entry-2',
        threadId: thread.id,
        kind: 'agent',
        text: 'Hello.',
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      }
    ]

    act(() => {
      root.render(
        <AgentTimeline
          thread={thread}
          timeline={timeline}
          diffs={[diff({ id: 'diff-1', filePath: 'src/unrelated.ts', additions: 4 })]}
        />
      )
    })

    expect(container.querySelector('[data-agent-edited-files-card="true"]')).toBeNull()
  })

  it('shows only changed files mentioned by the owning agent reply', () => {
    const timeline: AgentWorkspaceTimelineEntry[] = [
      {
        id: 'entry-1',
        threadId: thread.id,
        kind: 'agent',
        text: 'Created docs/handoff.md for the release.',
        status: 'done',
        createdAt: '2026-06-18T14:02:00.000Z'
      }
    ]

    act(() => {
      root.render(
        <AgentTimeline
          thread={thread}
          timeline={timeline}
          diffs={[
            diff({ id: 'diff-1', filePath: 'docs/handoff.md', additions: 12 }),
            diff({ id: 'diff-2', filePath: 'src/unrelated.ts', additions: 99 })
          ]}
        />
      )
    })

    const card = container.querySelector('[data-agent-edited-files-card="true"]')

    expect(card?.textContent).toContain('Edited 1 file')
    expect(card?.textContent).toContain('docs/handoff.md')
    expect(card?.textContent).not.toContain('src/unrelated.ts')
  })
})

function diff(overrides: Partial<AgentWorkspaceDiffSummary>): AgentWorkspaceDiffSummary {
  return {
    id: 'diff',
    threadId: thread.id,
    filePath: 'file.ts',
    additions: 0,
    deletions: 0,
    status: 'modified',
    ...overrides
  }
}
