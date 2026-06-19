// @vitest-environment happy-dom

import { act } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import { makeAnnotation } from './agent-composer-test-fixtures'
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
          defaultTuiAgent: 'claude'
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
          defaultTuiAgent: 'claude',
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
    mocks.discoverCommitMessageModels.mockReset()
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
    mocks.createBrowserTab.mockReset()
    mocks.focusBrowserTabInWorktree.mockReset()
    mocks.browserState.browserTabsByWorktree = {}
    mocks.browserState.browserAnnotationsByPageId = {}
    mocks.browserState.activeBrowserTabIdByWorktree = {}
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
    delete (window as Partial<Window>).api
    await setRendererUiLanguage('en')
  })

  it('renders the bottom chat composer skin without hiding core controls', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const form = container.querySelector('form')
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const panel = textarea?.parentElement
    const footerLayout = container.querySelector(
      '#agent-workspace-composer-status'
    )?.nextElementSibling

    expect(form?.className).toContain('border-t')
    expect(form?.className).toContain('bg-background/95')
    expect(textarea?.className).toContain('min-h-24')
    expect(textarea?.getAttribute('rows')).toBe('2')
    expect(panel?.className).toContain('rounded-xl')
    expect(footerLayout?.className).toContain('flex min-h-10 flex-wrap items-center gap-2')
    expect(footerLayout?.className).not.toContain('justify-between')
    expect(container.querySelector('select[aria-label="Thinking mode"]')).toBeNull()
    expect(container.querySelector('select[aria-label="Agent model"]')).toBeNull()
    expect(container.querySelector('select[aria-label="Agent provider"]')).toBeNull()
    expect(container.querySelector('button[type="submit"]')).not.toBeNull()

    await openAgentSettings(container)

    expect(getDocumentButton('Set reasoning: Medium')).not.toBeNull()
    expect(getDocumentButton('Open model menu')).not.toBeNull()
    expect(getDocumentButton('Open provider menu')).not.toBeNull()
  })

  it('keeps bare space typing inside the composer draft', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'ab')
    })

    textarea!.selectionStart = 1
    textarea!.selectionEnd = 1
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true
    })

    await act(async () => {
      textarea!.dispatchEvent(event)
      await Promise.resolve()
    })

    expect(event.defaultPrevented).toBe(true)
    expect(textarea?.value).toBe('a b')
    expect(textarea?.selectionStart).toBe(2)
    expect(textarea?.selectionEnd).toBe(2)
  })

  it('blocks send but keeps drafting when the selected thread is outside the active worktree', async () => {
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

    expect(textarea?.disabled).toBe(false)
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
    expect(container.querySelector('select[aria-label="Agent model"]')).toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Status?')
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

  it('attaches current browser annotations to the composer draft', async () => {
    mocks.browserState.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          url: 'https://example.com/pricing',
          title: 'Pricing',
          loading: false,
          faviconUrl: null,
          canGoBack: false,
          canGoForward: false,
          loadError: null,
          createdAt: 1
        }
      ]
    }
    mocks.browserState.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
    mocks.browserState.browserAnnotationsByPageId = { 'browser-page-1': [makeAnnotation()] }

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const attachButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Attach browser context"]'
    )
    expect(textarea).not.toBeNull()
    expect(attachButton).not.toBeNull()
    expect(attachButton?.disabled).toBe(false)

    await act(async () => {
      setTextControlValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })

    expect(textarea?.value).toContain('Use this page context.')
    expect(textarea?.value).toContain('Make the primary action clearer.')
    expect(textarea?.value).not.toContain('Attached browser context from')
    expect(textarea?.value).not.toContain('## Design Feedback:')
    expect(container.textContent).toContain('Browser context attached.')
  })

  it('strips verbose annotation markdown dumps from the composer draft', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(
        textarea!,
        [
          '## Design Feedback: /web-index.html',
          '',
          '**URL:** http://127.0.0.1:5175/web-index.html',
          '**Browser tab id:** page-1',
          '**Feedback:** This text is still showing'
        ].join('\n')
      )
    })

    expect(textarea?.value).toBe('This text is still showing')
  })

  it('strips legacy grab dumps from the composer draft', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(
        textarea!,
        [
          'Attached browser context from http://127.0.0.1:5175/web-index.html',
          '',
          'Selected element:',
          'header',
          'Dimensions: 100x22',
          'Full DOM path: body > div#root > header'
        ].join('\n')
      )
    })

    expect(textarea?.value).toBe('')
  })

  it('blocks legacy grab dumps pasted into the composer', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Keep this note.')
    })

    const legacyGrabDump = [
      'Attached browser context from http://127.0.0.1:5175/web-index.html',
      '',
      'Selected element:',
      'h1',
      'Full DOM path: body > div#root > h1'
    ].join('\n')

    await act(async () => {
      textarea!.selectionStart = textarea!.value.length
      textarea!.selectionEnd = textarea!.value.length
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: (type: string) => (type === 'text/plain' ? legacyGrabDump : '')
        }
      })
      textarea!.dispatchEvent(pasteEvent)
    })

    expect(textarea?.value).toBe('Keep this note.')
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
      setTextControlValue(textarea!, 'Keep this draft.')
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
      setTextControlValue(textarea!, 'Keep this draft.')
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
    await openAgentSettings(container)
    await act(async () => {
      getDocumentButton('Open provider menu')?.click()
    })
    const openCodeOption = getDocumentButton('Set agent provider: OpenCode')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(openCodeOption).not.toBeNull()
    expect(button).not.toBeNull()
    expect(getDocumentButton('Set agent provider: Codex')).toBeNull()

    await act(async () => {
      openCodeOption?.click()
    })
    await act(async () => {
      setTextControlValue(textarea!, 'Use OpenCode for this workspace.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'opencode',
      worktreeId: 'worktree-1',
      prompt: 'Use OpenCode for this workspace.',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
    expect(textarea?.value).toBe('')
  })

  it('sends follow-up prompts to completed selected threads', async () => {
    const onPendingAgentLaunch = vi.fn()
    const onMessageSent = vi.fn()
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={makeThread({ phase: 'completed' })}
          onPendingAgentLaunch={onPendingAgentLaunch}
          onMessageSent={onMessageSent}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Start a follow-up agent.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).not.toHaveBeenCalled()
    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Start a follow-up agent.'
    })
    expect(onPendingAgentLaunch).not.toHaveBeenCalled()
    expect(onMessageSent).toHaveBeenCalledTimes(1)
    expect(textarea?.value).toBe('')
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
    await openAgentSettings(container)
    const highReasoningOption = getDocumentButton('Set reasoning: High')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(highReasoningOption).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      highReasoningOption?.click()
    })
    await act(async () => {
      setTextControlValue(textarea!, 'Use deep reasoning for this.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'worktree-1',
      prompt: 'Use deep reasoning for this.',
      agentArgs: '--dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort=high',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
  })

  it('passes the selected model into new Codex agent launches', async () => {
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
    await openAgentSettings(container)
    await act(async () => {
      getDocumentButton('Open model menu')?.click()
    })
    const modelOption = getDocumentButton('Set model: GPT-5.4 Mini')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(modelOption).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      modelOption?.click()
    })
    await act(async () => {
      setTextControlValue(textarea!, 'Use the selected model.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.updateSettings).toHaveBeenCalledWith({
      agentModelSelections: { codex: 'gpt-5.4-mini' }
    })
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'worktree-1',
      prompt: 'Use the selected model.',
      agentArgs:
        '--dangerously-bypass-approvals-and-sandbox --model gpt-5.4-mini -c model_reasoning_effort=medium',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
  })

  it('syncs the resolved draft agent back to the workspace tab strip', async () => {
    const onDraftSessionAgentChange = vi.fn()
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['grok', 'codex', 'claude'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })

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
})
