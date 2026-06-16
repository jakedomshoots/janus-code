import { Info, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceApproval,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { AgentDiffPanel } from './AgentDiffPanel'
import { AgentPlanPanel } from './AgentPlanPanel'
import { AgentReviewPanel } from './AgentReviewPanel'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import {
  coerceAgentWorkspaceRightPanelTab,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

export function AgentWorkspaceRightPanel({
  thread,
  plan,
  approval,
  diffs,
  review,
  terminalAvailable,
  selectedTab,
  onSelectedTabChange,
  onOpenDiff,
  onOpenTerminalDrawer
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  terminalAvailable: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-muted/20 p-3">
      <Tabs
        value={selectedTab}
        onValueChange={(value) => {
          const tab = coerceAgentWorkspaceRightPanelTab(value)
          if (tab) {
            onSelectedTabChange(tab)
          }
        }}
        className="min-h-0 flex-1"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="plan">
            {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
          </TabsTrigger>
          <TabsTrigger value="diff">
            {translate('auto.components.agentWorkspace.layout.diff', 'Diff')}
          </TabsTrigger>
          <TabsTrigger value="review">
            {translate('auto.components.agentWorkspace.layout.review', 'Review')}
          </TabsTrigger>
          <TabsTrigger value="terminal">
            {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
          </TabsTrigger>
          <TabsTrigger value="details">
            {translate('auto.components.agentWorkspace.layout.details', 'Details')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-3 min-h-0">
          <AgentPlanPanel thread={thread} plan={plan} />
        </TabsContent>
        <TabsContent value="diff" className="mt-3 min-h-0" forceMount>
          <AgentDiffPanel diffs={diffs} onOpenDiff={onOpenDiff} />
        </TabsContent>
        <TabsContent value="review" className="mt-3 min-h-0" forceMount>
          <AgentReviewPanel review={review} />
        </TabsContent>
        <TabsContent value="terminal" className="mt-3 min-h-0" forceMount>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="size-4" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {terminalAvailable
                ? translate(
                    'auto.components.agentWorkspace.layout.terminalSessionAvailable',
                    'Terminal session is available as a debug panel.'
                  )
                : translate(
                    'auto.components.agentWorkspace.layout.noTerminalSessionAttached',
                    'No terminal session is attached to this workspace.'
                  )}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              disabled={!terminalAvailable || typeof onOpenTerminalDrawer !== 'function'}
              onClick={() => onOpenTerminalDrawer?.('right-panel')}
            >
              <Terminal className="size-3.5" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.openTerminalDrawer', 'Open drawer')}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="details" className="mt-3 min-h-0" forceMount>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="size-4" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.details', 'Details')}
            </div>
            {thread ? (
              <div className="mt-3 space-y-2 text-sm">
                {thread.phase === 'needs-approval' ? (
                  <p className="text-muted-foreground">
                    {translate(
                      'auto.components.agentWorkspace.layout.threadNeedsApproval',
                      'This thread needs approval before it can continue.'
                    )}
                  </p>
                ) : null}
                {approval ? (
                  <div className="space-y-2 border-l border-amber-500/60 pl-3">
                    <div className="text-xs font-medium text-foreground">
                      {approval.title ??
                        translate(
                          'auto.components.agentWorkspace.layout.approvalRequest',
                          'Approval request'
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{approval.fallbackText}</p>
                    {approval.description ? (
                      <p className="text-xs text-muted-foreground">{approval.description}</p>
                    ) : null}
                    {approval.toolName || approval.toolInput ? (
                      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
                        {approval.toolName ? (
                          <>
                            <span className="text-muted-foreground">
                              {translate('auto.components.agentWorkspace.layout.tool', 'Tool')}
                            </span>
                            <span className="min-w-0 truncate text-foreground">
                              {approval.toolName}
                            </span>
                          </>
                        ) : null}
                        {approval.toolInput ? (
                          <>
                            <span className="text-muted-foreground">
                              {translate(
                                'auto.components.agentWorkspace.layout.request',
                                'Request'
                              )}
                            </span>
                            <span className="min-w-0 truncate text-foreground">
                              {approval.toolInput}
                            </span>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    {translate('auto.components.agentWorkspace.layout.agent', 'Agent')}
                  </span>
                  <span className="min-w-0 truncate text-foreground">{thread.agentKind}</span>
                  <span className="text-muted-foreground">
                    {translate('auto.components.agentWorkspace.layout.phase', 'Phase')}
                  </span>
                  <span className="min-w-0 truncate text-foreground">
                    {formatAgentWorkspacePhase(thread.phase)}
                  </span>
                  <span className="text-muted-foreground">
                    {translate('auto.components.agentWorkspace.layout.branch', 'Branch')}
                  </span>
                  <span className="min-w-0 truncate text-foreground">
                    {thread.branchName ??
                      translate('auto.components.agentWorkspace.layout.noBranch', 'No branch')}
                  </span>
                  <span className="text-muted-foreground">
                    {translate(
                      'auto.components.agentWorkspace.layout.workingDirectory',
                      'Working directory'
                    )}
                  </span>
                  <span className="min-w-0 truncate text-foreground">
                    {thread.cwd ??
                      translate(
                        'auto.components.agentWorkspace.layout.noWorkingDirectory',
                        'No working directory'
                      )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.selectThreadDetails',
                  'Select a thread to inspect its details.'
                )}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
