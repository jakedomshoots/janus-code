import type { AppState } from '@/store'
import { detectAgentStatusFromTitle, formatAgentTypeLabel } from '@/lib/agent-status'
import { resolveRuntimePaneTitleLeafId } from '@/lib/runtime-pane-title-leaf-id'
import { tabHasLivePty } from '@/lib/tab-has-live-pty'
import { isTerminalLeafId, makePaneKey } from '../../../../shared/stable-pane-id'
import type { TerminalTab } from '../../../../shared/types'
import type { AgentWorkspacePhase, AgentWorkspaceThread } from './agent-workspace-types'

type WorkspaceThreadMeta = {
  path: string
  branchName: string | null
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function getThreadTitleFromLaunchedTab(state: AppState, tab: TerminalTab, leafId: string): string {
  return (
    nonEmpty(getRuntimePaneTitleForLeaf(state, tab.id, leafId)) ??
    nonEmpty(tab.customTitle) ??
    nonEmpty(tab.generatedTitle) ??
    nonEmpty(tab.title) ??
    (tab.launchAgent ? formatAgentTypeLabel(tab.launchAgent) : 'Agent')
  )
}

function getRuntimePaneTitleForLeaf(state: AppState, tabId: string, leafId: string): string | null {
  const paneTitles = state.runtimePaneTitlesByTabId[tabId]
  if (!paneTitles || Object.keys(paneTitles).length === 0) {
    return null
  }
  const layout = state.terminalLayoutsByTabId[tabId]
  for (const [runtimePaneId, title] of Object.entries(paneTitles)) {
    if (resolveRuntimePaneTitleLeafId(layout, runtimePaneId) === leafId) {
      return title
    }
  }
  return null
}

function getLiveLeafIdsForLaunchedTab(state: AppState, tab: TerminalTab): readonly string[] {
  if (!tab.launchAgent || !tabHasLivePty(state.ptyIdsByTabId, tab.id)) {
    return []
  }
  const livePtyIds = state.ptyIdsByTabId[tab.id] ?? []
  const layout = state.terminalLayoutsByTabId[tab.id]
  const ptyIdsByLeafId = layout?.ptyIdsByLeafId
  if (ptyIdsByLeafId && Object.keys(ptyIdsByLeafId).length > 0) {
    return Object.entries(ptyIdsByLeafId)
      .filter(([leafId, ptyId]) => isTerminalLeafId(leafId) && livePtyIds.includes(ptyId))
      .map(([leafId]) => leafId)
  }
  return layout?.activeLeafId && isTerminalLeafId(layout.activeLeafId) ? [layout.activeLeafId] : []
}

function getLaunchedTabPhase(title: string): AgentWorkspacePhase {
  const status = detectAgentStatusFromTitle(title)
  if (status === 'permission') {
    return 'waiting-for-user'
  }
  return 'running'
}

export function appendLaunchedTabWorkspaceThreads(
  threads: AgentWorkspaceThread[],
  state: AppState,
  workspaceMeta: Map<string, WorkspaceThreadMeta>
): void {
  for (const [worktreeId, tabs] of Object.entries(state.tabsByWorktree)) {
    const meta = workspaceMeta.get(worktreeId)
    if (!meta) {
      continue
    }
    for (const tab of tabs) {
      if (!tab.launchAgent) {
        continue
      }
      for (const leafId of getLiveLeafIdsForLaunchedTab(state, tab)) {
        const paneKey = makePaneKey(tab.id, leafId)
        if (
          paneKey in state.agentStatusByPaneKey ||
          paneKey in state.pendingAgentLaunchesByPaneKey ||
          paneKey in state.retainedAgentsByPaneKey
        ) {
          continue
        }
        const title = getThreadTitleFromLaunchedTab(state, tab, leafId)
        threads.push({
          id: paneKey,
          worktreeId,
          title,
          agentKind: tab.launchAgent,
          phase: getLaunchedTabPhase(title),
          updatedAt: getIsoTimestamp(tab.createdAt),
          cwd: meta.path,
          branchName: meta.branchName
        })
      }
    }
  }
}
