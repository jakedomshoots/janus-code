// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
  discoverCommitMessageModels: vi.fn()
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
          defaultTuiAgent: 'opencode'
          disabledTuiAgents: []
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
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
          defaultTuiAgent: 'opencode',
          disabledTuiAgents: [],
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
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
          agentModelSelections: {}
        }
      })
    }
  )
}))

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
} {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve
  })
  return { promise, resolve }
}

function setTextControlValue(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
}

async function openAgentSettings(container: HTMLElement): Promise<void> {
  const button = container.querySelector<HTMLButtonElement>('button[aria-label="Agent settings"]')
  expect(button).not.toBeNull()
  await act(async () => {
    button?.click()
    await Promise.resolve()
  })
}

function getDocumentButton(label: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
}

const selectedProject = {
  id: 'worktree-1',
  label: 'Janus',
  path: '/Users/jakedom/Documents/janus-code',
  hostKind: 'local',
  agentDetectionTarget: { kind: 'local' }
} as const

describe('AgentComposer model discovery', () => {
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
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['opencode'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.launchAgentInNewTab.mockReturnValue({
      tabId: 'tab-opencode',
      startupPlan: {
        agent: 'opencode',
        launchCommand: 'opencode',
        expectedProcess: 'opencode',
        followupPrompt: null
      },
      pasteDraftAfterLaunch: false
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
  })

  it('opens the model picker immediately while dynamic model discovery is pending', async () => {
    const pendingDiscovery =
      deferred<Awaited<ReturnType<typeof mocks.discoverCommitMessageModels>>>()
    mocks.discoverCommitMessageModels.mockReturnValue(pendingDiscovery.promise)

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          selectedProject={selectedProject}
        />
      )
      await Promise.resolve()
    })

    await openAgentSettings(container)
    await act(async () => {
      getDocumentButton('Open model menu')?.click()
    })

    expect(mocks.discoverCommitMessageModels).toHaveBeenCalled()
    expect(document.body.textContent).toContain('Loading models...')
    expect(getDocumentButton('Set model: Provider default')).not.toBeNull()

    await act(async () => {
      pendingDiscovery.resolve({
        success: true,
        capability: {
          id: 'opencode',
          label: 'OpenCode',
          modelSource: 'dynamic',
          defaultModelId: 'opencode/deepseek-v4-flash-free',
          models: []
        },
        defaultModelId: 'opencode/deepseek-v4-flash-free',
        models: [{ id: 'opencode/gpt-5.5', label: 'GPT-5.5' }]
      })
      await pendingDiscovery.promise
    })
  })

  it('loads searchable discovered models for the selected chat agent', async () => {
    mocks.discoverCommitMessageModels.mockResolvedValue({
      success: true,
      capability: {
        id: 'opencode',
        label: 'OpenCode',
        modelSource: 'dynamic',
        defaultModelId: 'opencode/deepseek-v4-flash-free',
        models: []
      },
      defaultModelId: 'opencode/deepseek-v4-flash-free',
      models: [
        { id: 'opencode/deepseek-v4-flash-free', label: 'DeepSeek V4 Flash Free' },
        { id: 'opencode/gpt-5.5', label: 'GPT-5.5' },
        { id: 'kimi-for-coding/k2p7', label: 'Kimi K2.7 Code' },
        { id: 'opencode/claude-opus-4-8', label: 'Claude Opus 4.8' }
      ]
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          selectedProject={selectedProject}
        />
      )
      await Promise.resolve()
    })

    await openAgentSettings(container)
    await act(async () => {
      getDocumentButton('Open model menu')?.click()
    })

    expect(mocks.discoverCommitMessageModels).toHaveBeenCalledWith({
      agentId: 'opencode',
      worktreePath: '/Users/jakedom/Documents/janus-code',
      connectionId: undefined
    })

    const searchInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Search models"]'
    )
    expect(searchInput).not.toBeNull()
    expect(document.body.textContent).toContain('OpenCode')
    expect(document.body.textContent).toContain('opencode/deepseek-v4-flash-free')
    expect(document.body.textContent).toContain('opencode/gpt-5.5')
    expect(document.body.textContent).toContain('Kimi')
    expect(document.body.textContent).not.toContain('Anthropic / Claude')
    await act(async () => {
      setTextControlValue(searchInput!, 'opus')
    })

    const dynamicModelOption = getDocumentButton('Set model: Claude Opus 4.8')
    expect(dynamicModelOption).not.toBeNull()
    await act(async () => {
      dynamicModelOption?.click()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    await act(async () => {
      setTextControlValue(textarea!, 'Use the discovered model.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.updateSettings).toHaveBeenCalledWith({
      agentModelSelections: { opencode: 'opencode/claude-opus-4-8' }
    })
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'opencode',
      worktreeId: 'worktree-1',
      prompt: 'Use the discovered model.',
      agentArgs: '--model opencode/claude-opus-4-8',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
  })
})
