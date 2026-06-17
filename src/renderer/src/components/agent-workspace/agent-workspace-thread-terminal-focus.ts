import { activateTerminalTab } from '@/components/terminal/terminal-tab-actions'
import { useAppStore } from '@/store'
import { parsePaneKey } from '../../../../shared/stable-pane-id'

export type AgentWorkspaceThreadTerminalTarget = {
  readonly tabId: string
  readonly leafId: string
  readonly ptyId: string
}

export function focusAgentWorkspaceThreadTerminal({
  threadId,
  worktreeId
}: {
  threadId: string
  worktreeId: string
}): AgentWorkspaceThreadTerminalTarget | null {
  const parsed = parsePaneKey(threadId)
  if (!parsed) {
    return null
  }

  const store = useAppStore.getState()
  if (store.activeWorktreeId !== worktreeId) {
    store.setActiveWorktree(worktreeId)
  }

  activateTerminalTab(parsed.tabId)

  const layout = store.terminalLayoutsByTabId[parsed.tabId]
  if (layout && layout.activeLeafId !== parsed.leafId) {
    store.setTabLayout(parsed.tabId, {
      ...layout,
      activeLeafId: parsed.leafId
    })
  }

  const ptyId = getThreadPanePtyId(useAppStore.getState(), parsed.tabId, parsed.leafId)
  if (!ptyId) {
    return null
  }

  return {
    tabId: parsed.tabId,
    leafId: parsed.leafId,
    ptyId
  }
}

function getThreadPanePtyId(
  state: ReturnType<typeof useAppStore.getState>,
  tabId: string,
  leafId: string
): string | null {
  const livePtyIds = state.ptyIdsByTabId?.[tabId] ?? []
  if (livePtyIds.length === 0) {
    return null
  }

  const leafPtyId = state.terminalLayoutsByTabId[tabId]?.ptyIdsByLeafId?.[leafId]
  return leafPtyId && livePtyIds.includes(leafPtyId) ? leafPtyId : null
}
