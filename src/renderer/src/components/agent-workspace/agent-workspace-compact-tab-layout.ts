import type { TabGroupLayoutNode } from '../../../../shared/types'

const COMPACT_AGENT_WORKSPACE_TARGET_RATIO = 0.85
const COMPACT_AGENT_WORKSPACE_SIBLING_RATIO = 0.15
const RATIO_EPSILON = 0.001

export type AgentWorkspaceCompactSplitRatioUpdate = {
  nodePath: string
  ratio: number
}

export function getAgentWorkspaceCompactSplitRatioUpdates({
  layout,
  targetGroupId
}: {
  layout: TabGroupLayoutNode | null | undefined
  targetGroupId: string | null | undefined
}): AgentWorkspaceCompactSplitRatioUpdate[] {
  if (!layout || !targetGroupId) {
    return []
  }

  const updates: AgentWorkspaceCompactSplitRatioUpdate[] = []

  function visit(node: TabGroupLayoutNode, nodePath: string): boolean {
    if (node.type === 'leaf') {
      return node.groupId === targetGroupId
    }

    const firstHasTarget = visit(node.first, nodePath ? `${nodePath}.first` : 'first')
    const secondHasTarget = visit(node.second, nodePath ? `${nodePath}.second` : 'second')

    if (!firstHasTarget && !secondHasTarget) {
      return false
    }

    const ratio = firstHasTarget
      ? COMPACT_AGENT_WORKSPACE_TARGET_RATIO
      : COMPACT_AGENT_WORKSPACE_SIBLING_RATIO
    if (Math.abs((node.ratio ?? 0.5) - ratio) > RATIO_EPSILON) {
      updates.push({ nodePath, ratio })
    }

    return true
  }

  visit(layout, '')
  return updates
}
