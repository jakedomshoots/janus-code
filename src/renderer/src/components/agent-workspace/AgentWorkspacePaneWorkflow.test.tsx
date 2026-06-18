// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'

const roots: Root[] = []
const storeMocks = vi.hoisted(() => {
  const createBrowserTab = vi.fn(() => ({
    id: 'browser-tab-1',
    worktreeId: 'worktree-1',
    activePageId: 'browser-page-1',
    pageIds: ['browser-page-1'],
    url: 'data:text/html,',
    title: 'New Browser Tab',
    loading: false,
    faviconUrl: null,
    canGoBack: false,
    canGoForward: false,
    loadError: null,
    createdAt: 1
  }))
  const focusBrowserTabInWorktree = vi.fn()
  const ensureWorktreeRootGroup = vi.fn()
  const createUnifiedTab = vi.fn()
  const closeBrowserTab = vi.fn()
  const state = {
    browserDefaultUrl: 'data:text/html,',
    settings: { guiAgentWorkspaceEnabled: false, defaultTuiAgent: 'grok', disabledTuiAgents: [] },
    repos: [],
    worktreesByRepo: {},
    openDiff: vi.fn(),
    openModal: vi.fn(),
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {},
    unifiedTabsByWorktree: {},
    remoteBrowserPageHandlesByPageId: {},
    activeGroupIdByWorktree: { 'worktree-1': 'group-1' },
    groupsByWorktree: { 'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }] },
    createBrowserTab,
    focusBrowserTabInWorktree,
    ensureWorktreeRootGroup,
    createUnifiedTab,
    closeBrowserTab,
    setAgentWorkspaceRightPanelExpanded: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    showRightSidebarFiles: vi.fn()
  }

  return {
    state,
    openDiff: state.openDiff,
    openModal: state.openModal,
    createBrowserTab,
    focusBrowserTabInWorktree
  }
})

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

vi.mock('@/hooks/useDetectedAgents', () => ({
  useDetectedAgents: () => ({
    detectedIds: ['grok', 'codex', 'claude'],
    isLoading: false,
    isRefreshing: false,
    refresh: vi.fn()
  })
}))

vi.mock('@/components/tab-group/useTabGroupWorkspaceModel', () => ({
  useTabGroupWorkspaceModel: () => ({
    group: { tabOrder: [] },
    groupTabs: [],
    browserItems: [],
    activeTab: null,
    commands: {
      newTerminalTab: vi.fn(),
      newTerminalWithShell: vi.fn(),
      newBrowserTab: vi.fn(),
      newFileTab: vi.fn(),
      newSimulatorTab: undefined,
      openEntry: vi.fn(),
      activateEditor: vi.fn(),
      activateBrowser: vi.fn(),
      closeItem: vi.fn(),
      duplicateBrowserTab: vi.fn()
    }
  })
}))

vi.mock('@/components/tab-bar/TabBarNewTabMenu', () => ({
  TabBarNewTabMenu: ({
    onLaunchAgent
  }: {
    onLaunchAgent?: (agent: 'codex' | 'claude') => void
  }) => (
    <div>
      <button type="button" aria-label="New tab">
        New tab
      </button>
      <button
        type="button"
        aria-label="Launch Codex draft"
        onClick={() => onLaunchAgent?.('codex')}
      >
        Launch Codex draft
      </button>
      <button
        type="button"
        aria-label="Launch Claude draft"
        onClick={() => onLaunchAgent?.('claude')}
      >
        Launch Claude draft
      </button>
    </div>
  )
}))

vi.mock('./useAgentWorkspaceBrowserTabStrip', () => ({
  useAgentWorkspaceBrowserTabStrip: () => ({
    browserTabs: [],
    activeBrowserTabId: null,
    selectBrowserTab: vi.fn(),
    createBrowserTab: vi.fn(),
    closeBrowserTab: vi.fn()
  })
}))

vi.mock('@/components/tab-group/TabGroupPaneActionChrome', () => ({
  TabGroupPaneActionChrome: ({
    onSplit,
    onCloseGroup,
    hasSplitGroups
  }: {
    onSplit: (direction: 'right' | 'down' | 'left' | 'up') => void
    onCloseGroup?: () => void
    hasSplitGroups?: boolean
  }) => (
    <div data-testid="pane-action-chrome">
      <button type="button" aria-label="Pane Actions">
        Pane Actions
      </button>
      <button type="button" onClick={() => onSplit('right')}>
        Split Right
      </button>
      {hasSplitGroups ? (
        <button type="button" onClick={() => onCloseGroup?.()}>
          Close Group
        </button>
      ) : null}
    </div>
  )
}))

function baseSnapshot(overrides: Partial<AgentWorkspaceSnapshot> = {}): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'worktree-1',
    projects: [
      {
        id: 'worktree-1',
        label: 'janus-code',
        path: '/Users/jakedom/janus-code',
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

async function clickPaneAction(label: string, container: HTMLElement): Promise<void> {
  const action = buttons(container).find((button) => button.textContent?.includes(label))

  await act(async () => {
    action?.click()
  })
}

async function renderLayout(
  snapshot: AgentWorkspaceSnapshot,
  options: {
    onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  } = {}
): Promise<HTMLElement> {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  roots.push(root)

  await act(async () => {
    root.render(
      <AgentWorkspaceLayout
        snapshot={snapshot}
        onOpenTerminalDrawer={options.onOpenTerminalDrawer}
      />
    )
  })

  return container
}

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  storeMocks.openDiff.mockClear()
  storeMocks.openModal.mockClear()
  storeMocks.createBrowserTab.mockClear()
  storeMocks.focusBrowserTabInWorktree.mockClear()
  storeMocks.state.browserTabsByWorktree = {}
  storeMocks.state.browserAnnotationsByPageId = {}
  storeMocks.state.activeBrowserTabIdByWorktree = {}
  document.body.replaceChildren()
})

describe('AgentWorkspace pane workflow', () => {
  it('splits and closes agent workspace panes from the tab strip', async () => {
    const container = await renderLayout(baseSnapshot())

    expect(container.querySelectorAll('[role="tab"]').length).toBe(1)
    expect(hasButton(container, 'Pane Actions')).toBe(true)

    await clickPaneAction('Split Right', container)

    expect(container.querySelectorAll('[role="tab"]').length).toBe(2)

    await clickPaneAction('Close Group', container)

    expect(container.querySelectorAll('[role="tab"]').length).toBe(1)
  })

  it('starts a draft session from the command bar without a duplicate tab-strip control', async () => {
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
            cwd: '/Users/jakedom/janus-code'
          }
        ]
      })
    )

    expect(hasButton(container, 'New session')).toBe(true)
    expect(hasButton(container, 'Start new session')).toBe(false)

    const newSessionButton = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'New session'
    )

    await act(async () => {
      newSessionButton?.click()
    })

    expect(container.textContent).toContain('New session')
    expect(hasButton(container, 'Start new session')).toBe(false)
  })

  it('creates a new draft session tab when launching an agent from the new-tab menu', async () => {
    const container = await renderLayout(baseSnapshot())

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Grok')

    const launchCodexDraft = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Launch Codex draft'
    )
    const launchClaudeDraft = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Launch Claude draft'
    )

    await act(async () => {
      launchCodexDraft?.click()
    })

    expect(container.querySelectorAll('[role="tab"]').length).toBe(2)
    expect(container.textContent).toContain('Grok')
    expect(container.textContent).toContain('Codex')

    await act(async () => {
      launchClaudeDraft?.click()
    })

    expect(container.querySelectorAll('[role="tab"]').length).toBe(3)
    expect(container.textContent).toContain('Claude')
  })

  it('opens the Janus Code browser workbench from the composer', async () => {
    const onOpenTerminalDrawer = vi.fn()
    const container = await renderLayout(baseSnapshot(), { onOpenTerminalDrawer })
    const browserButton = buttons(container).find(
      (button) => button.getAttribute('aria-label') === 'Open browser workbench'
    )

    await act(async () => {
      browserButton?.click()
      await Promise.resolve()
    })

    expect(storeMocks.createBrowserTab).toHaveBeenCalledWith(
      'worktree-1',
      'data:text/html,',
      expect.objectContaining({
        activate: true,
        focusAddressBar: true,
        title: 'New Browser Tab',
        targetGroupId: 'group-1'
      })
    )
    expect(storeMocks.focusBrowserTabInWorktree).toHaveBeenCalledWith(
      'worktree-1',
      'browser-page-1',
      { surfacePane: true }
    )
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })
})
