import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import { AgentWorkspaceMarkdownArtifactPreview } from './AgentWorkspaceMarkdownArtifactPreview'

export function AgentWorkspaceMarkdownArtifactSidePanel({
  artifact,
  thread,
  onClose,
  onOpenInEditor
}: {
  artifact: AgentTimelineMarkdownArtifact
  thread: AgentWorkspaceThread | null
  onClose: () => void
  onOpenInEditor?: (artifact: AgentTimelineMarkdownArtifact) => void
}): React.JSX.Element {
  return (
    <aside
      className="agent-workspace-markdown-side-panel flex h-full min-h-0 w-[min(560px,38vw)] min-w-[360px] max-w-[640px] shrink-0 flex-col border-l border-border bg-background/95 p-4 text-foreground"
      data-agent-markdown-side-panel="true"
      aria-label={translate(
        'auto.components.agentWorkspace.documentSidePanel.documentPreview',
        'Document preview'
      )}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {translate('auto.components.agentWorkspace.documentSidePanel.document', 'Document')}
          </h2>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {artifact.filePath}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label={translate(
            'auto.components.agentWorkspace.documentSidePanel.closeDocumentPreview',
            'Close document preview'
          )}
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <AgentWorkspaceMarkdownArtifactPreview
          artifact={artifact}
          thread={thread}
          onOpenInEditor={onOpenInEditor}
        />
      </div>
    </aside>
  )
}
