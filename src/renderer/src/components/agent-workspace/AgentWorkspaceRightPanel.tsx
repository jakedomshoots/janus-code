import { Bot, FileDiff, FolderGit2, GitBranch, ListChecks, X, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceRunEvent,
  AgentWorkspaceRunReplayContext,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelTab } from './agent-workspace-right-panel-state'
import { buildAgentWorkspaceRightCardModel } from './agent-workspace-right-card-model'
import { SourceGlyphRow } from './agent-workspace-right-panel-sections'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { useAgentWorkspaceApprovalResponse } from './useAgentWorkspaceApprovalResponse'
import type { AgentReviewOnlyLaunchSurface } from './agent-review-only-launch'
import type { AgentReviewFinding } from './agent-review-findings'
import type { MemorySnapshot } from '../../../../shared/types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import { ApprovalActions } from './AgentWorkspaceRightPanelActions'

export function AgentWorkspaceRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  review,
  terminalAvailable,
  onOpenTerminalDrawer,
  onCollapse
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  runEvents: readonly AgentWorkspaceRunEvent[]
  timeline?: readonly AgentWorkspaceTimelineEntry[]
  runReplayContext?: AgentWorkspaceRunReplayContext | null
  review: AgentWorkspaceReviewSummary | null
  reviewFindings?: readonly AgentReviewFinding[]
  sourceControlBusy?: boolean
  sourceControlError?: string | null
  reviewOnlyWarning?: string | null
  memorySnapshot?: MemorySnapshot | null
  memorySnapshotError?: string | null
  terminalAvailable: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
  onLaunchReviewOnly?: (source: AgentReviewOnlyLaunchSurface) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
  onCollapse?: () => void
}): React.JSX.Element {
  const { approvalFeedback, approvalBusy, canRespondInTerminal, handleApprovalDecision } =
    useAgentWorkspaceApprovalResponse({
      thread,
      terminalAvailable,
      onOpenTerminalDrawer
    })
  const model = buildAgentWorkspaceRightCardModel({
    project,
    thread,
    threads,
    plan,
    approval,
    diffs,
    review
  })

  return (
    <aside className="agent-workspace-right-panel pointer-events-none relative z-10 flex min-h-0 w-[clamp(16rem,24vw,18.5rem)] shrink-0 items-start">
      {/* Bound the floating card to the workspace row because boards above it can grow. */}
      <div className="agent-workspace-right-panel-shell pointer-events-auto sticky top-4 mx-3 mt-4 flex max-h-[min(24rem,calc(100vh_-_8rem))] min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card/95 p-3 text-card-foreground shadow-xs transition-[border-color,box-shadow,transform]">
        {onCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-2 z-10 text-muted-foreground hover:text-foreground"
            aria-label={translate(
              'auto.components.agentWorkspace.rightPanel.hideDetails',
              'Hide details'
            )}
            title={translate(
              'auto.components.agentWorkspace.rightPanel.hideDetails',
              'Hide details'
            )}
            onClick={onCollapse}
          >
            <X className="size-3.5" aria-hidden="true" />
          </Button>
        ) : null}

        <div className="mb-3 pr-6 text-sm font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment')}
        </div>

        <section
          className="rounded-xl border border-border bg-background/65 p-3"
          aria-label={translate(
            'auto.components.agentWorkspace.rightPanel.sessionSummary',
            'Session summary'
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
              <Bot className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {thread?.title ?? project?.label ?? 'Janus Code'}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {thread
                  ? `${formatAgentTypeLabel(thread.agentKind)} · ${formatAgentWorkspacePhase(
                      thread.phase
                    )}`
                  : translate(
                      'auto.components.agentWorkspace.rightPanel.readyForNewSession',
                      'Ready for a new session'
                    )}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <CompactEnvironmentRow
              icon={ListChecks}
              label={translate('auto.components.agentWorkspace.rightPanel.plan', 'Plan')}
              value={formatPlanSummary(plan)}
            />
            <CompactChangesRow diffs={diffs} />
            <CompactEnvironmentRow
              icon={FolderGit2}
              label={translate('auto.components.agentWorkspace.rightPanel.worktree', 'Worktree')}
              value={project?.label ?? translate('auto.common.none', 'None')}
            />
            <CompactEnvironmentRow
              icon={GitBranch}
              label={translate('auto.components.agentWorkspace.rightPanel.branch', 'Branch')}
              value={
                thread?.branchName ?? project?.branchName ?? translate('auto.common.none', 'None')
              }
            />
          </div>
        </section>

        <section
          className="mt-4"
          aria-label={translate('auto.components.agentWorkspace.rightPanel.sources', 'Sources')}
        >
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
            <span>{translate('auto.components.agentWorkspace.rightPanel.sources', 'Sources')}</span>
            <span className="text-xs font-normal">
              {translate(
                'auto.components.agentWorkspace.rightPanel.sourceCount',
                '{{count}} sources',
                {
                  count: model.sources.length
                }
              )}
            </span>
          </div>
          <SourceGlyphRow sources={model.sources} />
        </section>

        {approval ? (
          <div className="scrollbar-sleek mt-4 min-h-0 overflow-y-auto pr-1">
            {/* Approval prompts remain here because they unblock the active agent. */}
            <ApprovalActions
              approval={approval}
              canRespondInTerminal={canRespondInTerminal}
              approvalBusy={approvalBusy}
              approvalFeedback={approvalFeedback}
              onDecision={handleApprovalDecision}
            />
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function CompactEnvironmentRow({
  icon: Icon,
  label,
  value,
  valueNode
}: {
  icon: LucideIcon
  label: string
  value: string
  valueNode?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex h-8 min-w-0 items-center gap-2 rounded-lg px-1.5 text-sm text-foreground">
      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className="min-w-0 max-w-[9rem] truncate text-right text-muted-foreground"
        title={value}
      >
        {valueNode ?? value}
      </span>
    </div>
  )
}

function CompactChangesRow({
  diffs
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
}): React.JSX.Element {
  const totals = diffs.reduce(
    (summary, diff) => ({
      additions: summary.additions + diff.additions,
      deletions: summary.deletions + diff.deletions
    }),
    { additions: 0, deletions: 0 }
  )
  const value = translate(
    'auto.components.agentWorkspace.rightPanel.changeCount',
    '{{count}} changes',
    {
      count: diffs.length
    }
  )

  return (
    <CompactEnvironmentRow
      icon={FileDiff}
      label={translate('auto.components.agentWorkspace.rightPanel.changes', 'Changes')}
      value={value}
      valueNode={
        diffs.length === 0 ? (
          value
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1">
            <span style={{ color: 'var(--git-decoration-added)' }}>+{totals.additions}</span>
            <span style={{ color: 'var(--git-decoration-deleted)' }}>-{totals.deletions}</span>
          </span>
        )
      }
    />
  )
}

function formatPlanSummary(plan: AgentWorkspacePlan | null): string {
  if (!plan || plan.steps.length === 0) {
    return translate('auto.components.agentWorkspace.rightPanel.noPlan', 'No plan')
  }

  const completeSteps = plan.steps.filter((step) => step.status === 'completed').length
  return translate(
    'auto.components.agentWorkspace.rightPanel.stepProgress',
    '{{complete}}/{{total}} steps',
    {
      complete: completeSteps,
      total: plan.steps.length
    }
  )
}
