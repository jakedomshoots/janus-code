// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { expect, vi, type Mock } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import type { VoiceSettings } from '../../../../shared/speech-types'
import type { AgentWorkspaceThread } from './agent-workspace-types'

type AgentComposerBrowserTestState = {
  browserTabsByWorktree: Record<string, unknown[]>
  browserAnnotationsByPageId: Record<string, unknown[]>
  activeBrowserTabIdByWorktree: Record<string, string | null>
}

type AgentComposerSettingsTestState = {
  defaultTuiAgent: 'claude'
  disabledTuiAgents: []
  agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
  agentModelSelections: Record<string, string>
  agentTaskFitHintsEnabled?: boolean
  voice?: VoiceSettings
}

type AgentComposerTestMocks = {
  sendNotesToActiveAgentSession: Mock
  launchAgentInNewTab: Mock
  useDetectedAgents: Mock
  updateSettings: Mock
  discoverCommitMessageModels: Mock
  createBrowserTab: Mock
  focusBrowserTabInWorktree: Mock
  browserState: AgentComposerBrowserTestState
  settings: AgentComposerSettingsTestState
  rateLimits: RateLimitState
}

const mocks: AgentComposerTestMocks = vi.hoisted(() => ({
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
  } as AgentComposerBrowserTestState,
  settings: {
    defaultTuiAgent: 'claude',
    disabledTuiAgents: [],
    agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' },
    agentModelSelections: {}
  } as AgentComposerSettingsTestState,
  rateLimits: {
    claude: null,
    codex: null,
    gemini: null,
    opencodeGo: null,
    kimi: null,
    claudeTarget: { runtime: 'host', wslDistro: null },
    codexTarget: { runtime: 'host', wslDistro: null },
    inactiveClaudeAccounts: [],
    inactiveCodexAccounts: []
  } as RateLimitState
}))

export function getAgentComposerMocks(): AgentComposerTestMocks {
  return mocks
}

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
        settings: typeof mocks.settings
        dictationState: 'idle'
        repos: []
        rateLimits: typeof mocks.rateLimits
        updateSettings: typeof mocks.updateSettings
        browserTabsByWorktree: typeof mocks.browserState.browserTabsByWorktree
        browserAnnotationsByPageId: typeof mocks.browserState.browserAnnotationsByPageId
        activeBrowserTabIdByWorktree: typeof mocks.browserState.activeBrowserTabIdByWorktree
        createBrowserTab: typeof mocks.createBrowserTab
        focusBrowserTabInWorktree: typeof mocks.focusBrowserTabInWorktree
      }) => unknown
    ) =>
      selector({
        settings: mocks.settings,
        dictationState: 'idle',
        repos: [],
        rateLimits: mocks.rateLimits,
        updateSettings: mocks.updateSettings,
        browserTabsByWorktree: mocks.browserState.browserTabsByWorktree,
        browserAnnotationsByPageId: mocks.browserState.browserAnnotationsByPageId,
        activeBrowserTabIdByWorktree: mocks.browserState.activeBrowserTabIdByWorktree,
        createBrowserTab: mocks.createBrowserTab,
        focusBrowserTabInWorktree: mocks.focusBrowserTabInWorktree
      }),
    {
      getState: () => ({
        settings: mocks.settings
      })
    }
  )
}))

export const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement composer',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

export const changedFileSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/App.tsx',
  additions: 12,
  deletions: 3,
  status: 'modified' as const
}

export const reviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'gitlab',
  providerLabel: 'GitLab',
  number: 42,
  title: 'Tighten workspace context',
  state: 'open',
  url: 'https://gitlab.example.com/janus/merge_requests/42',
  status: 'ready',
  updatedAt: '2026-06-16T12:00:00.000Z'
}

export function makeVoiceSettings(overrides: Partial<VoiceSettings> = {}): VoiceSettings {
  return {
    enabled: true,
    sttModel: 'local-whisper',
    modelsDir: '',
    language: 'en',
    dictationMode: 'toggle',
    terminalConfirmBeforeInsert: false,
    userModels: [],
    openAiApiKeyConfigured: false,
    ...overrides
  }
}

export function makeThread(overrides: Partial<AgentWorkspaceThread>): AgentWorkspaceThread {
  return { ...runningThread, ...overrides }
}

export function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
} {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve
  })
  return { promise, resolve }
}

export function setTextControlValue(
  control: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set
  valueSetter?.call(control, value)
  control.dispatchEvent(new Event('input', { bubbles: true }))
}

export async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

export async function openAgentSettings(container: HTMLElement): Promise<void> {
  const button = container.querySelector<HTMLButtonElement>('button[aria-label="Agent settings"]')
  expect(button).not.toBeNull()
  await act(async () => {
    button?.click()
    await Promise.resolve()
  })
}

export function getDocumentButton(label: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
}

export function setupAgentComposerTestRoot(): { root: Root; container: HTMLDivElement } {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
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
  mocks.settings.defaultTuiAgent = 'claude'
  mocks.settings.disabledTuiAgents = []
  mocks.settings.agentDefaultArgs = { codex: '--dangerously-bypass-approvals-and-sandbox' }
  mocks.settings.agentModelSelections = {}
  delete mocks.settings.agentTaskFitHintsEnabled
  delete mocks.settings.voice
  mocks.rateLimits.claude = null
  mocks.rateLimits.codex = null
  mocks.rateLimits.gemini = null
  mocks.rateLimits.opencodeGo = null
  mocks.rateLimits.kimi = null
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
  return { root, container }
}

export async function cleanupAgentComposerTestRoot(root: Root): Promise<void> {
  act(() => root.unmount())
  document.body.replaceChildren()
  delete (window as Partial<Window>).api
  await setRendererUiLanguage('en')
}
