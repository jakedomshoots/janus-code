// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import type { AgentWorkspaceSnapshot } from './agent-workspace-types'

const roots: Root[] = []
const terminalFocusMocks = vi.hoisted(() => ({
  focusAgentWorkspaceThreadTerminal: vi.fn()
}))
const storeMocks = vi.hoisted(() => ({
  state: {
    settings: { guiAgentWorkspaceEnabled: false },
    activeGroupIdByWorktree: { 'worktree-1': 'group-1' },
    groupsByWorktree: { 'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }] },
    closeBrowserTab: vi.fn(),
    openDiff: vi.fn(),
    openFile: vi.fn(),
    setAgentWorkspaceRightPanelExpanded: vi.fn(),
    setRightSidebarOpen: vi.fn(),
    showRightSidebarFiles: vi.fn()
  }
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

vi.mock('./agent-workspace-thread-terminal-focus', () => ({
  focusAgentWorkspaceThreadTerminal: terminalFocusMocks.focusAgentWorkspaceThreadTerminal
}))

vi.mock('./AgentWorkspacePane', () => ({
  AgentWorkspacePane: () => null
}))

vi.mock('./AgentWorkspaceRightPanel', () => ({
  AgentWorkspaceRightPanel: () => null
}))

vi.mock('./useAgentBrowserWorkbench', () => ({
  useAgentBrowserWorkbench: () => ({
    browserAvailable: false,
    openBrowserWorkbench: vi.fn()
  })
}))

vi.mock('./useAgentWorkspaceActionBridgeRegistration', () => ({
  useAgentWorkspaceActionBridgeRegistration: () => undefined
}))

vi.mock('./useAgentWorkspaceSourceControlActions', () => ({
  useAgentWorkspaceSourceControlActions: () => ({
    sourceControlBusy: false,
    sourceControlError: null,
    onStageDiff: vi.fn(),
    onUnstageDiff: vi.fn(),
    onDiscardDiff: vi.fn(),
    onCommitStaged: vi.fn()
  })
}))

vi.mock('@/components/tab-group/useTabGroupWorkspaceModel', () => ({
  useTabGroupWorkspaceModel: () => ({
    commands: {}
  })
}))

afterEach(() => {
  roots.splice(0).forEach((root) => {
    act(() => root.unmount())
  })
  terminalFocusMocks.focusAgentWorkspaceThreadTerminal.mockClear()
  document.body.replaceChildren()
})

describe('AgentWorkspaceLayout terminal drawer focus', () => {
  it('focuses the selected agent terminal before opening the terminal drawer', async () => {
    const onOpenTerminalDrawer = vi.fn()
    const threadId = makePaneKey('tab-kimi', '11111111-1111-4111-8111-111111111111')
    const container = await renderLayout(makeSnapshot(threadId), onOpenTerminalDrawer)
    const terminalButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Open terminal"]'
    )

    await act(async () => {
      terminalButton?.click()
    })

    expect(terminalFocusMocks.focusAgentWorkspaceThreadTerminal).toHaveBeenCalledWith({
      threadId,
      worktreeId: 'worktree-1'
    })
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })
})

async function renderLayout(
  snapshot: AgentWorkspaceSnapshot,
  onOpenTerminalDrawer: (reason: string | null) => void
): Promise<HTMLElement> {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  roots.push(root)

  await act(async () => {
    root.render(
      <AgentWorkspaceLayout snapshot={snapshot} onOpenTerminalDrawer={onOpenTerminalDrawer} />
    )
  })

  return container
}

function makeSnapshot(threadId: string): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'worktree-1',
    projects: [
      {
        id: 'worktree-1',
        label: 'Fam-OS',
        path: '/Users/jakedom/Documents/Fam-OS',
        hostKind: 'local'
      }
    ],
    threads: [
      {
        id: threadId,
        worktreeId: 'worktree-1',
        title: 'Tell me about this project',
        agentKind: 'kimi',
        phase: 'running',
        updatedAt: '2026-06-23T18:37:19.816Z',
        branchName: null,
        cwd: '/Users/jakedom/Documents/Fam-OS'
      }
    ],
    plans: [],
    timeline: [],
    approvals: [],
    diffs: [],
    terminalAvailable: true
  }
}
