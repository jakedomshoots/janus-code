import type { ClaudeUsageSummary } from '../../../../shared/claude-usage-types'
import type { CodexUsageSummary } from '../../../../shared/codex-usage-types'
import type { OpenCodeUsageSummary } from '../../../../shared/opencode-usage-types'
import type {
  ProviderRateLimits,
  RateLimitBucket,
  RateLimitState,
  RateLimitWindow
} from '../../../../shared/rate-limit-types'
import type { TuiAgent } from '../../../../shared/types'
import { translate } from '@/i18n/i18n'
import { formatTokens } from '../stats/usage-formatters'

export type ComposerUsageMeter = {
  label: string
  value: string
  percent: number | null
  detail: string | null
}

export type ComposerUsageSummary = {
  contextLabel: string
  contextPercent: number | null
  contextRows: ComposerUsageMeter[]
  remainingRows: ComposerUsageMeter[]
  providerStatus: ProviderRateLimits['status'] | 'untracked'
}

export type ComposerAgentUsageSummary =
  | { provider: 'codex'; summary: CodexUsageSummary | null }
  | { provider: 'claude'; summary: ClaudeUsageSummary | null }
  | { provider: 'opencode'; summary: OpenCodeUsageSummary | null }
  | { provider: 'untracked'; summary: null }

const DEFAULT_CONTEXT_WINDOW_TOKENS = 1_000_000

export function buildComposerUsageSummary({
  selectedAgent,
  usageSummary,
  rateLimits
}: {
  selectedAgent: TuiAgent | null
  usageSummary: ComposerAgentUsageSummary
  rateLimits: RateLimitState
}): ComposerUsageSummary {
  const providerLimits = getProviderRateLimits(selectedAgent, rateLimits)
  const contextRows = buildContextRows(usageSummary)
  const contextPercent = contextRows[0]?.percent ?? null
  const totalTokens = getUsageTotalTokens(usageSummary)

  return {
    contextLabel:
      contextPercent === null
        ? translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked')
        : `${formatTokens(totalTokens ?? 0)}/1M`,
    contextPercent,
    contextRows,
    remainingRows: buildRemainingRows(providerLimits),
    providerStatus: providerLimits?.status ?? 'untracked'
  }
}

function buildContextRows(usageSummary: ComposerAgentUsageSummary): ComposerUsageMeter[] {
  const totalTokens = getUsageTotalTokens(usageSummary)
  const contextPercent =
    totalTokens !== null && totalTokens > 0
      ? clampPercent((totalTokens / DEFAULT_CONTEXT_WINDOW_TOKENS) * 100)
      : null

  return [
    {
      label: translate('auto.components.agentWorkspace.composer.messages', 'Messages'),
      value:
        contextPercent === null
          ? translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked')
          : formatPercent(contextPercent),
      percent: contextPercent,
      detail: totalTokens === null ? null : formatTokens(totalTokens)
    },
    {
      label: translate('auto.components.agentWorkspace.composer.systemTools', 'System tools'),
      value: translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked'),
      percent: null,
      detail: null
    },
    {
      label: translate('auto.components.agentWorkspace.composer.systemPrompt', 'System prompt'),
      value: translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked'),
      percent: null,
      detail: null
    },
    {
      label: translate('auto.components.agentWorkspace.composer.skills', 'Skills'),
      value: translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked'),
      percent: null,
      detail: null
    },
    {
      label: translate('auto.components.agentWorkspace.composer.metaContext', 'Meta context'),
      value: translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked'),
      percent: null,
      detail: null
    }
  ]
}

function getUsageTotalTokens(usageSummary: ComposerAgentUsageSummary): number | null {
  if (!usageSummary.summary) {
    return null
  }

  switch (usageSummary.provider) {
    case 'codex':
    case 'opencode':
      return usageSummary.summary.totalTokens
    case 'claude':
      return (
        usageSummary.summary.inputTokens +
        usageSummary.summary.outputTokens +
        usageSummary.summary.cacheReadTokens +
        usageSummary.summary.cacheWriteTokens
      )
    default:
      return null
  }
}

function buildRemainingRows(limits: ProviderRateLimits | null): ComposerUsageMeter[] {
  return [
    rateWindowToRemainingRow(
      translate('auto.components.agentWorkspace.composer.fiveHours', '5 hours'),
      limits?.session ?? null
    ),
    rateWindowToRemainingRow(
      translate('auto.components.agentWorkspace.composer.weekly', 'Weekly'),
      limits?.weekly ?? null
    ),
    rateWindowToRemainingRow(
      translate('auto.components.agentWorkspace.composer.toolCalls', 'Tool calls'),
      getToolCallBucket(limits)
    )
  ]
}

function rateWindowToRemainingRow(
  label: string,
  window: RateLimitWindow | null
): ComposerUsageMeter {
  if (!window) {
    return {
      label,
      value: translate('auto.components.agentWorkspace.composer.notTracked', 'Not tracked'),
      percent: null,
      detail: null
    }
  }

  const remainingPercent = clampPercent(100 - window.usedPercent)
  return {
    label,
    value: formatPercent(remainingPercent),
    percent: remainingPercent,
    detail: window.resetDescription
  }
}

function getProviderRateLimits(
  selectedAgent: TuiAgent | null,
  rateLimits: RateLimitState
): ProviderRateLimits | null {
  switch (selectedAgent) {
    case 'codex':
      return rateLimits.codex
    case 'claude':
    case 'claude-agent-teams':
    case 'openclaude':
      return rateLimits.claude
    case 'gemini':
    case 'antigravity':
      return rateLimits.gemini
    case 'opencode':
    case 'omp':
    case 'pi':
      return rateLimits.opencodeGo
    case 'kimi':
      return rateLimits.kimi
    default:
      return null
  }
}

function getToolCallBucket(limits: ProviderRateLimits | null): RateLimitBucket | null {
  return (
    limits?.buckets?.find((bucket) => /tool|call/i.test(bucket.name)) ??
    limits?.buckets?.[0] ??
    null
  )
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function formatPercent(value: number): string {
  if (value >= 10 || value === 0) {
    return `${Math.round(value)}%`
  }
  return `${value.toFixed(1)}%`
}
