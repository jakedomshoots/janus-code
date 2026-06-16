import { Columns2, ExternalLink, FileText, Pilcrow, Rows3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'
import { formatAgentWorkspaceDiffStatus } from './agent-workspace-labels'

export type AgentDiffRenderMode = 'stacked' | 'split'

function formatDiffArea(area: AgentWorkspaceDiffSummary['area']): string {
  switch (area) {
    case 'staged':
      return translate('auto.components.agentWorkspace.layout.staged', 'staged')
    case 'unstaged':
      return translate('auto.components.agentWorkspace.layout.unstaged', 'unstaged')
    case 'untracked':
      return translate('auto.components.agentWorkspace.layout.untracked', 'untracked')
    case undefined:
      return ''
  }
}

function DiffLineCounts({ diff }: { diff: AgentWorkspaceDiffSummary }): React.JSX.Element | null {
  if (diff.additions <= 0 && diff.deletions <= 0) {
    return null
  }
  return (
    <span className="shrink-0 tabular-nums text-[11px]">
      {diff.additions > 0 ? (
        <span style={{ color: 'var(--git-decoration-added)' }}>+{diff.additions}</span>
      ) : null}
      {diff.additions > 0 && diff.deletions > 0 ? <span> </span> : null}
      {diff.deletions > 0 ? (
        <span style={{ color: 'var(--git-decoration-deleted)' }}>-{diff.deletions}</span>
      ) : null}
    </span>
  )
}

export function AgentDiffPanel({
  diffs,
  onOpenDiff
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
  onOpenDiff?: (diff: AgentWorkspaceDiffSummary) => void
}): React.JSX.Element {
  const [renderMode, setRenderMode] = useState<AgentDiffRenderMode>('stacked')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(() => diffs[0]?.id ?? null)
  const selectedDiff = diffs.find((diff) => diff.id === selectedDiffId) ?? diffs[0] ?? null

  useEffect(() => {
    if (!selectedDiff && selectedDiffId !== null) {
      setSelectedDiffId(null)
      return
    }
    if (selectedDiff && selectedDiff.id !== selectedDiffId) {
      setSelectedDiffId(selectedDiff.id)
    }
  }, [selectedDiff, selectedDiffId])

  if (diffs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.diff', 'Diff')}
        </div>
        <p className="mt-2 text-sm font-medium">
          {translate(
            'auto.components.agentWorkspace.layout.noSourceControlChangesYet',
            'No source-control changes yet.'
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.sourceControlChangesWillAppear',
            'Git changes from Orca source control will appear here.'
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="min-w-0 text-sm font-medium">
          {translate('auto.components.agentWorkspace.layout.sourceControlChanges', 'Changes')}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={renderMode}
            onValueChange={(value) => {
              if (value === 'stacked' || value === 'split') {
                setRenderMode(value)
              }
            }}
          >
            <ToggleGroupItem
              value="stacked"
              aria-label={translate(
                'auto.components.agentWorkspace.layout.stackedDiff',
                'Stacked diff'
              )}
            >
              <Rows3 className="size-3" aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="split"
              aria-label={translate(
                'auto.components.agentWorkspace.layout.splitDiff',
                'Split diff'
              )}
            >
              <Columns2 className="size-3" aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            type="button"
            size="icon-xs"
            variant={ignoreWhitespace ? 'secondary' : 'outline'}
            aria-pressed={ignoreWhitespace}
            title={
              ignoreWhitespace
                ? translate(
                    'auto.components.agentWorkspace.layout.showWhitespaceChanges',
                    'Show whitespace changes'
                  )
                : translate(
                    'auto.components.agentWorkspace.layout.hideWhitespaceChanges',
                    'Hide whitespace changes'
                  )
            }
            onClick={() => setIgnoreWhitespace((current) => !current)}
          >
            <Pilcrow className="size-3" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            disabled={!selectedDiff || !onOpenDiff}
            title={translate(
              'auto.components.agentWorkspace.layout.openInEditor',
              'Open in editor'
            )}
            onClick={() => {
              if (selectedDiff) {
                onOpenDiff?.(selectedDiff)
              }
            }}
          >
            <ExternalLink className="size-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {diffs.map((diff) => (
          <button
            key={diff.id}
            type="button"
            className={cn(
              'flex w-full min-w-0 items-center gap-2 rounded-md border p-2 text-left transition-colors',
              selectedDiff?.id === diff.id
                ? 'border-border bg-accent text-accent-foreground'
                : 'border-border bg-background hover:bg-accent/50'
            )}
            onClick={() => setSelectedDiffId(diff.id)}
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{diff.filePath}</span>
              <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{formatAgentWorkspaceDiffStatus(diff.status)}</span>
                {diff.area ? <span>{formatDiffArea(diff.area)}</span> : null}
              </span>
            </span>
            <DiffLineCounts diff={diff} />
          </button>
        ))}
      </div>

      {selectedDiff ? (
        <div className="rounded-md border border-border bg-background p-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <FileText className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{selectedDiff.filePath}</span>
          </div>
          {selectedDiff.oldPath ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {translate('auto.components.agentWorkspace.layout.renamedFrom', 'Renamed from')}{' '}
              {selectedDiff.oldPath}
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              {translate('auto.components.agentWorkspace.layout.diffMode', 'Mode')}
            </span>
            <span>
              {renderMode === 'split'
                ? translate('auto.components.agentWorkspace.layout.splitDiff', 'Split diff')
                : translate('auto.components.agentWorkspace.layout.stackedDiff', 'Stacked diff')}
            </span>
            <span className="text-muted-foreground">
              {translate('auto.components.agentWorkspace.layout.whitespace', 'Whitespace')}
            </span>
            <span>
              {ignoreWhitespace
                ? translate('auto.components.agentWorkspace.layout.whitespaceIgnored', 'ignored')
                : translate('auto.components.agentWorkspace.layout.whitespaceShown', 'shown')}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
