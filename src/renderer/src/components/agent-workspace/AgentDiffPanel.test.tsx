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
})
