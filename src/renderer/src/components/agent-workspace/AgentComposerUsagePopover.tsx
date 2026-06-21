import { Activity, ChevronDown, Gauge } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'
import type { ClaudeUsageSummary } from '../../../../shared/claude-usage-types'
import type { CodexUsageSummary } from '../../../../shared/codex-usage-types'
import type { OpenCodeUsageSummary } from '../../../../shared/opencode-usage-types'
import {
  AI_VAULT_AGENTS,
  type AiVaultAgent,
  type AiVaultSession
} from '../../../../shared/ai-vault-types'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import type { TuiAgent } from '../../../../shared/types'
import {
  buildComposerUsageSummary,
  type ComposerAgentUsageSummary,
  type ComposerUsageMeter
} from './agent-composer-usage-summary'

const EMPTY_RATE_LIMITS: RateLimitState = {
  claude: null,
  codex: null,
  gemini: null,
  opencodeGo: null,
  kimi: null,
  claudeTarget: { runtime: 'host', wslDistro: null },
  codexTarget: { runtime: 'host', wslDistro: null },
  inactiveClaudeAccounts: [],
  inactiveCodexAccounts: []
}

export function AgentComposerUsagePopover({
  selectedAgent
}: {
  selectedAgent: TuiAgent | null
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [aiVaultTokenTotals, setAiVaultTokenTotals] = useState<
    Partial<Record<AiVaultAgent, number>>
  >({})
  const rateLimits = useAppStore((state) => state.rateLimits) ?? EMPTY_RATE_LIMITS
  const refreshRateLimits = useAppStore((state) => state.refreshRateLimits)
  const fetchCodexUsage = useAppStore((state) => state.fetchCodexUsage)
  const fetchClaudeUsage = useAppStore((state) => state.fetchClaudeUsage)
  const fetchOpenCodeUsage = useAppStore((state) => state.fetchOpenCodeUsage)
  const codexUsageSummary = useAppStore((state) => state.codexUsageSummary) ?? null
  const claudeUsageSummary = useAppStore((state) => state.claudeUsageSummary) ?? null
  const openCodeUsageSummary = useAppStore((state) => state.openCodeUsageSummary) ?? null
  const usageSummary = useMemo(
    () =>
      getUsageSummaryForAgent({
        selectedAgent,
        codexUsageSummary,
        claudeUsageSummary,
        openCodeUsageSummary,
        aiVaultTokenTotals
      }),
    [aiVaultTokenTotals, claudeUsageSummary, codexUsageSummary, openCodeUsageSummary, selectedAgent]
  )
  const summary = useMemo(
    () =>
      buildComposerUsageSummary({
        selectedAgent,
        usageSummary,
        rateLimits
      }),
    [rateLimits, selectedAgent, usageSummary]
  )
  const aiVaultAgent = usageSummary.provider === 'ai-vault' ? usageSummary.agent : null

  useEffect(() => {
    if (open) {
      void refreshRateLimits?.()
      switch (usageSummary.provider) {
        case 'codex':
          void fetchCodexUsage?.({ forceRefresh: true })
          break
        case 'claude':
          void fetchClaudeUsage?.({ forceRefresh: true })
          break
        case 'opencode':
          void fetchOpenCodeUsage?.({ forceRefresh: true })
          break
        case 'ai-vault':
          if (!aiVaultAgent) {
            break
          }
          // Why: AI Vault owns transcript scans for CLI agents without a
          // dedicated usage store, so the composer must not borrow Codex totals.
          void fetchAiVaultTotalForAgent(aiVaultAgent)
            .then((totalTokens) => {
              setAiVaultTokenTotals((current) => ({
                ...current,
                [aiVaultAgent]: totalTokens
              }))
            })
            .catch((error) => {
              console.error('Failed to fetch AI Vault usage for composer:', error)
            })
          break
        case 'untracked':
          break
      }
    }
  }, [
    fetchClaudeUsage,
    fetchCodexUsage,
    fetchOpenCodeUsage,
    open,
    refreshRateLimits,
    aiVaultAgent,
    usageSummary.provider
  ])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 gap-2 rounded-lg px-3 text-xs"
          aria-label={translate(
            'auto.components.agentWorkspace.composer.usageAndContext',
            'Usage and context'
          )}
        >
          <Gauge className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="hidden text-muted-foreground sm:inline">
            {translate('auto.components.agentWorkspace.composer.context', 'Context')}
          </span>
          <span className="font-medium text-foreground">{summary.contextLabel}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={10}
        className="w-[min(92vw,420px)] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
      >
        <div className="space-y-4 p-4">
          <section
            className="space-y-3"
            aria-label={translate(
              'auto.components.agentWorkspace.composer.contextWindow',
              'Context window'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">
                {translate(
                  'auto.components.agentWorkspace.composer.contextWindow',
                  'Context window'
                )}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {summary.contextLabel}
                {summary.contextPercent === null ? '' : ` (${summary.contextPercent.toFixed(1)}%)`}
              </span>
            </div>
            <UsageBar percent={summary.contextPercent} />
            <div className="space-y-2">
              {summary.contextRows.map((row) => (
                <UsageRow key={row.label} row={row} />
              ))}
            </div>
          </section>

          <div className="h-px bg-border" />

          <section
            className="space-y-3"
            aria-label={translate(
              'auto.components.agentWorkspace.composer.usageRemaining',
              'Usage remaining'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">
                  {translate(
                    'auto.components.agentWorkspace.composer.usageRemaining',
                    'Usage remaining'
                  )}
                </h2>
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {statusLabel(summary.providerStatus)}
                </span>
              </div>
              <Activity className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {summary.remainingRows.map((row) => (
                <UsageRemainingCard key={row.label} row={row} />
              ))}
            </div>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getUsageSummaryForAgent({
  selectedAgent,
  codexUsageSummary,
  claudeUsageSummary,
  openCodeUsageSummary,
  aiVaultTokenTotals
}: {
  selectedAgent: TuiAgent | null
  codexUsageSummary: CodexUsageSummary | null
  claudeUsageSummary: ClaudeUsageSummary | null
  openCodeUsageSummary: OpenCodeUsageSummary | null
  aiVaultTokenTotals: Partial<Record<AiVaultAgent, number>>
}): ComposerAgentUsageSummary {
  switch (selectedAgent) {
    case 'codex':
      return { provider: 'codex', summary: codexUsageSummary }
    case 'claude':
    case 'claude-agent-teams':
    case 'openclaude':
      return { provider: 'claude', summary: claudeUsageSummary }
    case 'opencode':
    case 'omp':
      return { provider: 'opencode', summary: openCodeUsageSummary }
    default:
      return getAiVaultSummaryForAgent(selectedAgent, aiVaultTokenTotals)
  }
}

function getAiVaultSummaryForAgent(
  selectedAgent: TuiAgent | null,
  aiVaultTokenTotals: Partial<Record<AiVaultAgent, number>>
): ComposerAgentUsageSummary {
  const aiVaultAgent = getAiVaultAgent(selectedAgent)
  if (aiVaultAgent) {
    return {
      provider: 'ai-vault',
      agent: aiVaultAgent,
      totalTokens: aiVaultTokenTotals[aiVaultAgent] ?? null
    }
  }
  return { provider: 'untracked', summary: null }
}

function getAiVaultAgent(selectedAgent: TuiAgent | null): AiVaultAgent | null {
  if (!selectedAgent) {
    return null
  }
  return (AI_VAULT_AGENTS as readonly string[]).includes(selectedAgent)
    ? (selectedAgent as AiVaultAgent)
    : null
}

async function fetchAiVaultTotalForAgent(agent: AiVaultAgent): Promise<number> {
  const sessions = await window.api?.aiVault?.listSessions?.({ force: true, limit: 500 })
  if (!sessions || !Array.isArray(sessions.sessions)) {
    return 0
  }

  return sessions.sessions
    .filter((session: AiVaultSession) => session.agent === agent)
    .reduce((total: number, session: AiVaultSession) => total + Math.max(0, session.totalTokens), 0)
}

function UsageRow({ row }: { row: ComposerUsageMeter }): React.JSX.Element {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <span className="size-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
        <span className="truncate">{row.label}</span>
      </div>
      <span className="font-mono text-[11px] text-foreground">{row.value}</span>
    </div>
  )
}

function UsageRemainingCard({ row }: { row: ComposerUsageMeter }): React.JSX.Element {
  return (
    <div className="min-w-0 space-y-2">
      <div className="space-y-0.5">
        <p className="truncate text-xs font-medium">{row.label}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {row.value}
          {row.detail ? ` · ${row.detail}` : ''}
        </p>
      </div>
      <UsageBar percent={row.percent} compact />
    </div>
  )
}

function UsageBar({
  percent,
  compact = false
}: {
  percent: number | null
  compact?: boolean
}): React.JSX.Element {
  return (
    <div
      className={
        compact
          ? 'h-1.5 overflow-hidden rounded-full bg-muted'
          : 'h-2 overflow-hidden rounded-full bg-muted'
      }
      aria-hidden="true"
    >
      <div
        className={percent === null ? 'h-full w-0 bg-muted-foreground/30' : 'h-full bg-primary'}
        style={{ width: `${percent ?? 0}%` }}
      />
    </div>
  )
}

function statusLabel(status: string): string {
  switch (status) {
    case 'ok':
      return translate('auto.components.agentWorkspace.composer.usageLive', 'Live')
    case 'fetching':
      return translate('auto.components.agentWorkspace.composer.refreshing', 'Refreshing')
    case 'error':
      return translate('auto.components.agentWorkspace.composer.needsCheck', 'Needs check')
    case 'unavailable':
      return translate('auto.components.agentWorkspace.composer.unavailable', 'Unavailable')
    default:
      return translate('auto.components.agentWorkspace.composer.local', 'Local')
  }
}
