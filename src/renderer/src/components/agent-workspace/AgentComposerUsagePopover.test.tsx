// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClaudeUsageSummary } from '../../../../shared/claude-usage-types'
import type { CodexUsageSummary } from '../../../../shared/codex-usage-types'
import type { OpenCodeUsageSummary } from '../../../../shared/opencode-usage-types'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import { AgentComposerUsagePopover } from './AgentComposerUsagePopover'

const mocks = vi.hoisted(() => ({
  refreshRateLimits: vi.fn(),
  fetchCodexUsage: vi.fn(),
  fetchClaudeUsage: vi.fn(),
  fetchOpenCodeUsage: vi.fn(),
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
  } satisfies OpenCodeUsageSummary
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
})
