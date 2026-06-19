// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
  discoverCommitMessageModels: vi.fn(),
  createBrowserTab: vi.fn(),
  focusBrowserTabInWorktree: vi.fn(),
  browserState: {
    browserTabsByWorktree: {},
    browserAnnotationsByPageId: {},
    activeBrowserTabIdByWorktree: {}
  } as {
    browserTabsByWorktree: Record<string, unknown[]>
    browserAnnotationsByPageId: Record<string, unknown[]>
    activeBrowserTabIdByWorktree: Record<string, string | null>
  }
}))

vi.mock('@/lib/active-agent-note-send', () => ({
  sendNotesToActiveAgentSession: mocks.sendNotesToActiveAgentSession,
  activeAgentNotesSendFailureMessage: (status: string) => `Legacy send failure: ${status}`
}))

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: mocks.launchAgentInNewTab
}))

vi.mock('@/hooks/useDetectedAgents', () => ({
  useDetectedAgents: mocks.useDetectedAgents
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (
      selector: (state: {
        settings: {
          defaultTuiAgent: 'codex'
          disabledTuiAgents: []
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
          agentModelSelections: Record<string, string>
        }
        repos: []
        updateSettings: typeof mocks.updateSettings
        browserTabsByWorktree: typeof mocks.browserState.browserTabsByWorktree
        browserAnnotationsByPageId: typeof mocks.browserState.browserAnnotationsByPageId
        activeBrowserTabIdByWorktree: typeof mocks.browserState.activeBrowserTabIdByWorktree
        createBrowserTab: typeof mocks.createBrowserTab
        focusBrowserTabInWorktree: typeof mocks.focusBrowserTabInWorktree
      }) => unknown
    ) =>
      selector({
        settings: {
          defaultTuiAgent: 'codex',
          disabledTuiAgents: [],
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
          agentModelSelections: {}
        },
        repos: [],
        updateSettings: mocks.updateSettings,
        browserTabsByWorktree: mocks.browserState.browserTabsByWorktree,
        browserAnnotationsByPageId: mocks.browserState.browserAnnotationsByPageId,
        activeBrowserTabIdByWorktree: mocks.browserState.activeBrowserTabIdByWorktree,
        createBrowserTab: mocks.createBrowserTab,
        focusBrowserTabInWorktree: mocks.focusBrowserTabInWorktree
      }),
    {
      getState: () => ({
        settings: {
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
          agentModelSelections: {}
        }
      })
    }
  )
}))

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Use slash commands',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

function setTextControlValue(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AgentComposer slash commands', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.sendNotesToActiveAgentSession.mockReset()
    mocks.launchAgentInNewTab.mockReset()
    mocks.useDetectedAgents.mockReset()
    mocks.updateSettings.mockReset()
    mocks.discoverCommitMessageModels.mockReset()
    mocks.createBrowserTab.mockReset()
    mocks.focusBrowserTabInWorktree.mockReset()
    mocks.browserState.browserTabsByWorktree = {}
    mocks.browserState.browserAnnotationsByPageId = {}
    mocks.browserState.activeBrowserTabIdByWorktree = {}
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.discoverCommitMessageModels.mockResolvedValue({
      success: false,
      error: 'Discovery not configured for this test.'
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
  })

  it('sends raw slash commands to the selected agent', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/help')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: '/help'
    })
  })

  it('offers slash commands and inserts the selected command into the composer draft', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/mo')
    })

    const listbox = container.querySelector('[role="listbox"][aria-label="Slash commands"]')
    const modelOption = container.querySelector<HTMLElement>(
      '[role="option"][data-command="/model"]'
    )
    expect(listbox).not.toBeNull()
    expect(modelOption?.textContent).toContain('/model')

    await act(async () => {
      modelOption?.click()
    })

    expect(textarea?.value).toBe('/model')
  })
})
