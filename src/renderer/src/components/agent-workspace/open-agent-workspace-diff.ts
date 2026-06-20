import { detectLanguage } from '@/lib/language-detect'
import { joinPath } from '@/lib/path'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'

export function openAgentWorkspaceDiff({
  diff,
  thread,
  openDiff
}: {
  readonly diff: AgentWorkspaceDiffSummary
  readonly thread: AgentWorkspaceThread | null
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
  if (!thread?.cwd || typeof openDiff !== 'function') {
    return
  }
  openDiff(
    thread.worktreeId,
    joinPath(thread.cwd, diff.filePath),
    diff.filePath,
    detectLanguage(diff.filePath),
    diff.area === 'staged'
  )
}
