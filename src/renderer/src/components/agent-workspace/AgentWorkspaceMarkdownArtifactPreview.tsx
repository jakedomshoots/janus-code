import { ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { readRuntimeFileContent } from '@/runtime/runtime-file-client'
import { useAppStore } from '@/store'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import CommentMarkdown from '../sidebar/CommentMarkdown'

type MarkdownArtifactPreviewState =
  | { status: 'idle' | 'loading'; content: string; error: null }
  | { status: 'ready'; content: string; error: null }
  | { status: 'error'; content: string; error: string }

export function AgentWorkspaceMarkdownArtifactPreview({
  artifact,
  thread,
  onOpenInEditor
}: {
  artifact: AgentTimelineMarkdownArtifact | null
  thread: AgentWorkspaceThread | null
  onOpenInEditor?: (artifact: AgentTimelineMarkdownArtifact) => void
}): React.JSX.Element {
  if (!artifact) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm">
        <div className="font-medium text-foreground">
          {translate(
            'auto.components.agentWorkspace.rightPanel.noDocumentSelected',
            'No document selected'
          )}
        </div>
        <div className="mt-1 text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.rightPanel.noDocumentSelectedDetail',
            'Open a document from an agent reply to preview it here.'
          )}
        </div>
      </div>
    )
  }

  return (
    <section
      className="flex h-full min-h-0 flex-col"
      aria-label={translate('auto.components.agentWorkspace.rightPanel.document', 'Document')}
      data-agent-markdown-preview={artifact.filePath}
    >
      <div className="mb-3 flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-background/60 p-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{artifact.fileName}</div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">
            {artifact.filePath}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!onOpenInEditor}
          onClick={() => onOpenInEditor?.(artifact)}
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.rightPanel.openInEditor', 'Open in editor')}
        </Button>
      </div>
      <LoadedMarkdownArtifactPreview
        key={`${thread?.worktreeId ?? 'local'}:${artifact.absolutePath}:${artifact.filePath}`}
        artifact={artifact}
        thread={thread}
      />
    </section>
  )
}

function LoadedMarkdownArtifactPreview({
  artifact,
  thread
}: {
  artifact: AgentTimelineMarkdownArtifact
  thread: AgentWorkspaceThread | null
}): React.JSX.Element {
  const settings = useAppStore((state) => state.settings)
  const [previewState, setPreviewState] = useState<MarkdownArtifactPreviewState>({
    status: 'loading',
    content: '',
    error: null
  })

  useEffect(() => {
    let canceled = false
    void readRuntimeFileContent({
      settings,
      filePath: artifact.absolutePath,
      relativePath: artifact.filePath,
      worktreeId: thread?.worktreeId
    })
      .then((result) => {
        if (canceled) {
          return
        }
        if (result.isBinary) {
          setPreviewState({
            status: 'error',
            content: '',
            error: translate(
              'auto.components.agentWorkspace.rightPanel.markdownArtifactBinary',
              'This document is binary and cannot be previewed.'
            )
          })
          return
        }
        setPreviewState({ status: 'ready', content: result.content, error: null })
      })
      .catch((error: unknown) => {
        if (canceled) {
          return
        }
        setPreviewState({
          status: 'error',
          content: '',
          error:
            error instanceof Error
              ? error.message
              : translate(
                  'auto.components.agentWorkspace.rightPanel.markdownArtifactLoadFailed',
                  'Could not load this document.'
                )
        })
      })

    return () => {
      canceled = true
    }
  }, [artifact.absolutePath, artifact.filePath, settings, thread?.worktreeId])

  return (
    <div className="agent-markdown-artifact-preview-scroller scrollbar-sleek min-h-0 flex-1 overflow-auto rounded-2xl border border-border bg-background/60 p-4">
      {previewState.status === 'loading' ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {translate(
            'auto.components.agentWorkspace.rightPanel.loadingDocument',
            'Loading document'
          )}
        </div>
      ) : null}
      {previewState.status === 'error' ? (
        <div className="text-sm text-destructive">{previewState.error}</div>
      ) : null}
      {previewState.status === 'ready' ? (
        <CommentMarkdown
          variant="document"
          content={previewState.content}
          className="agent-markdown-artifact-preview text-sm leading-6 text-foreground"
        />
      ) : null}
    </div>
  )
}
