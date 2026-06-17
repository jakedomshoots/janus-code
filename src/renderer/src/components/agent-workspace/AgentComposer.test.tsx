// @vitest-environment happy-dom

import { act } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn()
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
          defaultTuiAgent: 'claude'
          disabledTuiAgents: []
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
        }
        updateSettings: typeof mocks.updateSettings
      }) => unknown
    ) =>
      selector({
        settings: {
          defaultTuiAgent: 'claude',
          disabledTuiAgents: [],
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
        },
        updateSettings: mocks.updateSettings
      }),
    {
      getState: () => ({
        settings: {
          agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
        }
      })
    }
  )
}))

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement composer',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/t3code-gui-workspace',
  cwd: '/Users/jakedom/orca'
}

function makeThread(overrides: Partial<AgentWorkspaceThread>): AgentWorkspaceThread {
  return { ...runningThread, ...overrides }
}

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

function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), 'value')?.set
  valueSetter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AgentComposer', () => {
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
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['claude', 'opencode'],
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

  afterEach(async () => {
    act(() => root.unmount())
    document.body.replaceChildren()
    await setRendererUiLanguage('en')
  })

  it('disables the composer when the selected thread is outside the active worktree', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-active"
          selectedThread={makeThread({ worktreeId: 'worktree-target' })}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')

    expect(textarea?.disabled).toBe(true)
    expect(button?.disabled).toBe(true)
    expect(container.textContent).toContain('Switch to this worktree before sending a message.')
    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
  })

  it('renders send failures inline', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({ status: 'not-ready' })

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextareaValue(textarea!, 'Status?')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Status?'
    })
    expect(container.textContent).toContain('The agent is not ready for input yet.')
  })

  it('ignores a stale submit result after the selected thread changes', async () => {
    const firstSend = deferred<ActiveAgentNotesSendResult>()
    mocks.sendNotesToActiveAgentSession.mockReturnValue(firstSend.promise)

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextareaValue(textarea!, 'Keep this draft.')
    })
    await act(async () => {
      button?.click()
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-2"
          selectedThread={makeThread({ id: 'thread-2', worktreeId: 'worktree-2' })}
        />
      )
    })

    await act(async () => {
      firstSend.resolve({ status: 'sent' })
      await firstSend.promise
    })

    const nextTextarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(container.textContent).not.toContain('Sent to codex.')
    expect(nextTextarea?.value).toBe('Keep this draft.')
  })

  it('updates stale-submit guards during the selection-change commit', async () => {
    const firstSend = deferred<ActiveAgentNotesSendResult>()
    mocks.sendNotesToActiveAgentSession.mockReturnValue(firstSend.promise)

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextareaValue(textarea!, 'Keep this draft.')
    })
    await act(async () => {
      button?.click()
    })

    flushSync(() => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-2"
          selectedThread={makeThread({ id: 'thread-2', worktreeId: 'worktree-2' })}
        />
      )
    })

    firstSend.resolve({ status: 'sent' })
    await act(async () => {
      await firstSend.promise
    })

    const nextTextarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(container.textContent).not.toContain('Sent to codex.')
    expect(nextTextarea?.value).toBe('Keep this draft.')
  })

  it('launches the selected detected provider when no running thread is selected', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const providerSelect = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Agent provider"]'
    )
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(providerSelect).not.toBeNull()
    expect(button).not.toBeNull()
    expect(providerSelect?.textContent).toContain('Claude')
    expect(providerSelect?.textContent).toContain('OpenCode')
    expect(providerSelect?.textContent).not.toContain('Codex')

    await act(async () => {
      providerSelect!.value = 'opencode'
      providerSelect!.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      setTextareaValue(textarea!, 'Use OpenCode for this workspace.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'opencode',
      worktreeId: 'worktree-1',
      prompt: 'Use OpenCode for this workspace.',
      launchSource: 'sidebar'
    })
    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Started OpenCode.')
  })

  it('passes the selected thinking mode into new Codex agent launches', async () => {
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
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
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const thinkingSelect = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Thinking mode"]'
    )
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(thinkingSelect).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      thinkingSelect!.value = 'deep'
      thinkingSelect!.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      setTextareaValue(textarea!, 'Use deep reasoning for this.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'worktree-1',
      prompt: 'Use deep reasoning for this.',
      agentArgs: '--dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort=high',
      launchSource: 'sidebar'
    })
  })

  it('opens the terminal drawer from the composer toolbar', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          terminalAvailable={true}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === 'Open terminal drawer'
    )

    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(false)

    await act(async () => {
      button?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })

  it('opens the workbench panes from the composer toolbar', async () => {
    const onOpenRightPanel = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          terminalAvailable={true}
          onOpenRightPanel={onOpenRightPanel}
        />
      )
    })

    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === 'Open panes'
    )

    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(false)

    await act(async () => {
      button?.click()
    })

    expect(onOpenRightPanel).toHaveBeenCalledOnce()
  })
})
