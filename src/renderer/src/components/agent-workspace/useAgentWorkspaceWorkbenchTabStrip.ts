import { useCallback, useMemo } from 'react'
import { useTabGroupWorkspaceModel } from '@/components/tab-group/useTabGroupWorkspaceModel'
import { resolveUnifiedTabLabel } from '../../../../shared/tab-title-resolution'
import type { Tab } from '../../../../shared/types'
import { sortUnifiedTabsByGroupOrder } from './agent-workspace-group-tab-order'

const WORKBENCH_CONTENT_TYPES = new Set<Tab['contentType']>([
  'simulator',
  'editor',
  'diff',
  'conflict-review'
])

export type AgentWorkspaceWorkbenchTabEntry = {
  id: string
  label: string
  contentType: Tab['contentType']
}

export function useAgentWorkspaceWorkbenchTabStrip({
  worktreeId,
  groupId,
  tabGroupWorkbenchActive,
  onDismissWorkbench
}: {
  worktreeId: string | null
  groupId: string | null
  tabGroupWorkbenchActive: boolean
  onDismissWorkbench: () => void
}): {
  workbenchTabs: readonly AgentWorkspaceWorkbenchTabEntry[]
  activeWorkbenchTabId: string | null
  selectWorkbenchTab: (unifiedTabId: string) => void
  closeWorkbenchTab: (unifiedTabId: string) => void
} {
  const resolvedWorktreeId = worktreeId ?? ''
  const resolvedGroupId = groupId ?? ''
  const model = useTabGroupWorkspaceModel({
    worktreeId: resolvedWorktreeId,
    groupId: resolvedGroupId
  })

  const workbenchTabs = useMemo<readonly AgentWorkspaceWorkbenchTabEntry[]>(() => {
    if (!worktreeId || !groupId) {
      return []
    }
    const orderedTabs = sortUnifiedTabsByGroupOrder(
      model.groupTabs.filter((tab) => WORKBENCH_CONTENT_TYPES.has(tab.contentType)),
      model.group?.tabOrder ?? []
    )
    return orderedTabs.map((tab) => ({
      id: tab.id,
      label: resolveUnifiedTabLabel(tab, false, tab.label),
      contentType: tab.contentType
    }))
  }, [groupId, model.group?.tabOrder, model.groupTabs, worktreeId])

  const activeWorkbenchTabId = tabGroupWorkbenchActive ? (model.activeTab?.id ?? null) : null

  const selectWorkbenchTab = useCallback(
    (unifiedTabId: string) => {
      model.commands.activateEditor(unifiedTabId)
    },
    [model.commands]
  )

  const closeWorkbenchTab = useCallback(
    (unifiedTabId: string) => {
      const remainingTabs = workbenchTabs.filter((tab) => tab.id !== unifiedTabId)
      model.commands.closeItem(unifiedTabId)
      if (remainingTabs.length === 0 && tabGroupWorkbenchActive) {
        onDismissWorkbench()
      }
    },
    [model.commands, onDismissWorkbench, tabGroupWorkbenchActive, workbenchTabs]
  )

  return {
    workbenchTabs,
    activeWorkbenchTabId,
    selectWorkbenchTab,
    closeWorkbenchTab
  }
}
