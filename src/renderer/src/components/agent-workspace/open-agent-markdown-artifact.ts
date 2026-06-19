import { detectLanguage } from '@/lib/language-detect'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'

export function openAgentMarkdownArtifact({
  thread,
  artifact,
  openDiff
}: {
  readonly thread: AgentWorkspaceThread | null
  readonly artifact: AgentTimelineMarkdownArtifact
  readonly openDiff:
    | ((
        worktreeId: string,
        filePath: string,
        relativePath: string,
        language: string,
        staged: boolean
      ) => void)
    | undefined
}): void {
  if (!thread || typeof openDiff !== 'function') {
    return
  }
  openDiff(
    thread.worktreeId,
    artifact.absolutePath,
    artifact.filePath,
    detectLanguage(artifact.filePath),
    false
  )
}
