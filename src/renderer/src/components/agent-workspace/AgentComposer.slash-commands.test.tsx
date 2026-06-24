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
  discoverAgentSlashCommands: vi.fn(),
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
    mocks.discoverAgentSlashCommands.mockReset()
    mocks.createBrowserTab.mockReset()
    mocks.focusBrowserTabInWorktree.mockReset()
    mocks.browserState.browserTabsByWorktree = {}
    mocks.browserState.browserAnnotationsByPageId = {}
    mocks.browserState.activeBrowserTabIdByWorktree = {}
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels,
        discoverAgentSlashCommands: mocks.discoverAgentSlashCommands
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
    mocks.discoverAgentSlashCommands.mockResolvedValue({
      success: false,
      error: 'Slash command discovery not configured for this test.'
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

  it('clears an accepted slash command when the thread phase updates mid-submit', async () => {
    const completedThread: AgentWorkspaceThread = {
      ...runningThread,
      phase: 'completed'
    }
    let resolveSend: ((result: ActiveAgentNotesSendResult) => void) | null = null
    mocks.sendNotesToActiveAgentSession.mockImplementation(
      () =>
        new Promise<ActiveAgentNotesSendResult>((resolve) => {
          resolveSend = resolve
        })
    )

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={completedThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/model')
    })
    expect(container.querySelector('[role="listbox"][aria-label="Slash commands"]')).not.toBeNull()

    act(() => {
      button?.click()
    })
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={{ ...completedThread, phase: 'running' }}
        />
      )
    })
    await act(async () => {
      resolveSend?.({ status: 'sent' })
      await Promise.resolve()
    })

    expect(textarea?.value).toBe('')
    expect(container.querySelector('[role="listbox"][aria-label="Slash commands"]')).toBeNull()
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

  it('keyboard-selects slash commands without sending the partial query', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/mo')
    })

    const modelOption = container.querySelector<HTMLElement>(
      '[role="option"][data-command="/model"]'
    )
    expect(modelOption?.getAttribute('aria-selected')).toBe('true')

    await act(async () => {
      textarea?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(textarea?.value).toBe('/model')
    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
  })

  it('keyboard-selects the visually highlighted slash command after the list narrows', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/')
    })
    await act(async () => {
      for (let index = 0; index < 8; index += 1) {
        textarea?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      }
    })

    await act(async () => {
      setTextControlValue(textarea!, '/log')
    })

    const selectedOption = container.querySelector<HTMLElement>(
      '[role="option"][aria-selected="true"]'
    )
    expect(selectedOption?.dataset.command).toBe('/logout')
    expect(textarea?.getAttribute('aria-activedescendant')).toBe(selectedOption?.id)

    await act(async () => {
      textarea?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(textarea?.value).toBe('/logout')
  })

  it('offers a live command discovery slash command', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/com')
    })

    const commandsOption = container.querySelector<HTMLElement>(
      '[role="option"][data-command="/commands"]'
    )
    expect(commandsOption?.textContent).toContain('/commands')

    await act(async () => {
      commandsOption?.click()
    })

    expect(textarea?.value).toBe('/commands')
  })

  it('offers slash commands returned by the runtime catalog API', async () => {
    mocks.discoverAgentSlashCommands.mockResolvedValue({
      success: true,
      agentId: 'codex',
      commands: [
        {
          command: '/runtime-only',
          title: 'Runtime only',
          description: 'Discovered from the runtime catalog.',
          source: 'catalog'
        }
      ]
    })
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={runningThread} />)
    })

    await act(async () => {
      await Promise.resolve()
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, '/runtime')
    })

    const runtimeOption = container.querySelector<HTMLElement>(
      '[role="option"][data-command="/runtime-only"]'
    )
    expect(runtimeOption?.textContent).toContain('/runtime-only')
  })

  it('discovers slash commands through the selected project backend context', async () => {
    mocks.discoverAgentSlashCommands.mockResolvedValue({
      success: true,
      agentId: 'codex',
      commands: []
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={runningThread}
          selectedProject={{
            id: 'worktree-1',
            label: 'Remote Janus',
            path: '/home/jake/janus-code',
            hostKind: 'ssh',
            agentDetectionTarget: { kind: 'ssh', connectionId: 'ssh-1' }
          }}
        />
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(mocks.discoverAgentSlashCommands).toHaveBeenCalledWith({
      agentId: 'codex',
      worktreePath: '/home/jake/janus-code',
      connectionId: 'ssh-1'
    })
  })

  it('attaches browser annotations into the draft through the composer tool button', async () => {
    const openBrowserWorkbench = vi.fn()
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={runningThread}
          browserWorkbench={{
            browserWorkbenchReady: true,
            canOpenBrowserDrawer: true,
            browserAvailable: true,
            browserTabCount: 1,
            browserAnnotationCount: 2,
            browserAnnotationMarkdown:
              'Browser context:\n- page: http://localhost:5175\n- note: Composer send button looks disabled.',
            canAttachBrowserContext: true,
            openBrowserWorkbench
          }}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      setTextControlValue(textarea!, 'Use this page state.')
    })

    const attachButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === 'Attach browser context'
    )
    expect(attachButton).not.toBeNull()
    expect(attachButton?.disabled).toBe(false)

    await act(async () => {
      attachButton?.click()
    })

    expect(textarea?.value).toContain('Use this page state.')
    expect(textarea?.value).toContain('Browser context:')
    expect(textarea?.value).toContain('Composer send button looks disabled.')
    expect(container.textContent).toContain('Browser context attached.')
  })

  it('routes composer tool buttons to browser workbench and terminal drawer actions', async () => {
    const openBrowserWorkbench = vi.fn()
    const onOpenTerminalDrawer = vi.fn()
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={runningThread}
          terminalAvailable={true}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
          browserWorkbench={{
            browserWorkbenchReady: true,
            canOpenBrowserDrawer: true,
            browserAvailable: true,
            browserTabCount: 0,
            browserAnnotationCount: 0,
            browserAnnotationMarkdown: '',
            canAttachBrowserContext: false,
            openBrowserWorkbench
          }}
        />
      )
    })

    const openBrowserButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((candidate) => candidate.getAttribute('aria-label') === 'Open browser workbench')
    const openTerminalButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((candidate) => candidate.getAttribute('aria-label') === 'Open terminal drawer')

    expect(openBrowserButton).not.toBeNull()
    expect(openBrowserButton?.disabled).toBe(false)
    expect(openTerminalButton).not.toBeNull()
    expect(openTerminalButton?.disabled).toBe(false)

    await act(async () => {
      openBrowserButton?.click()
    })
    await act(async () => {
      openTerminalButton?.click()
    })

    expect(openBrowserWorkbench).toHaveBeenCalledTimes(1)
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })

  it('keeps the terminal drawer route available for SSH selected projects', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-remote"
          selectedThread={{ ...runningThread, worktreeId: 'worktree-remote' }}
          selectedProject={{
            id: 'worktree-remote',
            label: 'Remote Janus',
            path: '/home/jake/janus-code',
            hostKind: 'ssh',
            agentDetectionTarget: { kind: 'ssh', connectionId: 'ssh-1' }
          }}
          terminalAvailable={true}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const openTerminalButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    ).find((candidate) => candidate.getAttribute('aria-label') === 'Open terminal drawer')

    expect(openTerminalButton).not.toBeNull()
    expect(openTerminalButton?.disabled).toBe(false)

    await act(async () => {
      openTerminalButton?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })
})
