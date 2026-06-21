// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'

const storeMocks = vi.hoisted(() => ({
  state: {
    settings: { guiAgentWorkspaceEnabled: false },
    openDiff: vi.fn(),
    openFile: vi.fn(),
    setAgentWorkspaceRightPanelExpanded: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    setRightSidebarTab: vi.fn(),
    showRightSidebarFiles: vi.fn(),
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {},
    activeGroupIdByWorktree: { 'worktree-1': 'group-1' },
    groupsByWorktree: { 'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }] }
  }
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

vi.mock('@/runtime/runtime-file-client', () => ({
  readRuntimeFileContent: vi.fn(async () => ({
    content: '# Handoff\n\nFull document body.',
    isBinary: false
  }))
}))

vi.mock('@/components/tab-group/useTabGroupWorkspaceModel', () => ({
  useTabGroupWorkspaceModel: () => ({
    commands: {},
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

vi.mock('../sidebar/CommentMarkdown', () => ({
  default: ({ className, content }: { className?: string; content: string }) => (
    <article className={className}>{content}</article>
  )
}))

const snapshot: AgentWorkspaceSnapshot = {
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
      title: 'Document route',
      agentKind: 'codex',
      phase: 'completed',
      updatedAt: '2026-06-16T12:00:00.000Z',
      branchName: 'feature/document-route',
      cwd: '/Users/jakedom/janus-code'
    }
  ],
  plans: [],
  timeline: [
    {
      id: 'timeline-1',
      threadId: 'thread-1',
      kind: 'agent',
      text: 'Created docs/handoff.md for the run.',
      createdAt: '2026-06-16T12:00:00.000Z',
      status: 'done'
    }
  ],
  approvals: [],
  diffs: [],
  terminalAvailable: true
}

describe('AgentWorkspaceLayout markdown artifact routing', () => {
  let root: Root | null = null
  let container: HTMLDivElement | null = null

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
    }
    root = null
    container?.remove()
    container = null
  })

  it('opens markdown artifacts in the full right side panel instead of the floating card', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<AgentWorkspaceLayout snapshot={snapshot} />)
    })

    const openButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Open'
    )

    await act(async () => {
      openButton?.click()
    })

    expect(container.querySelector('[data-agent-markdown-side-panel="true"]')).not.toBeNull()
    expect(
      container.querySelector('[data-agent-markdown-preview="docs/handoff.md"]')
    ).not.toBeNull()
    expect(container.querySelector('.agent-workspace-right-panel-shell')).toBeNull()
  })
})
