import { FileText, Info, ListChecks, Terminal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'
import { formatAgentWorkspaceDiffStatus, formatAgentWorkspacePhase } from './agent-workspace-labels'
import {
  coerceAgentWorkspaceRightPanelTab,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'

export function AgentWorkspaceRightPanel({
  thread,
  diffs,
  terminalAvailable,
  selectedTab,
  onSelectedTabChange
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  terminalAvailable: boolean
  selectedTab: AgentWorkspaceRightPanelTab
  onSelectedTabChange: (tab: AgentWorkspaceRightPanelTab) => void
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plan">
            {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
          </TabsTrigger>
          <TabsTrigger value="diff">
            {translate('auto.components.agentWorkspace.layout.diff', 'Diff')}
          </TabsTrigger>
          <TabsTrigger value="terminal">
            {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
          </TabsTrigger>
          <TabsTrigger value="details">
            {translate('auto.components.agentWorkspace.layout.details', 'Details')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-3 min-h-0">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="size-4" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.plan', 'Plan')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {thread
                ? translate(
                    'auto.components.agentWorkspace.layout.agentIsPhaseOnThread',
                    '{{agentKind}} is {{phase}} on {{title}}.',
                    {
                      agentKind: thread.agentKind,
                      phase: formatAgentWorkspacePhase(thread.phase),
                      title: thread.title
                    }
                  )
                : translate(
                    'auto.components.agentWorkspace.layout.selectThreadPlan',
                    'Select a thread to inspect its plan.'
                  )}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="diff" className="mt-3 min-h-0" forceMount>
          <div className="space-y-2">
            {diffs.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.noDiffSummaryYet',
                  'No diff summary yet.'
                )}
              </div>
            ) : (
              diffs.map((diff) => (
                <div key={diff.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="size-4" aria-hidden="true" />
                    <span className="min-w-0 truncate">{diff.filePath}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    +{diff.additions} / -{diff.deletions} ·{' '}
                    {formatAgentWorkspaceDiffStatus(diff.status)}
                  </div>
                </div>
              ))
            )}
          </div>
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
