// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
  discoverCommitMessageModels: vi.fn()
}))

vi.mock('@/lib/active-agent-note-send', () => ({
  sendNotesToActiveAgentSession: vi.fn(),
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
          defaultTuiAgent: 'claude'
          disabledTuiAgents: []
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
          agentDefaultEnv: {}
          agentModelSelections: Record<string, string>
        }
        repos: []
        updateSettings: typeof mocks.updateSettings
        browserTabsByWorktree: Record<string, unknown[]>
        browserAnnotationsByPageId: Record<string, unknown[]>
        activeBrowserTabIdByWorktree: Record<string, string | null>
        createBrowserTab: () => void
        focusBrowserTabInWorktree: () => void
      }) => unknown
    ) =>
      selector({
        settings: {
          defaultTuiAgent: 'claude',
          disabledTuiAgents: [],
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
          agentDefaultEnv: {},
          agentModelSelections: {}
        },
        repos: [],
        updateSettings: mocks.updateSettings,
        browserTabsByWorktree: {},
        browserAnnotationsByPageId: {},
        activeBrowserTabIdByWorktree: {},
        createBrowserTab: () => undefined,
        focusBrowserTabInWorktree: () => undefined
      }),
    {
      getState: () => ({
        settings: {
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
          agentDefaultEnv: {},
          agentModelSelections: {}
        }
      })
    }
  )
}))

function getDocumentButton(label: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
}

async function openAgentSettings(container: HTMLElement): Promise<void> {
  const button = container.querySelector<HTMLButtonElement>('button[aria-label="Agent settings"]')
  expect(button).not.toBeNull()
  await act(async () => {
    button?.click()
    await Promise.resolve()
  })
}

describe('AgentComposer draft agent selection', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.launchAgentInNewTab.mockReset()
    mocks.useDetectedAgents.mockReset()
    mocks.updateSettings.mockReset()
    mocks.discoverCommitMessageModels.mockReset()
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['claude', 'opencode'],
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

  it('notifies the draft tab strip once when the user changes provider', async () => {
    const onDraftSessionAgentChange = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          draftSessionId="draft-1"
          onDraftSessionAgentChange={onDraftSessionAgentChange}
        />
      )
      await Promise.resolve()
    })

    expect(onDraftSessionAgentChange).toHaveBeenCalledWith('claude')
    onDraftSessionAgentChange.mockClear()

    await openAgentSettings(container)
    await act(async () => {
      getDocumentButton('Open provider menu')?.click()
      await Promise.resolve()
    })

    const openCodeOption = getDocumentButton('Set agent provider: OpenCode')
    expect(openCodeOption).not.toBeNull()

    await act(async () => {
      openCodeOption?.click()
      await Promise.resolve()
    })

    expect(onDraftSessionAgentChange).toHaveBeenCalledTimes(1)
    expect(onDraftSessionAgentChange).toHaveBeenCalledWith('opencode')
  })
})
