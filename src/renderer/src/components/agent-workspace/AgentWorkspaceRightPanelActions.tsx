import { Check, Clipboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentCommandRiskBadge } from './AgentCommandRiskBadge'
import { AgentProtectedResourcePolicyBadges } from './AgentProtectedResourcePolicyBadges'
import type { AgentReviewFinding, AgentReviewFindingSeverity } from './agent-review-findings'
import type { AgentWorkspaceApproval } from './agent-workspace-types'

export function RunReplayExportAction({
  disabled,
  status,
  onCopy
}: {
  disabled: boolean
  status: 'idle' | 'copied' | 'failed'
  onCopy: () => void | Promise<void>
}): React.JSX.Element {
  return (
    <section
      className="min-w-0"
      aria-label={translate(
        'auto.components.agentWorkspace.rightPanel.runReplayExport',
        'Run replay export'
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.rightPanel.runReplayExport',
              'Run replay export'
            )}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {getRunReplayExportStatusLabel(status)}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onCopy}>
          {status === 'copied' ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Clipboard className="size-3.5" aria-hidden="true" />
          )}
          {translate('auto.components.agentWorkspace.rightPanel.copyReplay', 'Copy replay')}
        </Button>
      </div>
    </section>
  )
}

function getRunReplayExportStatusLabel(status: 'idle' | 'copied' | 'failed'): string {
  switch (status) {
    case 'idle':
      return translate(
        'auto.components.agentWorkspace.rightPanel.copyReplayDetail',
        'Copy a redacted Markdown report for handoff.'
      )
    case 'copied':
      return translate('auto.components.agentWorkspace.rightPanel.replayCopied', 'Replay copied.')
    case 'failed':
      return translate(
        'auto.components.agentWorkspace.rightPanel.replayCopyFailed',
        'Could not copy replay.'
      )
  }
}

export function ReviewFindingsList({
  findings
}: {
  findings: readonly AgentReviewFinding[]
}): React.JSX.Element | null {
  if (findings.length === 0) {
    return null
  }

  return (
    <section
      className="mb-4 min-w-0"
      aria-label={translate(
        'auto.components.agentWorkspace.reviewOnly.reviewFindings',
        'Review findings'
      )}
    >
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        {translate('auto.components.agentWorkspace.reviewOnly.reviewFindings', 'Review findings')}
      </h3>
      <div className="space-y-2">
        {findings.map((finding) => (
          <div
            key={finding.id}
            className="rounded-xl border border-border bg-background/70 p-3 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {formatReviewFindingSeverity(finding.severity)}
              </span>
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {formatReviewFindingLocation(finding)}
              </span>
            </div>
            <div className="mt-2 font-medium text-foreground">{finding.title}</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{finding.rationale}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatReviewFindingSeverity(severity: AgentReviewFindingSeverity): string {
  switch (severity) {
    case 'high':
      return translate('auto.components.agentWorkspace.reviewOnly.severityHigh', 'High')
    case 'medium':
      return translate('auto.components.agentWorkspace.reviewOnly.severityMedium', 'Medium')
    case 'low':
      return translate('auto.components.agentWorkspace.reviewOnly.severityLow', 'Low')
    case 'info':
      return translate('auto.components.agentWorkspace.reviewOnly.severityInfo', 'Info')
  }
}

function formatReviewFindingLocation(finding: AgentReviewFinding): string {
  return finding.lineNumber ? `${finding.filePath}:${finding.lineNumber}` : finding.filePath
}

export function ApprovalActions({
  approval,
  canRespondInTerminal,
  approvalBusy,
  approvalFeedback,
  onDecision
}: {
  approval: AgentWorkspaceApproval | null
  canRespondInTerminal: boolean
  approvalBusy: boolean
  approvalFeedback: string | null
  onDecision: (decision: 'approve' | 'deny') => void | Promise<void>
}): React.JSX.Element | null {
  if (approval?.status !== 'requested') {
    return null
  }

  return (
    <div className="mb-4 rounded-xl border border-border bg-background/60 p-3">
      {approval.risk || approval.protectedResourcePolicyMatches?.length ? (
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {approval.risk ? <AgentCommandRiskBadge risk={approval.risk} /> : null}
          <AgentProtectedResourcePolicyBadges matches={approval.protectedResourcePolicyMatches} />
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="flex-1"
          disabled={!canRespondInTerminal || approvalBusy}
          onClick={() => void onDecision('approve')}
        >
          <Check className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.rightPanel.approve', 'Approve')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={!canRespondInTerminal || approvalBusy}
          onClick={() => void onDecision('deny')}
        >
          <X className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.rightPanel.deny', 'Deny')}
        </Button>
      </div>
      {approvalFeedback ? (
        <p className="mt-2 text-xs text-muted-foreground">{approvalFeedback}</p>
      ) : null}
    </div>
  )
}
