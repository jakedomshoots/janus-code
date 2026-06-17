import { useAppStore } from '@/store'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

// Why: the drawer chrome switches on reveal reason, but TerminalWorkspace still
// renders from store activeTabType — browser opens must leave that alone.
export function syncAgentTerminalDrawerSurface(reason: AgentTerminalRevealReason | null): void {
  if (!reason || reason === 'browser') {
    return
  }

  const store = useAppStore.getState()
  const worktreeId = store.activeWorktreeId
  store.setActiveTabType('terminal')

  if (!worktreeId) {
    return
  }

  const tabs = store.tabsByWorktree[worktreeId] ?? []
  if (tabs.length === 0) {
    return
  }

  const preferredTabId = store.activeTabIdByWorktree[worktreeId] ?? store.activeTabId
  const terminalTab = tabs.find((tab) => tab.id === preferredTabId) ?? tabs.at(-1) ?? tabs[0]
  if (terminalTab) {
    store.setActiveTab(terminalTab.id)
  }
}
