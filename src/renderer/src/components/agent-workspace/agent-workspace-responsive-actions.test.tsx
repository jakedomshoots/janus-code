// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { ThreadTab } from './AgentWorkspaceThreadTabPills'
import { PanelTabs } from './agent-workspace-right-panel-sections'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'

const roots: Root[] = []

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'Fam-OS',
  path: '/Users/jakedom/Documents/Fam-OS',
  hostKind: 'local'
}

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Tell me about this project',
  agentKind: 'codex',
  phase: 'completed',
  updatedAt: '2026-06-23T20:19:10.044Z',
  branchName: null,
  cwd: '/Users/jakedom/Documents/Fam-OS'
}

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  document.body.replaceChildren()
})

describe('agent workspace responsive actions', () => {
  it('selects workspace tabs on pointer down without double-running the click', async () => {
    const onSelect = vi.fn()
    const container = await render(
      <ThreadTab thread={thread} selected={false} onSelect={onSelect} onClose={() => undefined} />
    )
    const tabButton = getButtonByTitle(container, thread.title)

    await act(async () => {
      dispatchPrimaryPointerDown(tabButton)
    })

    expect(onSelect).toHaveBeenCalledTimes(1)

    await act(async () => {
      tabButton.click()
    })

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('keeps keyboard click activation for workspace tabs', async () => {
    const onSelect = vi.fn()
    const container = await render(
      <ThreadTab thread={thread} selected={false} onSelect={onSelect} onClose={() => undefined} />
    )
    const tabButton = getButtonByTitle(container, thread.title)

    await act(async () => {
      tabButton.click()
    })

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('switches right-panel tabs on pointer down without double-running the click', async () => {
    const onSelectedTabChange = vi.fn()
    const container = await render(
      <PanelTabs
        selectedTab="info"
        diffs={1}
        hasPlan={true}
        hasReview={true}
        onSelectedTabChange={onSelectedTabChange}
      />
    )
    const diffTab = getButtonByTitle(container, 'Diff')

    await act(async () => {
      dispatchPrimaryPointerDown(diffTab)
    })

    expect(onSelectedTabChange).toHaveBeenCalledWith('diff')
    expect(onSelectedTabChange).toHaveBeenCalledTimes(1)

    await act(async () => {
      diffTab.click()
    })

    expect(onSelectedTabChange).toHaveBeenCalledTimes(1)
  })

  it('runs header workspace commands on pointer down without double-running the click', async () => {
    const onOpenBrowserWorkbench = vi.fn()
    const container = await render(
      <AgentWorkspaceHeader
        project={project}
        thread={thread}
        browserAvailable={true}
        onOpenBrowserWorkbench={onOpenBrowserWorkbench}
      />
    )
    const browserButton = getButtonByTitle(container, 'Open browser')

    await act(async () => {
      dispatchPrimaryPointerDown(browserButton)
    })

    expect(onOpenBrowserWorkbench).toHaveBeenCalledTimes(1)

    await act(async () => {
      browserButton.click()
    })

    expect(onOpenBrowserWorkbench).toHaveBeenCalledTimes(1)
  })
})

async function render(element: React.ReactElement): Promise<HTMLElement> {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  roots.push(root)

  await act(async () => {
    root.render(element)
  })

  return container
}

function getButtonByTitle(container: HTMLElement, title: string): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(`button[title="${title}"]`)
  if (!button) {
    throw new Error(`Expected button with title "${title}"`)
  }
  return button
}

function dispatchPrimaryPointerDown(target: HTMLElement): void {
  const event = new Event('pointerdown', { bubbles: true, cancelable: true }) as PointerEvent
  Object.defineProperty(event, 'button', { value: 0 })
  Object.defineProperty(event, 'pointerType', { value: 'mouse' })
  target.dispatchEvent(event)
}
