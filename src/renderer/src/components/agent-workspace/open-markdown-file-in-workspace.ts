import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import { detectLanguage } from '@/lib/language-detect'
import { extractIpcErrorMessage } from '@/lib/ipc-error'
import { useAppStore } from '@/store'

export async function openMarkdownFileInActiveWorkspace(groupId: string): Promise<void> {
  const state = useAppStore.getState()
  const worktreeId = state.activeWorktreeId
  if (!worktreeId) {
    return
  }
  const worktree = state.getKnownWorktreeById(worktreeId)
  if (!worktree) {
    return
  }

  try {
    const document = await window.api.app.pickMarkdownDocument(worktree.path)
    if (!document) {
      return
    }
    state.openFile(
      {
        filePath: document.filePath,
        relativePath: document.relativePath,
        worktreeId,
        language: detectLanguage(document.relativePath),
        mode: 'edit'
      },
      { preview: false, targetGroupId: groupId }
    )
    state.recordFeatureInteraction?.('markdown-file-created')
  } catch (err) {
    toast.error(
      extractIpcErrorMessage(
        err,
        translate(
          'auto.components.agentWorkspace.openMarkdown.failed',
          'Failed to open markdown file.'
        )
      )
    )
  }
}
