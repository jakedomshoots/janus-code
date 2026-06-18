// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  launchAgentInNewTab: vi.fn(),
  startProjectlessPlanningAgent: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
  discoverCommitMessageModels: vi.fn(),
  createBrowserTab: vi.fn(),
  focusBrowserTabInWorktree: vi.fn()
}))

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: mocks.launchAgentInNewTab
}))

vi.mock('@/lib/projectless-planning-agent', () => ({
  startProjectlessPlanningAgent: mocks.startProjectlessPlanningAgent
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
          agentDefaultArgs: {}
          agentModelSelections: Record<string, string>
        }
        updateSettings: typeof mocks.updateSettings
        browserTabsByWorktree: Record<string, unknown[]>
        browserAnnotationsByPageId: Record<string, unknown[]>
        activeBrowserTabIdByWorktree: Record<string, string | null>
        createBrowserTab: typeof mocks.createBrowserTab
        focusBrowserTabInWorktree: typeof mocks.focusBrowserTabInWorktree
      }) => unknown
    ) =>
      selector({
        settings: {
          defaultTuiAgent: 'claude',
          disabledTuiAgents: [],
          agentDefaultArgs: {},
          agentModelSelections: {}
        },
        updateSettings: mocks.updateSettings,
        browserTabsByWorktree: {},
        browserAnnotationsByPageId: {},
        activeBrowserTabIdByWorktree: {},
        createBrowserTab: mocks.createBrowserTab,
        focusBrowserTabInWorktree: mocks.focusBrowserTabInWorktree
      }),
    {
      getState: () => ({
        settings: {
          agentDefaultArgs: {},
          agentModelSelections: {}
        }
      })
    }
  )
}))

function setTextControlValue(control: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AgentComposer projectless launch', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.launchAgentInNewTab.mockReset()
    mocks.startProjectlessPlanningAgent.mockReset()
    mocks.useDetectedAgents.mockReset()
    mocks.updateSettings.mockReset()
    mocks.discoverCommitMessageModels.mockReset()
    mocks.createBrowserTab.mockReset()
    mocks.focusBrowserTabInWorktree.mockReset()
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['claude'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.startProjectlessPlanningAgent.mockResolvedValue(true)
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
  })

  it('starts a planning agent from the new-session composer without an active workspace', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId={null} selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()
    expect(textarea?.placeholder).toBe('Start a new agent session')
    expect(container.textContent).not.toContain('Select a workspace before starting an agent.')

    await act(async () => {
      setTextControlValue(textarea!, 'Plan a project before picking a repo.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.startProjectlessPlanningAgent).toHaveBeenCalledWith({
      prompt: 'Plan a project before picking a repo.',
      agent: 'claude'
    })
    expect(mocks.launchAgentInNewTab).not.toHaveBeenCalled()
    expect(textarea?.value).toBe('')
    expect(container.textContent).toContain('Starting a planning agent.')
  })
})
