import type { UISlice } from '@/store/slices/ui'

export function shouldShowWorktreeHistoryControls(
  activeView: UISlice['activeView'],
  options: { guiAgentWorkspaceEnabled?: boolean } = {}
): boolean {
  if (activeView === 'terminal' && options.guiAgentWorkspaceEnabled === true) {
    return false
  }
  return activeView === 'terminal' || activeView === 'tasks' || activeView === 'automations'
}
