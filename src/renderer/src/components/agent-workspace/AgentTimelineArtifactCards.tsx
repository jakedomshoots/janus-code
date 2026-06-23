import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'
import {
  summarizeAgentTimelineDiffs,
  type AgentTimelineMarkdownArtifact
} from './agent-timeline-artifacts'
import { useAgentWorkspaceInstantAction } from './useAgentWorkspaceInstantAction'

export function AgentMarkdownArtifactCard({
  artifact,
  onOpen
}: {
  artifact: AgentTimelineMarkdownArtifact
  onOpen?: (artifact: AgentTimelineMarkdownArtifact) => void
}): React.JSX.Element {
  const openAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(
    onOpen ? () => onOpen(artifact) : undefined
  )

  return (
    <div
      className="mt-3 flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background/70 p-3 shadow-xs"
      data-agent-markdown-artifact={artifact.filePath}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <FileText className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{artifact.fileName}</div>
        <div className="text-xs text-muted-foreground">
          {translate('auto.components.agentWorkspace.timeline.documentMd', 'Document · MD')}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={!onOpen} {...openAction}>
        {translate('auto.components.agentWorkspace.timeline.open', 'Open')}
      </Button>
    </div>
  )
}

export function AgentEditedFilesCard({
  diffs,
  onReview
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
  onReview?: () => void
}): React.JSX.Element | null {
  const [expanded, setExpanded] = useState(false)
  const summary = summarizeAgentTimelineDiffs(diffs)
  const visibleDiffs = expanded ? diffs : summary.visibleDiffs
  const reviewAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(onReview)
  const expandAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(() =>
    setExpanded((current) => !current)
  )

  if (summary.fileCount === 0) {
    return null
  }

  return (
    <section
      className="rounded-xl border border-border bg-card text-card-foreground shadow-xs"
      data-agent-edited-files-card="true"
      aria-label={translate('auto.components.agentWorkspace.timeline.editedFiles', 'Edited files')}
    >
      <div className="flex items-center gap-3 p-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <ListChecks className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">
            {summary.fileCount === 1
              ? translate('auto.components.agentWorkspace.timeline.editedOneFile', 'Edited 1 file')
              : translate(
                  'auto.components.agentWorkspace.timeline.editedFileCount',
                  'Edited {{count}} files',
                  { count: summary.fileCount }
                )}
          </div>
          <div className="font-mono text-xs">
            <span className="text-[color:var(--git-decoration-added)]">
              +{summary.totalAdditions}
            </span>{' '}
            <span className="text-[color:var(--git-decoration-deleted)]">
              -{summary.totalDeletions}
            </span>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={!onReview} {...reviewAction}>
          {translate('auto.components.agentWorkspace.timeline.review', 'Review')}
        </Button>
      </div>
      <div className="border-t border-border">
        {visibleDiffs.map((diff) => (
          <div key={diff.id} className="flex min-h-9 min-w-0 items-center gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
              {diff.filePath}
            </span>
            <span className="shrink-0 font-mono text-xs">
              <span className="text-[color:var(--git-decoration-added)]">+{diff.additions}</span>{' '}
              <span className="text-[color:var(--git-decoration-deleted)]">-{diff.deletions}</span>
            </span>
          </div>
        ))}
        {summary.hiddenCount > 0 ? (
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between gap-2 border-t border-border px-3 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            {...expandAction}
          >
            <span>
              {expanded
                ? translate('auto.components.agentWorkspace.timeline.showFewerFiles', 'Show fewer')
                : summary.hiddenCount === 1
                  ? translate(
                      'auto.components.agentWorkspace.timeline.showOneMoreFile',
                      'Show 1 more file'
                    )
                  : translate(
                      'auto.components.agentWorkspace.timeline.showMoreFiles',
                      'Show {{count}} more files',
                      { count: summary.hiddenCount }
                    )}
            </span>
            {expanded ? (
              <ChevronUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </section>
  )
}
