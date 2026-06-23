import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentWorkspaceEvidenceRail } from './AgentWorkspaceEvidenceRail'
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
import { PanelSummary, PlanProgress, ReviewModePanel } from './AgentWorkspaceRightPanelSummary'

export function AgentWorkspaceRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  allDiffs,
  review,
  reviews,
  timeline,
  sourceControlBusy,
  sourceControlError,
  terminalAvailable,
  browserAvailable,
  selectedTab,
  onSelectedTabChange,
  onSelectThread,
  onStageDiff,
  onUnstageDiff,
  onDiscardDiff,
  onCommitStaged,
  onOpenBrowserWorkbench,
  onReviewDiffs,
  onOpenTerminalDrawer
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  allDiffs?: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  reviews?: readonly AgentWorkspaceReviewSummary[]
  timeline?: readonly AgentWorkspaceTimelineEntry[]
  sourceControlBusy?: boolean
  sourceControlError?: string | null
  terminalAvailable: boolean
  browserAvailable?: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
  onSelectThread?: (threadId: string) => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
  onOpenBrowserWorkbench?: () => void
  onReviewDiffs?: () => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
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
    <aside className="agent-workspace-right-panel pointer-events-none absolute inset-y-0 right-0 z-10">
      <div className="agent-workspace-right-panel-shell pointer-events-auto mx-4 mt-4 flex max-h-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card/95 p-4 text-card-foreground shadow-xs transition-[border-color,box-shadow,transform]">
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
          hasReview={review !== null}
          onSelectedTabChange={onSelectedTabChange}
        />
        <div
          role="tabpanel"
          aria-label={translate(
            'auto.components.agentWorkspace.rightPanel.tabPanel',
            '{{tab}} panel',
            {
              tab: selectedTab
            }
          )}
          className="scrollbar-sleek min-h-0 flex-1 overflow-y-auto pr-1"
        >
          {selectedTab === 'info' ? (
            <AgentWorkspaceEvidenceRail
              project={project}
              thread={thread}
              threads={threads}
              plan={plan}
              approval={approval}
              diffs={diffs}
              allDiffs={allDiffs ?? diffs}
              review={review}
              reviews={reviews ?? (review ? [review] : [])}
              timeline={timeline ?? []}
              terminalAvailable={terminalAvailable}
              browserAvailable={browserAvailable === true}
              onSelectThread={onSelectThread}
              onOpenBrowserWorkbench={onOpenBrowserWorkbench}
              onOpenTerminalDrawer={onOpenTerminalDrawer}
              onReviewDiffs={onReviewDiffs}
            />
          ) : null}
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
            <ReviewModePanel
              thread={thread}
              diffs={diffs}
              review={review}
              timeline={timeline ?? []}
            />
          ) : null}
          {selectedTab === 'details' ? (
            <>
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
            </>
          ) : null}
        </div>
        <ApprovalActions
          approval={approval}
          canRespondInTerminal={canRespondInTerminal}
          approvalBusy={approvalBusy}
          approvalFeedback={approvalFeedback}
          onDecision={handleApprovalDecision}
        />
      </div>
    </aside>
  )
}

function ApprovalActions({
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
    <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
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
