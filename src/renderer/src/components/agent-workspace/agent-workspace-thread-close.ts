import { closeTerminalTab } from '@/components/terminal/terminal-tab-actions'
import { parsePaneKey } from '../../../../shared/stable-pane-id'

export function closeAgentWorkspaceThread(threadId: string): boolean {
  const parsed = parsePaneKey(threadId)
  if (!parsed) {
    return false
  }

  closeTerminalTab(parsed.tabId)
  return true
}
