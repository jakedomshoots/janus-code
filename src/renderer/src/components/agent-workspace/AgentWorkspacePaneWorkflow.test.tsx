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
  const activateTab = vi.fn()
  const markdownEditorTab = {
    id: 'editor-handoff-tab',
    worktreeId: 'worktree-1',
    groupId: 'group-1',
    entityId: '/Users/jakedom/janus-code/docs/reference/handoff.md',
    label: 'handoff.md',
    contentType: 'editor',
    createdAt: 1,
    updatedAt: 1
  }
  const state = {
    browserDefaultUrl: 'data:text/html,',
    settings: { guiAgentWorkspaceEnabled: false, defaultTuiAgent: 'grok', disabledTuiAgents: [] },
    repos: [],
    worktreesByRepo: {},
    openDiff: vi.fn(),
    openFile: vi.fn(),
    openModal: vi.fn(),
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {},
    unifiedTabsByWorktree: { 'worktree-1': [markdownEditorTab] },
    remoteBrowserPageHandlesByPageId: {},
    activeGroupIdByWorktree: { 'worktree-1': 'group-1' },
    groupsByWorktree: { 'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }] },
    createBrowserTab,
    focusBrowserTabInWorktree,
    ensureWorktreeRootGroup,
    createUnifiedTab,
    activateTab,
    closeBrowserTab,
    setAgentWorkspaceRightPanelExpanded: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    setRightSidebarTab: vi.fn(),
    showRightSidebarFiles: vi.fn()
  }

  return {
    state,
    openDiff: state.openDiff,
    openFile: state.openFile,
    openModal: state.openModal,
    createBrowserTab,
    focusBrowserTabInWorktree,
    setRightSidebarOpen: state.setRightSidebarOpen,
    setRightSidebarTab: state.setRightSidebarTab,
    markdownEditorTab
  }
})
const launchMocks = vi.hoisted(() => ({
  launchAgentInNewTab: vi.fn(() => ({
    tabId: 'tab-agent',
    startupPlan: {
      agent: 'codex',
      launchCommand: 'codex',
      expectedProcess: 'codex',
      followupPrompt: null
    },
    pasteDraftAfterLaunch: false
  }))
}))
const sendMocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn()
}))
const fsMocks = vi.hoisted(() => ({
  readFile: vi.fn()
}))
const tabGroupMocks = vi.hoisted(() => ({
  newFileTab: vi.fn(async () => undefined),
  newSimulatorTab: vi.fn(),
  openEntry: vi.fn(async () => undefined),
  activateEditor: vi.fn(),
  activateBrowser: vi.fn(),
  closeItem: vi.fn(),
  duplicateBrowserTab: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: launchMocks.launchAgentInNewTab
}))

vi.mock('@/lib/active-agent-note-send', () => ({
  sendNotesToActiveAgentSession: sendMocks.sendNotesToActiveAgentSession,
  activeAgentNotesSendFailureMessage: (status: string) => `Legacy send failure: ${status}`
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
      newFileTab: tabGroupMocks.newFileTab,
      newSimulatorTab: tabGroupMocks.newSimulatorTab,
      openEntry: tabGroupMocks.openEntry,
      activateEditor: tabGroupMocks.activateEditor,
      activateBrowser: tabGroupMocks.activateBrowser,
      closeItem: tabGroupMocks.closeItem,
      duplicateBrowserTab: tabGroupMocks.duplicateBrowserTab
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

function setTextControlValue(control: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
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
  storeMocks.openFile.mockClear()
  storeMocks.openModal.mockClear()
  storeMocks.state.activateTab.mockClear()
  storeMocks.setRightSidebarOpen.mockClear()
  storeMocks.setRightSidebarTab.mockClear()
  storeMocks.createBrowserTab.mockClear()
  storeMocks.focusBrowserTabInWorktree.mockClear()
  tabGroupMocks.newFileTab.mockClear()
  tabGroupMocks.newSimulatorTab.mockClear()
  tabGroupMocks.openEntry.mockClear()
  tabGroupMocks.activateEditor.mockClear()
  tabGroupMocks.activateBrowser.mockClear()
  tabGroupMocks.closeItem.mockClear()
  tabGroupMocks.duplicateBrowserTab.mockClear()
  launchMocks.launchAgentInNewTab.mockClear()
  sendMocks.sendNotesToActiveAgentSession.mockReset()
  fsMocks.readFile.mockReset()
  storeMocks.state.browserTabsByWorktree = {}
  storeMocks.state.browserAnnotationsByPageId = {}
  storeMocks.state.activeBrowserTabIdByWorktree = {}
  storeMocks.state.unifiedTabsByWorktree = { 'worktree-1': [storeMocks.markdownEditorTab] }
  document.body.replaceChildren()
})

describe('AgentWorkspace pane workflow', () => {
  it('selects the first real thread after a draft composer launch creates one', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)

    await act(async () => {
      root.render(<AgentWorkspaceLayout snapshot={baseSnapshot()} />)
    })

    expect(container.querySelector('textarea')?.placeholder).toBe('Start a new agent session')

    await act(async () => {
      root.render(
        <AgentWorkspaceLayout
          snapshot={baseSnapshot({
            threads: [
              {
                id: 'thread-1',
                worktreeId: 'worktree-1',
                title: 'Plan an app idea',
                agentKind: 'grok',
                phase: 'running',
                updatedAt: '2026-06-18T17:20:00.000Z',
                branchName: null,
                cwd: '/Users/jakedom/janus-code'
              }
            ],
            timeline: [
              {
                id: 'timeline-1',
                threadId: 'thread-1',
                kind: 'user',
                text: 'Plan an app idea',
                createdAt: '2026-06-18T17:20:00.000Z',
                status: 'done'
              }
            ],
            terminalAvailable: true
          })}
        />
      )
    })

    expect(container.textContent).toContain('Plan an app idea')
    expect(container.querySelector('textarea')?.placeholder).toBe('Message the selected agent...')
  })

  it('keeps completed threads selected when sending follow-up messages', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    const completedThread = {
      id: 'thread-completed',
      worktreeId: 'worktree-1',
      title: 'Janus Ideas',
      agentKind: 'codex' as const,
      phase: 'completed' as const,
      updatedAt: '2026-06-18T17:20:00.000Z',
      branchName: null,
      cwd: '/Users/jakedom/janus-code'
    }
    sendMocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    })

    await act(async () => {
      root.render(
        <AgentWorkspaceLayout
          snapshot={baseSnapshot({
            threads: [completedThread],
            timeline: [
              {
                id: 'timeline-old',
                threadId: completedThread.id,
                kind: 'agent',
                text: 'Old completed output',
                createdAt: '2026-06-18T17:21:00.000Z',
                status: 'done'
              }
            ]
          })}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(container.textContent).toContain('Old completed output')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'hello')
    })
    await act(async () => {
      button?.click()
    })

    expect(launchMocks.launchAgentInNewTab).not.toHaveBeenCalled()
    expect(sendMocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'hello'
    })

    expect(container.textContent).toContain('hello')
    expect(container.textContent).toContain('Old completed output')
    expect(container.querySelector('textarea')?.placeholder).toBe(
      'Ask a follow-up in this thread...'
    )
  })

  it('keeps waiting-thread chat history visible when sending an answer', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    const waitingThread = {
      id: 'thread-waiting',
      worktreeId: 'worktree-1',
      title: 'Janus Ideas',
      agentKind: 'codex' as const,
      phase: 'waiting-for-user' as const,
      updatedAt: '2026-06-18T17:20:00.000Z',
      branchName: null,
      cwd: '/Users/jakedom/janus-code'
    }
    sendMocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    })

    await act(async () => {
      root.render(
        <AgentWorkspaceLayout
          snapshot={baseSnapshot({
            threads: [waitingThread],
            timeline: [
              {
                id: 'timeline-question',
                threadId: waitingThread.id,
                kind: 'agent',
                text: 'Can you clarify the target platform?',
                createdAt: '2026-06-18T17:21:00.000Z',
                status: 'done'
              }
            ]
          })}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(container.textContent).toContain('Can you clarify the target platform?')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Use macOS first.')
    })
    await act(async () => {
      button?.click()
    })

    expect(sendMocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Use macOS first.'
    })
    expect(container.textContent).toContain('Can you clarify the target platform?')
    expect(container.textContent).toContain('Use macOS first.')
    expect(container.querySelector('textarea')?.placeholder).toBe('Message the selected agent...')
  })

  it('opens markdown artifact cards and routes edited files to the changes panel', async () => {
    window.api = {
      fs: {
        readFile: fsMocks.readFile
      }
    } as unknown as typeof window.api
    fsMocks.readFile.mockResolvedValue({
      content: '# Release Handoff\n\n- Ship the polished chat surface.',
      isBinary: false
    })
    const thread = {
      id: 'thread-artifacts',
      worktreeId: 'worktree-1',
      title: 'Release handoff',
      agentKind: 'codex' as const,
      phase: 'completed' as const,
      updatedAt: '2026-06-18T17:20:00.000Z',
      branchName: null,
      cwd: '/Users/jakedom/janus-code'
    }
    const onOpenTerminalDrawer = vi.fn()
    const container = await renderLayout(
      baseSnapshot({
        threads: [thread],
        timeline: [
          {
            id: 'timeline-artifact',
            threadId: thread.id,
            kind: 'agent',
            text: 'Created docs/reference/handoff.md for review.',
            createdAt: '2026-06-18T17:21:00.000Z',
            status: 'done'
          }
        ],
        diffs: [
          {
            id: 'diff-1',
            threadId: thread.id,
            filePath: 'docs/reference/handoff.md',
            additions: 12,
            deletions: 2,
            status: 'modified'
          },
          {
            id: 'diff-2',
            threadId: thread.id,
            filePath: 'src/app.ts',
            additions: 5,
            deletions: 0,
            status: 'modified'
          }
        ]
      }),
      { onOpenTerminalDrawer }
    )

    const openButton = buttons(container).find((button) => button.textContent === 'Open')

    await act(async () => {
      openButton?.click()
    })

    expect(storeMocks.openDiff).not.toHaveBeenCalled()
    expect(storeMocks.openFile).not.toHaveBeenCalled()
    expect(fsMocks.readFile).toHaveBeenCalledWith({
      filePath: '/Users/jakedom/janus-code/docs/reference/handoff.md',
      connectionId: undefined
    })
    expect(container.textContent).toContain('Document')
    expect(container.textContent).toContain('Release Handoff')
    expect(container.textContent).toContain('Ship the polished chat surface.')

    await act(async () => {
      buttons(container)
        .find((button) => button.textContent === 'Open in editor')
        ?.click()
      await Promise.resolve()
    })

    expect(storeMocks.openFile).toHaveBeenCalledWith(
      {
        filePath: '/Users/jakedom/janus-code/docs/reference/handoff.md',
        relativePath: 'docs/reference/handoff.md',
        worktreeId: 'worktree-1',
        language: 'markdown',
        mode: 'edit'
      },
      { preview: false }
    )
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('workbench')
    expect(storeMocks.state.activateTab).toHaveBeenCalledWith('editor-handoff-tab')

    await act(async () => {
      buttons(container)
        .find((button) => button.textContent === 'Review')
        ?.click()
    })

    expect(storeMocks.setRightSidebarTab).toHaveBeenCalledWith('source-control')
    expect(storeMocks.setRightSidebarOpen).toHaveBeenCalledWith(true)
  })

  it('creates a workbench file tab before opening an empty workbench surface', async () => {
    const onOpenTerminalDrawer = vi.fn()
    const container = await renderLayout(
      baseSnapshot({
        threads: [
          {
            id: 'thread-1',
            worktreeId: 'worktree-1',
            title: 'Polish the workspace',
            agentKind: 'codex',
            phase: 'running',
            updatedAt: '2026-06-18T17:20:00.000Z',
            branchName: null,
            cwd: '/Users/jakedom/janus-code'
          }
        ]
      }),
      { onOpenTerminalDrawer }
    )

    await act(async () => {
      buttons(container)
        .find((button) => button.getAttribute('aria-label') === 'Open workbench')
        ?.click()
      await Promise.resolve()
    })

    expect(tabGroupMocks.newFileTab).toHaveBeenCalledTimes(1)
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('workbench')
  })

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
