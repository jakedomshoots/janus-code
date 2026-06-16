// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'
import { AgentDiffPanel } from './AgentDiffPanel'

const modifiedDiff: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  area: 'unstaged',
  filePath: 'src/app.ts',
  additions: 7,
  deletions: 3,
  status: 'modified'
}

const renamedDiff: AgentWorkspaceDiffSummary = {
  id: 'diff-2',
  threadId: 'thread-1',
  area: 'staged',
  filePath: 'src/new-name.ts',
  oldPath: 'src/old-name.ts',
  additions: 1,
  deletions: 1,
  status: 'renamed'
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

function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), 'value')?.set
  valueSetter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AgentDiffPanel', () => {
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

  it('renders a source-control empty state when there are no diffs', async () => {
    await act(async () => {
      root.render(<AgentDiffPanel diffs={[]} />)
    })

    expect(container.textContent).toContain('No source-control changes yet.')
    expect(container.textContent).toContain(
      'Git changes from Orca source control will appear here.'
    )
  })

  it('selects files, toggles display modes, and opens the selected diff', async () => {
    const onOpenDiff = vi.fn()

    await act(async () => {
      root.render(<AgentDiffPanel diffs={[modifiedDiff, renamedDiff]} onOpenDiff={onOpenDiff} />)
    })

    expect(container.textContent).toContain('src/app.ts')
    expect(container.textContent).toContain('+7 -3')

    await act(async () => {
      getButton(container, 'src/new-name.ts').click()
    })
    expect(container.textContent).toContain('Renamed from src/old-name.ts')

    await act(async () => {
      getButton(container, 'Split diff').click()
    })
    expect(container.textContent).toContain('Split diff')

    await act(async () => {
      getButton(container, 'Hide whitespace changes').click()
    })
    expect(container.textContent).toContain('ignored')

    await act(async () => {
      getButton(container, 'Open in editor').click()
    })
    expect(onOpenDiff).toHaveBeenCalledWith(renamedDiff)
  })

  it('exposes stage, unstage, and discard actions for the selected diff area', async () => {
    const onStageDiff = vi.fn()
    const onUnstageDiff = vi.fn()
    const onDiscardDiff = vi.fn()

    await act(async () => {
      root.render(
        <AgentDiffPanel
          diffs={[modifiedDiff, renamedDiff]}
          onStageDiff={onStageDiff}
          onUnstageDiff={onUnstageDiff}
          onDiscardDiff={onDiscardDiff}
        />
      )
    })

    await act(async () => {
      getButton(container, 'Stage').click()
    })
    expect(onStageDiff).toHaveBeenCalledWith(modifiedDiff)

    await act(async () => {
      getButton(container, 'Discard').click()
    })
    expect(onDiscardDiff).toHaveBeenCalledWith(modifiedDiff)

    await act(async () => {
      getButton(container, 'src/new-name.ts').click()
    })

    await act(async () => {
      getButton(container, 'Unstage').click()
    })
    expect(onUnstageDiff).toHaveBeenCalledWith(renamedDiff)
  })

  it('commits staged changes only after a commit message is entered', async () => {
    const onCommitStaged = vi.fn()

    await act(async () => {
      root.render(
        <AgentDiffPanel diffs={[modifiedDiff, renamedDiff]} onCommitStaged={onCommitStaged} />
      )
    })

    const commitButton = getButton(container, 'Commit')
    expect(commitButton.disabled).toBe(true)

    const messageInput = container.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Commit message"]'
    )
    expect(messageInput).not.toBeNull()

    await act(async () => {
      if (messageInput) {
        setTextareaValue(messageInput, 'feat: add gui source control actions')
      }
    })

    expect(commitButton.disabled).toBe(false)

    await act(async () => {
      commitButton.click()
    })

    expect(onCommitStaged).toHaveBeenCalledWith('feat: add gui source control actions')
  })
})
