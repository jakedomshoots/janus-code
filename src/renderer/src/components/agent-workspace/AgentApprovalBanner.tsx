import { AlertTriangle, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceApproval, AgentWorkspaceThread } from './agent-workspace-types'
import { useAgentWorkspaceApprovalResponse } from './useAgentWorkspaceApprovalResponse'
import { AgentCommandRiskBadge } from './AgentCommandRiskBadge'

export function AgentApprovalBanner({
  thread,
  approval,
  terminalAvailable,
  onOpenTerminalDrawer
}: {
  thread: AgentWorkspaceThread
  approval: AgentWorkspaceApproval
  terminalAvailable: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const { approvalFeedback, approvalBusy, canRespondInTerminal, handleApprovalDecision } =
    useAgentWorkspaceApprovalResponse({
      thread,
      terminalAvailable,
      onOpenTerminalDrawer
    })

  const approvalTitle =
    approval.title ??
    translate('auto.components.agentWorkspace.layout.approvalRequest', 'Approval request')

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">
              {translate(
                'auto.components.agentWorkspace.layout.approvalBannerTitle',
                'Agent needs your approval'
              )}
            </p>
            <p className="truncate text-sm text-muted-foreground">{approvalTitle}</p>
            {approval.risk ? <AgentCommandRiskBadge risk={approval.risk} /> : null}
            {approval.fallbackText ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">{approval.fallbackText}</p>
            ) : null}
            {approvalFeedback ? (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {approvalFeedback}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!canRespondInTerminal || approvalBusy}
            onClick={() => void handleApprovalDecision('approve')}
          >
            <Check className="size-3.5" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.approve', 'Approve')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canRespondInTerminal || approvalBusy}
            onClick={() => void handleApprovalDecision('deny')}
          >
            <X className="size-3.5" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.deny', 'Deny')}
          </Button>
        </div>
      </div>
    </div>
  )
}
