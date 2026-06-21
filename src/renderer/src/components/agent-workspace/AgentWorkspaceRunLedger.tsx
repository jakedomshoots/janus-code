import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Files,
  type LucideIcon,
  PlayCircle,
  ShieldQuestion,
  TerminalSquare
} from 'lucide-react'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceRunEvent } from './agent-workspace-types'
import { AgentCommandRiskBadge } from './AgentCommandRiskBadge'
import { AgentProtectedResourcePolicyBadges } from './AgentProtectedResourcePolicyBadges'

const MAX_VISIBLE_RUN_EVENTS = 6

export function AgentWorkspaceRunLedger({
  runEvents,
  changedFileCount
}: {
  runEvents: readonly AgentWorkspaceRunEvent[]
  changedFileCount: number
}): React.JSX.Element {
  const evidenceEvents = [
    ...runEvents,
    getChangedFilesRunEvent(changedFileCount),
    ...(runEvents.some((event) => event.kind === 'verification') ? [] : [getVerificationRunEvent()])
  ]
  const visibleEvents = evidenceEvents.slice(0, MAX_VISIBLE_RUN_EVENTS)
  const hiddenCount = Math.max(0, evidenceEvents.length - visibleEvents.length)

  return (
    <section
      className="min-w-0"
      aria-label={translate('auto.components.agentWorkspace.rightPanel.runLedger', 'Run ledger')}
    >
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.rightPanel.runLedger', 'Run ledger')}
        </h2>
        {hasPartialTelemetry(evidenceEvents) ? (
          <span className="ml-auto rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.rightPanel.partialTelemetry',
              'Partial telemetry'
            )}
          </span>
        ) : null}
      </div>
      {visibleEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.rightPanel.noRunEventsYet',
            'Run evidence will appear as the agent reports activity.'
          )}
        </p>
      ) : (
        <div className="space-y-1">
          {visibleEvents.map((event) => (
            <RunLedgerRow key={event.id} event={event} />
          ))}
          {hiddenCount > 0 ? (
            <div className="px-8 pt-1 text-xs text-muted-foreground">
              {translate(
                'auto.components.agentWorkspace.rightPanel.showMoreRunEvents',
                'Show {{count}} more',
                {
                  count: hiddenCount
                }
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function getChangedFilesRunEvent(changedFileCount: number): AgentWorkspaceRunEvent {
  return {
    id: 'run-ledger:changed-files',
    threadId: 'run-ledger',
    kind: 'files',
    title: translate('auto.components.agentWorkspace.rightPanel.changedFiles', 'Changed files'),
    detail:
      changedFileCount === 1
        ? translate('auto.components.agentWorkspace.rightPanel.oneFileChanged', '1 file changed')
        : translate(
            'auto.components.agentWorkspace.rightPanel.changedFileCount',
            '{{count}} files changed',
            {
              count: changedFileCount
            }
          ),
    createdAt: null,
    status: changedFileCount > 0 ? 'unknown' : 'done',
    telemetry: 'partial'
  }
}

function getVerificationRunEvent(): AgentWorkspaceRunEvent {
  return {
    id: 'run-ledger:verification',
    threadId: 'run-ledger',
    kind: 'verification',
    title: translate(
      'auto.components.agentWorkspace.rightPanel.verificationUnknown',
      'Verification unknown'
    ),
    detail: translate(
      'auto.components.agentWorkspace.rightPanel.noVerificationObserved',
      'No verification command has been observed for this run.'
    ),
    createdAt: null,
    status: 'unknown',
    telemetry: 'partial'
  }
}

function hasPartialTelemetry(runEvents: readonly AgentWorkspaceRunEvent[]): boolean {
  return runEvents.some((event) => event.telemetry === 'partial')
}

function RunLedgerRow({ event }: { event: AgentWorkspaceRunEvent }): React.JSX.Element {
  const Icon = getRunLedgerIcon(event)
  return (
    <div className="flex min-h-10 min-w-0 items-center gap-3 rounded-xl px-1.5 py-1 text-sm text-foreground transition-colors hover:bg-background/70">
      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="truncate font-medium">{event.title}</div>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {formatRunEventStatus(event.status)}
          </span>
          {event.risk ? <AgentCommandRiskBadge risk={event.risk} /> : null}
          <AgentProtectedResourcePolicyBadges matches={event.protectedResourcePolicyMatches} />
        </div>
        <div className="truncate text-xs text-muted-foreground" title={event.detail}>
          {event.detail}
        </div>
      </div>
    </div>
  )
}

function getRunLedgerIcon(event: AgentWorkspaceRunEvent): LucideIcon {
  switch (event.kind) {
    case 'state':
      return event.status === 'done' ? CheckCircle2 : PlayCircle
    case 'tool':
      return TerminalSquare
    case 'approval':
      return ShieldQuestion
    case 'error':
      return AlertCircle
    case 'files':
      return Files
    case 'telemetry':
      return CircleDashed
    case 'verification':
      return CircleDashed
  }
}

function formatRunEventStatus(status: AgentWorkspaceRunEvent['status']): string {
  switch (status) {
    case 'pending':
      return translate('auto.components.agentWorkspace.rightPanel.runStatusPending', 'Pending')
    case 'running':
      return translate('auto.components.agentWorkspace.rightPanel.runStatusRunning', 'Running')
    case 'done':
      return translate('auto.components.agentWorkspace.rightPanel.runStatusDone', 'Done')
    case 'failed':
      return translate('auto.components.agentWorkspace.rightPanel.runStatusFailed', 'Failed')
    case 'unknown':
      return translate('auto.components.agentWorkspace.rightPanel.runStatusUnknown', 'Unknown')
  }
}
