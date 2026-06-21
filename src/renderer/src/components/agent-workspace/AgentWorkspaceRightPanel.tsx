import { Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { AgentWorkspaceRightPanelTab } from './agent-workspace-right-panel-state'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import { buildAgentWorkspaceRightCardModel } from './agent-workspace-right-card-model'
import {
  EmptyPanelState,
  InfoSection,
  ItemList,
  SectionDivider,
  SourceGlyphRow
} from './agent-workspace-right-panel-sections'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { useAgentWorkspaceApprovalResponse } from './useAgentWorkspaceApprovalResponse'
import { AgentWorkspaceRightPanelChanges } from './AgentWorkspaceRightPanelChanges'
import { PlanProgress } from './AgentWorkspaceRightPanelSummary'
import { AgentWorkspaceMarkdownArtifactPreview } from './AgentWorkspaceMarkdownArtifactPreview'
import { clampAgentWorkspaceContextCardWidth } from './agent-workspace-right-panel-geometry'
import { AgentWorkspaceContextChannels } from './AgentWorkspaceContextChannels'

const DEFAULT_RIGHT_PANEL_WIDTH = 420

export function AgentWorkspaceRightPanel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  review,
  selectedMarkdownArtifact,
  sourceControlBusy,
  sourceControlError,
  terminalAvailable,
  selectedTab,
  onSelectedTabChange,
  onStageDiff,
  onUnstageDiff,
  onDiscardDiff,
  onCommitStaged,
  onOpenMarkdownArtifactInEditor,
  onOpenTerminalDrawer
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  selectedMarkdownArtifact?: AgentTimelineMarkdownArtifact | null
  sourceControlBusy?: boolean
  sourceControlError?: string | null
  terminalAvailable: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
  onOpenMarkdownArtifactInEditor?: (artifact: AgentTimelineMarkdownArtifact) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_RIGHT_PANEL_WIDTH)
  const panelRef = useRef<HTMLElement | null>(null)
  const resizeRef = useRef<{
    readonly startX: number
    readonly startWidth: number
  } | null>(null)
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

  useEffect(() => {
    function handlePointerMove(event: PointerEvent): void {
      const resize = resizeRef.current
      if (!resize) {
        return
      }
      const availableSurfaceWidth =
        panelRef.current?.parentElement?.getBoundingClientRect().width ?? window.innerWidth
      setPanelWidth(
        clampAgentWorkspaceContextCardWidth({
          requestedWidth: resize.startWidth + resize.startX - event.clientX,
          viewportWidth: window.innerWidth,
          availableSurfaceWidth
        })
      )
    }

    function handlePointerUp(): void {
      resizeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  function handleResizeStart(event: React.PointerEvent<HTMLButtonElement>): void {
    event.preventDefault()
    const availableSurfaceWidth =
      panelRef.current?.parentElement?.getBoundingClientRect().width ?? window.innerWidth
    resizeRef.current = {
      startX: event.clientX,
      startWidth: clampAgentWorkspaceContextCardWidth({
        requestedWidth: panelWidth,
        viewportWidth: window.innerWidth,
        availableSurfaceWidth
      })
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <aside
      ref={panelRef}
      className="agent-workspace-right-panel pointer-events-none absolute right-4 top-4 z-20 max-w-[calc(100%-2rem)]"
      style={{ width: panelWidth }}
    >
      <button
        type="button"
        className="pointer-events-auto absolute -left-2 top-3 z-20 h-[min(640px,calc(100vh-8rem))] w-2 cursor-col-resize rounded-full text-transparent outline-none transition-colors hover:bg-border/70 focus-visible:bg-ring"
        aria-label={translate(
          'auto.components.agentWorkspace.rightPanel.resizePanel',
          'Resize right panel'
        )}
        onPointerDown={handleResizeStart}
      />
      <div className="agent-workspace-right-panel-shell pointer-events-auto flex max-h-[min(680px,calc(100vh-7rem))] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-popover/95 p-4 text-popover-foreground shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur transition-[border-color,box-shadow,transform]">
        <AgentWorkspaceContextChannels
          thread={thread}
          project={project}
          plan={plan}
          diffs={diffs}
          sources={model.sources.length}
          subagents={model.subagents.length}
          selectedTab={selectedTab}
          hasReview={review !== null}
          hasDocument={selectedMarkdownArtifact !== null && selectedMarkdownArtifact !== undefined}
          onSelectedTabChange={onSelectedTabChange}
        />
        <div
          role="tabpanel"
          className="mt-3 min-h-0 flex-1 overflow-hidden border-t border-border pt-3"
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
          {selectedTab === 'document' ? (
            <AgentWorkspaceMarkdownArtifactPreview
              artifact={selectedMarkdownArtifact ?? null}
              thread={thread}
              onOpenInEditor={onOpenMarkdownArtifactInEditor}
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
