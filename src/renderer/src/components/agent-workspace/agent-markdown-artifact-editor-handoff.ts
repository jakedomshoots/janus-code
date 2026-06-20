import { useAppStore } from '@/store'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'
import { openAgentMarkdownArtifact } from './open-agent-markdown-artifact'

export function openMarkdownArtifactInEditor({
  thread,
  artifact,
  openFile,
  onOpenWorkbench
}: {
  readonly thread: AgentWorkspaceThread | null
  readonly artifact: AgentTimelineMarkdownArtifact
  readonly openFile: Parameters<typeof openAgentMarkdownArtifact>[0]['openFile']
  readonly onOpenWorkbench?: () => void
}): void {
  openAgentMarkdownArtifact({ thread, artifact, openFile })
  onOpenWorkbench?.()
  queueMicrotask(() => activateMarkdownArtifactEditorTab(thread, artifact))
}

function activateMarkdownArtifactEditorTab(
  thread: AgentWorkspaceThread | null,
  artifact: AgentTimelineMarkdownArtifact
): void {
  if (!thread) {
    return
  }
  const state = useAppStore.getState()
  const openFileEntry = state.openFiles?.find(
    (file) => file.filePath === artifact.absolutePath && file.worktreeId === thread.worktreeId
  )
  const editorEntityIds = new Set([artifact.absolutePath, openFileEntry?.id].filter(Boolean))
  const editorTab = state.unifiedTabsByWorktree?.[thread.worktreeId]?.find(
    (tab) => editorEntityIds.has(tab.entityId) && tab.contentType === 'editor'
  )
  if (editorTab) {
    state.activateTab?.(editorTab.id)
  }
}
