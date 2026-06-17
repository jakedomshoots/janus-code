// @vitest-environment happy-dom

import { act } from 'react'
import type * as ReactModule from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactModule>()
  return {
    ...actual,
    useEffect: () => undefined
  }
})

const mocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
  createBrowserTab: vi.fn(),
  focusBrowserTabInWorktree: vi.fn()
}))

vi.mock('@/lib/active-agent-note-send', () => ({
  sendNotesToActiveAgentSession: mocks.sendNotesToActiveAgentSession
}))

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: mocks.launchAgentInNewTab
}))

vi.mock('@/hooks/useDetectedAgents', () => ({
  useDetectedAgents: mocks.useDetectedAgents
}))

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: {
      settings: { defaultTuiAgent: 'claude'; disabledTuiAgents: [] }
      updateSettings: typeof mocks.updateSettings
      browserTabsByWorktree: Record<string, unknown[]>
      browserAnnotationsByPageId: Record<string, unknown[]>
      activeBrowserTabIdByWorktree: Record<string, string | null>
      createBrowserTab: typeof mocks.createBrowserTab
      focusBrowserTabInWorktree: typeof mocks.focusBrowserTabInWorktree
    }) => unknown
  ) =>
    selector({
      settings: { defaultTuiAgent: 'claude', disabledTuiAgents: [] },
      updateSettings: mocks.updateSettings,
      browserTabsByWorktree: {},
      browserAnnotationsByPageId: {},
      activeBrowserTabIdByWorktree: {},
      createBrowserTab: mocks.createBrowserTab,
      focusBrowserTabInWorktree: mocks.focusBrowserTabInWorktree
    })
}))

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement composer',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
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

describe('AgentComposer stale submit commit guard', () => {
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
    mocks.createBrowserTab.mockReset()
    mocks.focusBrowserTabInWorktree.mockReset()
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['claude', 'codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('does not rely on passive effects to invalidate stale submit results', async () => {
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
})
