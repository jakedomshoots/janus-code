import { detectLanguage } from '@/lib/language-detect'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'

type OpenMarkdownPreview = (
  file: {
    filePath: string
    relativePath: string
    worktreeId: string
    language: string
    runtimeEnvironmentId?: string | null
  },
  options?: { anchor?: string | null; targetGroupId?: string; sourceFileId?: string }
) => void

export function openAgentMarkdownArtifact({
  thread,
  artifact,
  openMarkdownPreview,
  targetGroupId,
  onOpenWorkbench
}: {
  readonly thread: AgentWorkspaceThread | null
  readonly artifact: AgentTimelineMarkdownArtifact
  readonly openMarkdownPreview: OpenMarkdownPreview | undefined
  readonly targetGroupId?: string | null
  readonly onOpenWorkbench?: () => void
}): void {
  if (!thread || typeof openMarkdownPreview !== 'function') {
    return
  }

  openMarkdownPreview(
    {
      filePath: artifact.absolutePath,
      relativePath: artifact.filePath,
      worktreeId: thread.worktreeId,
      language: detectLanguage(artifact.filePath)
    },
    { targetGroupId: targetGroupId ?? undefined }
  )
  onOpenWorkbench?.()
}
