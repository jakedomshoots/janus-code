import { translate } from '@/i18n/i18n'
import type {
  ProviderRateLimits,
  RateLimitState,
  RateLimitWindow
} from '../../../../shared/rate-limit-types'
import type { TuiAgent } from '../../../../shared/types'

const LOW_QUOTA_REMAINING_PERCENT = 20

type UsageWindowCandidate = {
  label: string
  remainingPercent: number
}

export function getAgentProviderUsageWarning(
  agent: TuiAgent,
  rateLimits: RateLimitState | null | undefined
): string | undefined {
  const providerLimits = getProviderLimitsForAgent(agent, rateLimits)
  if (!providerLimits || providerLimits.status === 'error') {
    return undefined
  }

  const lowestWindow = getLowestRemainingUsageWindow(providerLimits)
  if (!lowestWindow || lowestWindow.remainingPercent > LOW_QUOTA_REMAINING_PERCENT) {
    return undefined
  }

  return translate(
    'auto.components.agentWorkspace.composer.providerUsageLowQuota',
    'Low quota: {{label}} {{percent}}% left',
    {
      label: lowestWindow.label,
      percent: String(lowestWindow.remainingPercent)
    }
  )
}

function getProviderLimitsForAgent(
  agent: TuiAgent,
  rateLimits: RateLimitState | null | undefined
): ProviderRateLimits | null | undefined {
  switch (agent) {
    case 'claude':
    case 'claude-agent-teams':
    case 'openclaude':
      return rateLimits?.claude
    case 'codex':
      return rateLimits?.codex
    case 'gemini':
      return rateLimits?.gemini
    case 'opencode':
      return rateLimits?.opencodeGo
    case 'kimi':
      return rateLimits?.kimi
    // These agents do not expose provider usage data in the shared rate-limit state yet.
    case 'aider':
    case 'amp':
    case 'antigravity':
    case 'aug':
    case 'autohand':
    case 'cline':
    case 'codebuff':
    case 'command-code':
    case 'continue':
    case 'copilot':
    case 'crush':
    case 'cursor':
    case 'devin':
    case 'droid':
    case 'goose':
    case 'grok':
    case 'hermes':
    case 'kilo':
    case 'kiro':
    case 'mistral-vibe':
    case 'omp':
    case 'openclaw':
    case 'pi':
    case 'qwen-code':
    case 'rovo':
      return undefined
  }
}

function getLowestRemainingUsageWindow(
  providerLimits: ProviderRateLimits
): UsageWindowCandidate | null {
  const windows: UsageWindowCandidate[] = []
  addUsageWindow(windows, providerLimits.session, getSessionWindowLabel())
  addUsageWindow(windows, providerLimits.weekly, getWeeklyWindowLabel())
  addUsageWindow(windows, providerLimits.monthly, getMonthlyWindowLabel())
  for (const bucket of providerLimits.buckets ?? []) {
    addUsageWindow(windows, bucket, bucket.name)
  }

  return windows.reduce<UsageWindowCandidate | null>((lowest, current) => {
    if (!lowest || current.remainingPercent < lowest.remainingPercent) {
      return current
    }
    return lowest
  }, null)
}

function addUsageWindow(
  windows: UsageWindowCandidate[],
  window: RateLimitWindow | null | undefined,
  label: string
): void {
  if (!window || !Number.isFinite(window.usedPercent)) {
    return
  }
  const remainingPercent = Math.max(0, Math.min(100, Math.round(100 - window.usedPercent)))
  windows.push({ label, remainingPercent })
}

function getSessionWindowLabel(): string {
  return translate('auto.components.agentWorkspace.composer.providerUsageSession', 'Session')
}

function getWeeklyWindowLabel(): string {
  return translate('auto.components.agentWorkspace.composer.providerUsageWeekly', 'Weekly')
}

function getMonthlyWindowLabel(): string {
  return translate('auto.components.agentWorkspace.composer.providerUsageMonthly', 'Monthly')
}
