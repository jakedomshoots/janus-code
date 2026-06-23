import { FileText, GitCommit, Minus, Plus, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { formatAgentWorkspaceDiffStatus } from './agent-workspace-labels'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'
import { useAgentWorkspaceInstantAction } from './useAgentWorkspaceInstantAction'

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

export function AgentWorkspaceRightPanelChanges({
  diffs,
  sourceControlBusy = false,
  sourceControlError = null,
  onStageDiff,
  onUnstageDiff,
  onDiscardDiff,
  onCommitStaged
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
  sourceControlBusy?: boolean
  sourceControlError?: string | null
  onStageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => void | Promise<void>
  onCommitStaged?: (message: string) => boolean | void | Promise<boolean | void>
}): React.JSX.Element | null {
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(() => diffs[0]?.id ?? null)
  const [commitMessage, setCommitMessage] = useState('')
  const selectedDiff = diffs.find((diff) => diff.id === selectedDiffId) ?? diffs[0] ?? null
  const stagedCount = diffs.filter((diff) => diff.area === 'staged').length
  const canCommit =
    stagedCount > 0 && commitMessage.trim().length > 0 && onCommitStaged && !sourceControlBusy

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
    return null
  }

  async function handleCommit(): Promise<void> {
    const message = commitMessage.trim()
    if (!message || !onCommitStaged || sourceControlBusy) {
      return
    }
    const result = await onCommitStaged(message)
    if (result !== false) {
      setCommitMessage('')
    }
  }

  return (
    <section
      className="min-w-0"
      aria-label={translate(
        'auto.components.agentWorkspace.layout.sourceControlChanges',
        'Changes'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {translate('auto.components.agentWorkspace.layout.sourceControlChanges', 'Changes')}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {diffs.length === 1
            ? translate('auto.components.agentWorkspace.layout.oneChange', '1 change')
            : translate('auto.components.agentWorkspace.layout.changeCount', '{{count}} changes', {
                count: diffs.length
              })}
        </span>
      </div>
      <div className="space-y-1">
        {diffs.slice(0, 4).map((diff) => (
          <ChangeSelectionButton
            key={diff.id}
            diff={diff}
            selected={selectedDiff?.id === diff.id}
            onSelect={() => setSelectedDiffId(diff.id)}
          />
        ))}
      </div>
      {selectedDiff ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedDiff.area === 'staged' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!onUnstageDiff || sourceControlBusy}
              onClick={() => void onUnstageDiff?.(selectedDiff)}
            >
              <Minus className="size-3.5" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.layout.unstage', 'Unstage')}
            </Button>
          ) : null}
          {selectedDiff.area === 'unstaged' || selectedDiff.area === 'untracked' ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!onStageDiff || sourceControlBusy}
                onClick={() => void onStageDiff?.(selectedDiff)}
              >
                <Plus className="size-3.5" aria-hidden="true" />
                {translate('auto.components.agentWorkspace.layout.stage', 'Stage')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!onDiscardDiff || sourceControlBusy}
                onClick={() => void onDiscardDiff?.(selectedDiff)}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {translate('auto.components.agentWorkspace.layout.discard', 'Discard')}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
      {stagedCount > 0 ? (
        <div className="mt-3 space-y-2">
          <textarea
            aria-label={translate(
              'auto.components.agentWorkspace.layout.commitMessage',
              'Commit message'
            )}
            value={commitMessage}
            rows={2}
            className="min-h-14 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={translate(
              'auto.components.agentWorkspace.layout.commitMessagePlaceholder',
              'Describe staged changes'
            )}
            disabled={sourceControlBusy}
            onChange={(event) => setCommitMessage(event.currentTarget.value)}
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full"
            disabled={!canCommit}
            onClick={() => void handleCommit()}
          >
            <GitCommit className="size-3.5" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.commit', 'Commit')}
          </Button>
        </div>
      ) : null}
      {sourceControlError ? (
        <p className="mt-2 text-xs text-destructive">{sourceControlError}</p>
      ) : null}
    </section>
  )
}

function ChangeSelectionButton({
  diff,
  selected,
  onSelect
}: {
  diff: AgentWorkspaceDiffSummary
  selected: boolean
  onSelect: () => void
}): React.JSX.Element {
  const selectAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(onSelect)

  return (
    <button
      type="button"
      className={cn(
        'flex h-9 w-full min-w-0 items-center gap-2 rounded-xl px-1.5 text-left text-sm transition-colors',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
      {...selectAction}
    >
      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{diff.filePath}</span>
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {formatAgentWorkspaceDiffStatus(diff.status)}
      </span>
      {diff.area ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatDiffArea(diff.area)}
        </span>
      ) : null}
    </button>
  )
}
