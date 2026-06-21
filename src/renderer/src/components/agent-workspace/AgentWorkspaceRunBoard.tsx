import { AlertTriangle, CheckCircle2, Clock3, PlayCircle, RadioTower } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import type {
  AgentRunBoardGroup,
  AgentRunBoardGroupId,
  AgentRunBoardRow
} from './agent-run-board-selectors'

type AgentWorkspaceRunBoardProps = {
  groups: readonly AgentRunBoardGroup[]
  activeWorktreeId: string | null
  onOpenRun: (row: AgentRunBoardRow) => void
}

export function AgentWorkspaceRunBoard({
  groups,
  activeWorktreeId,
  onOpenRun
}: AgentWorkspaceRunBoardProps): React.JSX.Element | null {
  const visibleGroups = groups.filter((group) => group.rows.length > 0)
  if (visibleGroups.length === 0) {
    return null
  }

  return (
    <section
      className="shrink-0 border-b border-border/70 bg-muted/20 px-4 py-2"
      aria-label={translate('auto.components.agentWorkspace.runBoard.title', 'Agent run board')}
    >
      <div className="scrollbar-sleek flex min-w-0 gap-3 overflow-x-auto">
        {visibleGroups.map((group) => (
          <div key={group.id} className="min-w-[14rem] max-w-[18rem] flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <RunBoardGroupIcon groupId={group.id} />
                {formatRunBoardGroupLabel(group.id)}
              </span>
              <span className="tabular-nums">{group.rows.length}</span>
            </div>
            <div className="grid gap-1">
              {group.rows.map((row) => (
                <button
                  key={row.threadId}
                  type="button"
                  className={cn(
                    'min-h-[4.25rem] rounded-lg border bg-background px-2.5 py-2 text-left transition-colors hover:border-ring/45 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
                    row.worktreeId === activeWorktreeId
                      ? 'border-border'
                      : 'border-dashed border-border/80'
                  )}
                  aria-label={translate(
                    'auto.components.agentWorkspace.runBoard.openRun',
                    'Open run: {{title}}',
                    { title: row.title }
                  )}
                  onClick={() => onOpenRun(row)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <AgentIcon agent={agentTypeToIconAgent(row.agentKind)} size={14} />
                    <span className="truncate text-xs font-medium text-foreground">
                      {row.title}
                    </span>
                  </span>
                  <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="truncate">{row.projectName}</span>
                    {row.branchName ? <span className="truncate">/ {row.branchName}</span> : null}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    {row.currentStep}
                  </span>
                  <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
                    <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                      {formatAgentTypeLabel(row.agentKind)}
                    </Badge>
                    {row.changedFileCount > 0 ? (
                      <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                        {translate(
                          'auto.components.agentWorkspace.runBoard.changedFiles',
                          '{{count}} files',
                          { count: row.changedFileCount }
                        )}
                      </Badge>
                    ) : null}
                    {row.limitedTelemetry ? (
                      <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                        {translate(
                          'auto.components.agentWorkspace.runBoard.limitedTelemetry',
                          'Limited telemetry'
                        )}
                      </Badge>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RunBoardGroupIcon({ groupId }: { groupId: AgentRunBoardGroupId }): React.JSX.Element {
  const Icon =
    groupId === 'running'
      ? PlayCircle
      : groupId === 'waiting'
        ? Clock3
        : groupId === 'review-ready'
          ? RadioTower
          : groupId === 'failed'
            ? AlertTriangle
            : CheckCircle2
  return <Icon className="size-3.5" aria-hidden="true" />
}

function formatRunBoardGroupLabel(groupId: AgentRunBoardGroupId): string {
  switch (groupId) {
    case 'running':
      return translate('auto.components.agentWorkspace.runBoard.running', 'Running')
    case 'waiting':
      return translate('auto.components.agentWorkspace.runBoard.waiting', 'Waiting')
    case 'review-ready':
      return translate('auto.components.agentWorkspace.runBoard.reviewReady', 'Review-ready')
    case 'failed':
      return translate('auto.components.agentWorkspace.runBoard.failed', 'Failed')
    case 'done':
      return translate('auto.components.agentWorkspace.runBoard.done', 'Done')
  }
}
