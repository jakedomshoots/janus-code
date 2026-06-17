// @vitest-environment happy-dom

import { act } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import type { BrowserPageAnnotation } from '../../../../shared/browser-grab-types'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'

const mocks = vi.hoisted(() => ({
  sendNotesToActiveAgentSession: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  useDetectedAgents: vi.fn(),
  updateSettings: vi.fn(),
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
  branchName: 'feature/t3code-gui-workspace',
  cwd: '/Users/jakedom/orca'
}

function makeThread(overrides: Partial<AgentWorkspaceThread>): AgentWorkspaceThread {
  return { ...runningThread, ...overrides }
}

function makeAnnotation(): BrowserPageAnnotation {
  return {
    id: 'annotation-1',
    browserPageId: 'browser-page-1',
    comment: 'Make the primary action clearer.',
    intent: 'change',
    priority: 'important',
    createdAt: '2026-06-16T12:00:00.000Z',
    payload: {
      page: {
        sanitizedUrl: 'https://example.com/pricing',
        title: 'Pricing',
        viewportWidth: 1280,
        viewportHeight: 720,
        scrollX: 0,
        scrollY: 0,
        devicePixelRatio: 2,
        capturedAt: '2026-06-16T12:00:00.000Z'
      },
      target: {
        tagName: 'button',
        selector: 'main button.primary',
        elementPath: 'main > button.primary',
        fullPath: 'html > body > main > button.primary',
        cssClasses: 'primary',
        nearbyElements: ['span "$29/month"'],
        selectedText: null,
        isFixed: false,
        reactComponents: '<PricingCta>',
        sourceFile: 'src/components/PricingCta.tsx:42:8',
        textSnippet: 'Start free trial',
        htmlSnippet: '<button class="primary">Start free trial</button>',
        attributes: { class: 'primary', type: 'button' },
        accessibility: {
          role: 'button',
          accessibleName: 'Start free trial',
          ariaLabel: null,
          ariaLabelledBy: null
        },
        rectViewport: { x: 400, y: 300, width: 148, height: 44 },
        rectPage: { x: 400, y: 300, width: 148, height: 44 },
        computedStyles: {
          display: 'inline-flex',
          position: 'relative',
          width: '148px',
          height: '44px',
          margin: '0px',
          padding: '12px 24px',
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(99, 102, 241)',
          border: '0px none',
          borderRadius: '8px',
          fontFamily: 'Geist, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '20px',
          textAlign: 'center',
          zIndex: 'auto'
        }
      },
      nearbyText: ['Pro', '$29/month'],
      ancestorPath: ['section', 'main', 'body'],
      screenshot: null
    }
  }
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
    expect(container.querySelector('select[aria-label="Agent model"]')).toBeNull()

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
      setTextareaValue(textarea!, 'Use this page context.')
    })
    await act(async () => {
      attachButton?.click()
    })

    expect(textarea?.value).toContain('Use this page context.')
    expect(textarea?.value).toContain('## Design Feedback: /pricing')
    expect(textarea?.value).toContain('**Feedback:** Make the primary action clearer.')
    expect(container.textContent).toContain('Browser context attached.')
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
    const modelSelect = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Agent model"]'
    )
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(modelSelect).not.toBeNull()
    expect(modelSelect?.textContent).toContain('GPT-5.4 Mini')
    expect(button).not.toBeNull()

    await act(async () => {
      modelSelect!.value = 'gpt-5.4-mini'
      modelSelect!.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      setTextareaValue(textarea!, 'Use the selected model.')
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
})
