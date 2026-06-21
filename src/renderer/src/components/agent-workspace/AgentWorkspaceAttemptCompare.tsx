import { useState } from 'react'
import { ExternalLink, GitCompareArrows, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import type {
  AgentWorktreeCompareAttempt,
  AgentWorktreeCompareGroup
} from './agent-worktree-compare-selectors'

export function AgentWorkspaceAttemptCompare({
  groups,
  onOpenAttempt
}: {
  groups: readonly AgentWorktreeCompareGroup[]
  onOpenAttempt: (attempt: AgentWorktreeCompareAttempt) => void
}): React.JSX.Element | null {
  const visibleGroups = groups.filter((group) => group.attempts.length >= 2)
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null)

  if (visibleGroups.length === 0) {
    return null
  }

  return (
    <section
      className="shrink-0 border-b border-border/70 bg-background px-4 py-2.5"
      aria-label={translate('auto.components.agentWorkspace.compare.title', 'Best-of-N compare')}
    >
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <GitCompareArrows className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 className="truncate text-sm font-medium text-foreground">
          {translate('auto.components.agentWorkspace.compare.title', 'Best-of-N compare')}
        </h2>
        <Badge variant="outline" className="ml-auto h-5 rounded-md px-1.5 text-[10px]">
          {translate('auto.components.agentWorkspace.compare.groupCount', '{{count}} groups', {
            count: visibleGroups.length
          })}
        </Badge>
      </div>
      <div className="scrollbar-sleek flex min-w-0 gap-3 overflow-x-auto">
        {visibleGroups.map((group) => (
          <div key={group.id} className="min-w-[26rem] flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="truncate font-medium">{group.label}</span>
              <span className="shrink-0 tabular-nums">
                {translate(
                  'auto.components.agentWorkspace.compare.attemptCount',
                  '{{count}} attempts',
                  { count: group.attemptCount }
                )}
              </span>
            </div>
            <div className="grid gap-1.5">
              {group.attempts.map((attempt) => {
                const selected = selectedWinnerId === attempt.threadId
                return (
                  <div
                    key={attempt.threadId}
                    className={cn(
                      'grid min-w-0 grid-cols-[minmax(0,1.2fr)_auto] gap-3 rounded-lg border border-border bg-muted/20 px-2.5 py-2',
                      selected ? 'bg-accent/45 ring-1 ring-ring/35' : null
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <AgentIcon agent={agentTypeToIconAgent(attempt.agentKind)} size={14} />
                        <span className="truncate text-xs font-medium text-foreground">
                          {attempt.title}
                        </span>
                      </div>
                      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{attempt.projectName}</span>
                        {attempt.branchName ? (
                          <span className="truncate">/ {attempt.branchName}</span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
                        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                          {formatAgentTypeLabel(attempt.agentKind)}
                        </Badge>
                        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                          {attempt.verificationTitle}
                        </Badge>
                        <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px]">
                          {formatChangedFiles(attempt)}
                        </Badge>
                        {attempt.riskNotes.map((riskNote) => (
                          <Badge
                            key={riskNote}
                            variant="outline"
                            className="h-5 rounded-md px-1.5 text-[10px]"
                          >
                            {riskNote}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={translate(
                          'auto.components.agentWorkspace.compare.openAttempt',
                          'Open attempt: {{title}}',
                          { title: attempt.title }
                        )}
                        onClick={() => onOpenAttempt(attempt)}
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant={selected ? 'secondary' : 'outline'}
                        size="xs"
                        aria-pressed={selected}
                        aria-label={translate(
                          'auto.components.agentWorkspace.compare.selectWinner',
                          'Select winner: {{title}}',
                          { title: attempt.title }
                        )}
                        onClick={() => setSelectedWinnerId(attempt.threadId)}
                      >
                        <Trophy className="size-3.5" aria-hidden="true" />
                        {selected
                          ? translate(
                              'auto.components.agentWorkspace.compare.selectedWinner',
                              'Selected winner'
                            )
                          : translate(
                              'auto.components.agentWorkspace.compare.selectWinnerShort',
                              'Select winner'
                            )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatChangedFiles(attempt: AgentWorktreeCompareAttempt): string {
  const fileLabel =
    attempt.changedFileCount === 1
      ? translate('auto.components.agentWorkspace.compare.oneFile', '1 file')
      : translate('auto.components.agentWorkspace.compare.fileCount', '{{count}} files', {
          count: attempt.changedFileCount
        })
  return [fileLabel, `+${attempt.additions}`, `-${attempt.deletions}`].join(' ')
}
