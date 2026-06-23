// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import { AgentComposer } from './AgentComposer'
import type { AgentWorkspaceThread } from './agent-workspace-types'

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
          defaultTuiAgent: 'codex'
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
          defaultTuiAgent: 'codex',
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

const completedThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Recover completed send',
  agentKind: 'codex',
  phase: 'completed',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

function setTextControlValue(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AgentComposer completed-thread recovery', () => {
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

  it('offers to restore a sent prompt when a completed thread may not answer', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Check status again.')
    })
    await act(async () => {
      button?.click()
    })

    expect(textarea?.value).toBe('')
    expect(container.textContent).toContain('If nothing changes')

    const restoreButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.includes('Restore message')
    )
    expect(restoreButton).not.toBeNull()

    await act(async () => {
      restoreButton?.click()
    })

    expect(textarea?.value).toBe('Check status again.')
  })

  it('labels completed-thread follow-up state without implying an active send', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    expect(container.textContent).toContain('Completed thread')
    expect(container.textContent).toContain('Codex')
    expect(container.textContent).not.toContain('Continue with')
  })

  it('can resend a recovered completed-thread prompt and open the terminal drawer', async () => {
    const onOpenTerminalDrawer = vi.fn()
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={completedThread}
          terminalAvailable={true}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Please answer this follow-up.')
    })
    await act(async () => {
      button?.click()
    })

    const sendAgainButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((candidate) => candidate.textContent?.includes('Send again'))
    const openTerminalButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((candidate) => candidate.textContent?.includes('Open terminal'))
    expect(sendAgainButton).not.toBeNull()
    expect(openTerminalButton).not.toBeNull()

    await act(async () => {
      sendAgainButton?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledTimes(2)
    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenLastCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Please answer this follow-up.'
    })

    await act(async () => {
      openTerminalButton?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })

  it('clears completed-thread recovery controls after the timeline receives an agent reply', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Confirm follow-up works.')
    })
    await act(async () => {
      button?.click()
    })

    expect(container.textContent).toContain('Restore message')
    expect(container.textContent).toContain('Send again')

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={completedThread}
          timeline={[
            {
              id: 'user-1',
              threadId: 'thread-1',
              kind: 'user',
              text: 'Confirm follow-up works.',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'done'
            },
            {
              id: 'agent-1',
              threadId: 'thread-1',
              kind: 'agent',
              text: 'Follow-up works.',
              createdAt: '2026-06-16T12:01:02.000Z',
              status: 'done'
            }
          ]}
        />
      )
    })

    expect(container.textContent).not.toContain('Restore message')
    expect(container.textContent).not.toContain('Send again')
  })

  it('clears an unchanged restored prompt after the completed-thread reply arrives', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Still there?')
    })
    await act(async () => {
      button?.click()
    })

    const restoreButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.includes('Restore message')
    )
    expect(restoreButton).not.toBeNull()

    await act(async () => {
      restoreButton?.click()
    })
    expect(textarea?.value).toBe('Still there?')

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={completedThread}
          timeline={[
            {
              id: 'user-1',
              threadId: 'thread-1',
              kind: 'user',
              text: 'Still there?',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'done'
            },
            {
              id: 'agent-1',
              threadId: 'thread-1',
              kind: 'agent',
              text: 'No, the follow-up completed.',
              createdAt: '2026-06-16T12:01:02.000Z',
              status: 'done'
            }
          ]}
        />
      )
    })

    expect(container.textContent).not.toContain('Restore message')
    expect(container.textContent).not.toContain('Send again')
    expect(textarea?.value).toBe('')
  })

  it('keeps an edited restored prompt when the original completed-thread reply arrives', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Still there?')
    })
    await act(async () => {
      button?.click()
    })

    const restoreButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.includes('Restore message')
    )
    expect(restoreButton).not.toBeNull()

    await act(async () => {
      restoreButton?.click()
    })
    await act(async () => {
      setTextControlValue(textarea!, 'Actually, answer this edited draft.')
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={completedThread}
          timeline={[
            {
              id: 'user-1',
              threadId: 'thread-1',
              kind: 'user',
              text: 'Still there?',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'done'
            },
            {
              id: 'agent-1',
              threadId: 'thread-1',
              kind: 'agent',
              text: 'No, the follow-up completed.',
              createdAt: '2026-06-16T12:01:02.000Z',
              status: 'done'
            }
          ]}
        />
      )
    })

    expect(textarea?.value).toBe('Actually, answer this edited draft.')
  })

  it('clears a launched follow-up once the prompt appears in the new thread timeline', async () => {
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'no-agent'
    } satisfies ActiveAgentNotesSendResult)
    mocks.launchAgentInNewTab.mockReturnValue({
      tabId: 'tab-codex',
      startupPlan: {
        agent: 'codex',
        launchCommand: 'codex',
        expectedProcess: 'codex',
        followupPrompt: null
      },
      pasteDraftAfterLaunch: false
    })
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Launch a new follow-up.')
    })
    await act(async () => {
      button?.click()
    })

    expect(textarea?.value).toBe('Launch a new follow-up.')

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={{ ...completedThread, id: 'thread-2', phase: 'running' }}
          timeline={[
            {
              id: 'user-1',
              threadId: 'thread-2',
              kind: 'user',
              text: 'Launch a new follow-up.',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'done'
            }
          ]}
        />
      )
    })

    expect(textarea?.value).toBe('')
  })

  it('starts a fresh matching agent when a completed thread terminal is stale', async () => {
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['antigravity'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'no-agent'
    } satisfies ActiveAgentNotesSendResult)
    mocks.launchAgentInNewTab.mockReturnValue({
      tabId: 'tab-antigravity',
      startupPlan: {
        agent: 'antigravity',
        launchCommand: 'agy',
        expectedProcess: 'agy',
        followupPrompt: null
      },
      pasteDraftAfterLaunch: false
    })
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={{
            ...completedThread,
            agentKind: 'antigravity',
            title: 'Terminal 1'
          }}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'hello')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'hello'
    })
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: 'antigravity',
        worktreeId: 'worktree-1',
        prompt: 'hello',
        promptDelivery: 'auto-submit',
        onPromptDelivered: expect.any(Function)
      })
    )
    expect(container.textContent).not.toContain('not a recognized agent session')
    expect(textarea?.value).toBe('hello')

    const launchArgs = mocks.launchAgentInNewTab.mock.calls.at(-1)?.[0] as
      | { onPromptDelivered?: () => void }
      | undefined
    await act(async () => {
      launchArgs?.onPromptDelivered?.()
    })
    expect(textarea?.value).toBe('')
  })
})
