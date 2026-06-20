import { detectLanguage } from '@/lib/language-detect'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'

export function openAgentMarkdownArtifact({
  thread,
  artifact,
  openFile,
  targetGroupId
}: {
  readonly thread: AgentWorkspaceThread | null
  readonly artifact: AgentTimelineMarkdownArtifact
  readonly targetGroupId?: string | null
  readonly openFile:
    | ((
        file: {
          filePath: string
          relativePath: string
          worktreeId: string
          language: string
          mode: 'edit'
        },
        options?: { preview?: boolean; targetGroupId?: string }
      ) => void)
    | undefined
}): void {
  if (!thread || typeof openFile !== 'function') {
    return
  }
  openFile(
    {
      filePath: artifact.absolutePath,
      relativePath: artifact.filePath,
      worktreeId: thread.worktreeId,
      language: detectLanguage(artifact.filePath),
      mode: 'edit'
    },
    { preview: false, targetGroupId: targetGroupId ?? undefined }
  )
}
