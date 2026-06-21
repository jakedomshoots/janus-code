// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CodexUsageSummary } from '../../../../shared/codex-usage-types'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import { AgentComposerUsagePopover } from './AgentComposerUsagePopover'

const mocks = vi.hoisted(() => ({
  fetchRateLimits: vi.fn(),
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
  } satisfies CodexUsageSummary
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) =>
    selector({
      rateLimits: mocks.rateLimits,
      fetchRateLimits: mocks.fetchRateLimits,
      codexUsageSummary: mocks.codexUsageSummary
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
    mocks.fetchRateLimits.mockReset()
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

    expect(mocks.fetchRateLimits).toHaveBeenCalledTimes(1)
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
})
