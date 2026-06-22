import { useMemo, useState } from 'react'
import { SearchCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
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
import {
  EmptyPanelState,
  InfoSection,
  ItemList,
  PanelTabs,
  SectionDivider,
  SourceGlyphRow
} from './agent-workspace-right-panel-sections'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { useAgentWorkspaceApprovalResponse } from './useAgentWorkspaceApprovalResponse'
import { AgentWorkspaceRightPanelChanges } from './AgentWorkspaceRightPanelChanges'
import { PanelSummary, PlanProgress } from './AgentWorkspaceRightPanelSummary'
import { AgentWorkspaceRunLedger } from './AgentWorkspaceRunLedger'
import { AgentWorkspaceMemoryInspector } from './AgentWorkspaceMemoryInspector'
import type { AgentReviewOnlyLaunchSurface } from './agent-review-only-launch'
import type { AgentReviewFinding } from './agent-review-findings'
import type { MemorySnapshot } from '../../../../shared/types'
import { buildAgentRunReplayMarkdown } from './agent-run-replay-export'
import {
  ApprovalActions,
  ReviewFindingsList,
  RunReplayExportAction
} from './AgentWorkspaceRightPanelActions'

const EMPTY_AGENT_TIMELINE: readonly AgentWorkspaceTimelineEntry[] = []
const EMPTY_REVIEW_FINDINGS: readonly AgentReviewFinding[] = []

export function AgentWorkspaceRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  runEvents,
  timeline = EMPTY_AGENT_TIMELINE,
  runReplayContext = null,
  review,
  reviewFindings = EMPTY_REVIEW_FINDINGS,
  sourceControlBusy,
  sourceControlError,
  reviewOnlyWarning = null,
  memorySnapshot = null,
  memorySnapshotError = null,
  terminalAvailable,
  selectedTab,
  onSelectedTabChange,
  onStageDiff,
  onUnstageDiff,
  onDiscardDiff,
  onCommitStaged,
  onLaunchReviewOnly,
  onOpenTerminalDrawer
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
}): React.JSX.Element {
  const [replayCopyStatus, setReplayCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
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
  const runReplayMarkdown = useMemo(
    () =>
      buildAgentRunReplayMarkdown({
        project,
        thread,
        timeline,
        runEvents,
        diffs,
        approvals: approval ? [approval] : [],
        replayContext: runReplayContext,
        exportedAt: new Date().toISOString()
      }),
    [approval, diffs, project, runEvents, runReplayContext, thread, timeline]
  )

  async function handleCopyRunReplay(): Promise<void> {
    if (!thread) {
      return
    }
    try {
      await window.api.ui.writeClipboardText(runReplayMarkdown)
      setReplayCopyStatus('copied')
    } catch {
      setReplayCopyStatus('failed')
    }
  }

  return (
    <aside className="agent-workspace-right-panel pointer-events-none relative z-10 w-[clamp(18rem,32%,22rem)] shrink-0">
      <div className="agent-workspace-right-panel-shell pointer-events-auto sticky top-4 mx-3 mt-4 flex max-h-[calc(100vh-7rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/95 p-4 text-card-foreground shadow-xs transition-[border-color,box-shadow,transform]">
        <PanelSummary
          thread={thread}
          plan={plan}
          diffs={diffs}
          sources={model.sources.length}
          subagents={model.subagents.length}
        />
        <PanelTabs
          selectedTab={selectedTab}
          diffs={diffs.length}
          hasPlan={plan !== null}
          hasReview={review !== null || reviewFindings.length > 0}
          onSelectedTabChange={onSelectedTabChange}
        />
        <ApprovalActions
          approval={approval}
          canRespondInTerminal={canRespondInTerminal}
          approvalBusy={approvalBusy}
          approvalFeedback={approvalFeedback}
          onDecision={handleApprovalDecision}
        />
        <div className="scrollbar-sleek mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div
            role="tabpanel"
            aria-label={translate(
              'auto.components.agentWorkspace.rightPanel.tabPanel',
              '{{tab}} panel',
              {
                tab: selectedTab
              }
            )}
          >
            {selectedTab === 'plan' ? (
              <>
                <PlanProgress plan={plan} />
                <InfoSection
                  title={translate('auto.components.agentWorkspace.rightPanel.outputs', 'Outputs')}
                  emptyLabel={translate(
                    'auto.components.agentWorkspace.rightPanel.noOutputsYet',
                    'No outputs yet'
                  )}
                >
                  <ItemList items={model.outputs} iconKind="output" />
                </InfoSection>
              </>
            ) : null}
            {selectedTab === 'diff' ? (
              <>
                {diffs.length > 0 ? (
                  <AgentWorkspaceRightPanelChanges
                    diffs={diffs}
                    sourceControlBusy={sourceControlBusy}
                    sourceControlError={sourceControlError}
                    reviewOnlyWarning={reviewOnlyWarning}
                    onLaunchReviewOnly={
                      onLaunchReviewOnly ? () => onLaunchReviewOnly('diff') : undefined
                    }
                    onStageDiff={onStageDiff}
                    onUnstageDiff={onUnstageDiff}
                    onDiscardDiff={onDiscardDiff}
                    onCommitStaged={onCommitStaged}
                  />
                ) : (
                  <EmptyPanelState
                    title={translate(
                      'auto.components.agentWorkspace.rightPanel.noChanges',
                      'No changes'
                    )}
                    detail={translate(
                      'auto.components.agentWorkspace.rightPanel.noChangesDetail',
                      'Git changes from Janus Code source control will appear here.'
                    )}
                  />
                )}
              </>
            ) : null}
            {selectedTab === 'review' ? (
              <InfoSection
                title={translate('auto.components.agentWorkspace.rightPanel.review', 'Review')}
                emptyLabel={translate(
                  'auto.components.agentWorkspace.rightPanel.noReviewYet',
                  'No review yet'
                )}
              >
                <ReviewFindingsList findings={reviewFindings} />
                {review && onLaunchReviewOnly ? (
                  <div className="mb-3 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onLaunchReviewOnly('review')}
                    >
                      <SearchCheck className="size-3.5" aria-hidden="true" />
                      {translate(
                        'auto.components.agentWorkspace.reviewOnly.reviewOnly',
                        'Review only'
                      )}
                    </Button>
                    {reviewOnlyWarning ? (
                      <p className="text-xs text-muted-foreground">{reviewOnlyWarning}</p>
                    ) : null}
                  </div>
                ) : null}
                <ItemList
                  items={
                    review
                      ? [
                          {
                            id: review.id,
                            label: review.title,
                            detail: `${review.providerLabel} #${review.number} · ${review.state}`
                          }
                        ]
                      : []
                  }
                  iconKind="output"
                />
              </InfoSection>
            ) : null}
            {selectedTab === 'details' ? (
              <>
                <RunReplayExportAction
                  disabled={!thread}
                  status={replayCopyStatus}
                  onCopy={handleCopyRunReplay}
                />
                <SectionDivider />
                <AgentWorkspaceRunLedger runEvents={runEvents} changedFileCount={diffs.length} />
                <SectionDivider />
                <InfoSection
                  title={translate(
                    'auto.components.agentWorkspace.rightPanel.subagents',
                    'Subagents'
                  )}
                  emptyLabel={translate(
                    'auto.components.agentWorkspace.rightPanel.noActiveSubagents',
                    'No active subagents'
                  )}
                >
                  <ItemList items={model.subagents} iconKind="subagent" />
                </InfoSection>
                <SectionDivider />
                <InfoSection
                  title={translate('auto.components.agentWorkspace.rightPanel.sources', 'Sources')}
                  emptyLabel={translate(
                    'auto.components.agentWorkspace.rightPanel.noSourcesAttached',
                    'No sources attached'
                  )}
                >
                  <ItemList items={model.sources} iconKind="source" />
                  <SourceGlyphRow sources={model.sources} />
                </InfoSection>
                <SectionDivider />
                <AgentWorkspaceMemoryInspector
                  project={project}
                  snapshot={memorySnapshot}
                  error={memorySnapshotError}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  )
}
