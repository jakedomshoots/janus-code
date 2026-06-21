// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClaudeUsageSummary } from '../../../../shared/claude-usage-types'
import type { CodexUsageSummary } from '../../../../shared/codex-usage-types'
import type { OpenCodeUsageSummary } from '../../../../shared/opencode-usage-types'
import type { AiVaultListResult } from '../../../../shared/ai-vault-types'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import { AgentComposerUsagePopover } from './AgentComposerUsagePopover'

const mocks = vi.hoisted(() => ({
  refreshRateLimits: vi.fn(),
  fetchCodexUsage: vi.fn(),
  fetchClaudeUsage: vi.fn(),
  fetchOpenCodeUsage: vi.fn(),
  listAiVaultSessions: vi.fn(),
  rateLimits: {
    claude: null,
    codex: {
      provider: 'codex',
      status: 'ok',
      session: {
        usedPercent: 12,
        windowMinutes: 300,
        resetsAt: null,
        resetDescription: '10:52'
      },
      weekly: {
        usedPercent: 82,
        windowMinutes: 10080,
        resetsAt: null,
        resetDescription: 'Jun 24'
      },
      buckets: [
        {
          name: 'Tool calls',
          usedPercent: 49,
          windowMinutes: 10080,
          resetsAt: null,
          resetDescription: 'Jul 13'
        }
      ],
      updatedAt: 1_781_995_200_000,
      error: null
    },
    gemini: null,
    opencodeGo: null,
    kimi: null,
    claudeTarget: { runtime: 'host', wslDistro: null },
    codexTarget: { runtime: 'host', wslDistro: null },
    inactiveClaudeAccounts: [],
    inactiveCodexAccounts: []
  } satisfies RateLimitState,
  codexUsageSummary: {
    scope: 'orca',
    range: '30d',
    sessions: 8,
    events: 96,
    inputTokens: 320_000,
    cachedInputTokens: 40_000,
    outputTokens: 95_000,
    reasoningOutputTokens: 34_400,
    totalTokens: 489_400,
    estimatedCostUsd: null,
    topModel: 'gpt-5',
    topProject: 'janus-code',
    hasAnyCodexData: true
  } satisfies CodexUsageSummary,
  claudeUsageSummary: {
    scope: 'orca',
    range: '30d',
    sessions: 4,
    turns: 42,
    zeroCacheReadTurns: 0,
    inputTokens: 120_000,
    outputTokens: 30_000,
    cacheReadTokens: 10_000,
    cacheWriteTokens: 5_000,
    cacheReuseRate: 0.25,
    estimatedCostUsd: null,
    topModel: 'claude-sonnet',
    topProject: 'janus-code',
    hasAnyClaudeData: true
  } satisfies ClaudeUsageSummary,
  openCodeUsageSummary: {
    scope: 'orca',
    range: '30d',
    sessions: 5,
    events: 55,
    inputTokens: 210_000,
    cachedInputTokens: 30_000,
    outputTokens: 40_000,
    reasoningOutputTokens: 20_000,
    totalTokens: 300_000,
    estimatedCostUsd: null,
    topModel: 'opencode-default',
    topProject: 'janus-code',
    hasAnyOpenCodeData: true
  } satisfies OpenCodeUsageSummary,
  aiVaultListResult: {
    sessions: [
      {
        id: 'gemini:session-1',
        agent: 'gemini',
        sessionId: 'session-1',
        title: 'Gemini task',
        cwd: '/tmp/project',
        branch: 'main',
        model: 'gemini-2.5-pro',
        filePath: '/tmp/gemini/session-1.json',
        codexHome: null,
        createdAt: '2026-06-20T12:00:00.000Z',
        updatedAt: '2026-06-20T12:30:00.000Z',
        modifiedAt: '2026-06-20T12:30:00.000Z',
        messageCount: 3,
        totalTokens: 222_000,
        previewMessages: [],
        resumeCommand: "gemini --resume 'session-1'"
      },
      {
        id: 'codex:session-2',
        agent: 'codex',
        sessionId: 'session-2',
        title: 'Codex task',
        cwd: '/tmp/project',
        branch: 'main',
        model: 'gpt-5',
        filePath: '/tmp/codex/session-2.jsonl',
        codexHome: null,
        createdAt: '2026-06-20T13:00:00.000Z',
        updatedAt: '2026-06-20T13:30:00.000Z',
        modifiedAt: '2026-06-20T13:30:00.000Z',
        messageCount: 4,
        totalTokens: 999_000,
        previewMessages: [],
        resumeCommand: "codex resume 'session-2'"
      },
      {
        id: 'pi:session-3',
        agent: 'pi',
        sessionId: 'session-3',
        title: 'Pi task',
        cwd: '/tmp/project',
        branch: 'main',
        model: 'kimi-coding/kimi-for-coding',
        filePath: '/tmp/pi/session-3.jsonl',
        codexHome: null,
        createdAt: '2026-06-20T14:00:00.000Z',
        updatedAt: '2026-06-20T14:30:00.000Z',
        modifiedAt: '2026-06-20T14:30:00.000Z',
        messageCount: 5,
        totalTokens: 111_000,
        previewMessages: [],
        resumeCommand: "pi --session 'session-3'"
      }
    ],
    issues: [],
    scannedAt: '2026-06-21T12:00:00.000Z'
  } satisfies AiVaultListResult
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) =>
    selector({
      rateLimits: mocks.rateLimits,
      refreshRateLimits: mocks.refreshRateLimits,
      fetchCodexUsage: mocks.fetchCodexUsage,
      fetchClaudeUsage: mocks.fetchClaudeUsage,
      fetchOpenCodeUsage: mocks.fetchOpenCodeUsage,
      codexUsageSummary: mocks.codexUsageSummary,
      claudeUsageSummary: mocks.claudeUsageSummary,
      openCodeUsageSummary: mocks.openCodeUsageSummary
    })
}))

describe('AgentComposerUsagePopover', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.refreshRateLimits.mockReset()
    mocks.fetchCodexUsage.mockReset()
    mocks.fetchClaudeUsage.mockReset()
    mocks.fetchOpenCodeUsage.mockReset()
    mocks.listAiVaultSessions.mockReset()
    mocks.listAiVaultSessions.mockResolvedValue(mocks.aiVaultListResult)
    Object.defineProperty(window, 'api', {
      configurable: true,
      value: {
        aiVault: {
          listSessions: mocks.listAiVaultSessions
        }
      }
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('opens a composer usage and context snapshot from live store data', async () => {
    await act(async () => {
      root.render(<AgentComposerUsagePopover selectedAgent="codex" />)
    })

    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Usage and context"]'
    )
    expect(trigger).not.toBeNull()

    await act(async () => {
      trigger?.click()
    })

    expect(mocks.refreshRateLimits).toHaveBeenCalledTimes(1)
    expect(mocks.fetchCodexUsage).toHaveBeenCalledWith({ forceRefresh: true })
    expect(mocks.fetchClaudeUsage).not.toHaveBeenCalled()
    expect(mocks.fetchOpenCodeUsage).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Context window')
    expect(document.body.textContent).toContain('489.4k/1M')
    expect(document.body.textContent).toContain('Messages')
    expect(document.body.textContent).toContain('System tools')
    expect(document.body.textContent).toContain('System prompt')
    expect(document.body.textContent).toContain('Skills')
    expect(document.body.textContent).toContain('Meta context')
    expect(document.body.textContent).toContain('Usage remaining')
    expect(document.body.textContent).toContain('5 hours')
    expect(document.body.textContent).toContain('88%')
    expect(document.body.textContent).toContain('Weekly')
    expect(document.body.textContent).toContain('18%')
    expect(document.body.textContent).toContain('Tool calls')
    expect(document.body.textContent).toContain('51%')
  })

  it('uses the Claude usage backend when Claude is selected', async () => {
    await act(async () => {
      root.render(<AgentComposerUsagePopover selectedAgent="claude" />)
    })

    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Usage and context"]'
    )

    await act(async () => {
      trigger?.click()
    })

    expect(mocks.refreshRateLimits).toHaveBeenCalledTimes(1)
    expect(mocks.fetchClaudeUsage).toHaveBeenCalledWith({ forceRefresh: true })
    expect(mocks.fetchCodexUsage).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('165.0k/1M')
  })

  it('uses the OpenCode usage backend when OpenCode is selected', async () => {
    await act(async () => {
      root.render(<AgentComposerUsagePopover selectedAgent="opencode" />)
    })

    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Usage and context"]'
    )

    await act(async () => {
      trigger?.click()
    })

    expect(mocks.refreshRateLimits).toHaveBeenCalledTimes(1)
    expect(mocks.fetchOpenCodeUsage).toHaveBeenCalledWith({ forceRefresh: true })
    expect(mocks.fetchCodexUsage).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('300.0k/1M')
  })

  it('uses AI Vault transcript totals for CLI agents without a dedicated usage store', async () => {
    await act(async () => {
      root.render(<AgentComposerUsagePopover selectedAgent="gemini" />)
    })

    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Usage and context"]'
    )

    await act(async () => {
      trigger?.click()
    })

    expect(mocks.refreshRateLimits).toHaveBeenCalledTimes(1)
    expect(mocks.listAiVaultSessions).toHaveBeenCalledWith({ force: true, limit: 500 })
    expect(mocks.fetchCodexUsage).not.toHaveBeenCalled()
    expect(mocks.fetchClaudeUsage).not.toHaveBeenCalled()
    expect(mocks.fetchOpenCodeUsage).not.toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('222.0k/1M')
    })
  })

  it('uses the Pi transcript backend instead of OpenCode usage totals', async () => {
    await act(async () => {
      root.render(<AgentComposerUsagePopover selectedAgent="pi" />)
    })

    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Usage and context"]'
    )

    await act(async () => {
      trigger?.click()
    })

    expect(mocks.listAiVaultSessions).toHaveBeenCalledWith({ force: true, limit: 500 })
    expect(mocks.fetchOpenCodeUsage).not.toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('111.0k/1M')
    })
  })
})
