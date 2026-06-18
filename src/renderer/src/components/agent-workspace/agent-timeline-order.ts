import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

function getSortTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY
}

function getAgentTimelineKindRank(kind: AgentWorkspaceTimelineEntry['kind']): number {
  switch (kind) {
    case 'user':
      return 0
    case 'system':
    case 'approval':
    case 'tool':
      return 1
    case 'agent':
      return 2
    case 'error':
      return 3
  }
}

export function compareAgentTimelineEntries(
  a: AgentWorkspaceTimelineEntry,
  b: AgentWorkspaceTimelineEntry
): number {
  const timeDiff = getSortTimestamp(a.createdAt) - getSortTimestamp(b.createdAt)
  if (timeDiff !== 0) {
    return timeDiff
  }
  const kindDiff = getAgentTimelineKindRank(a.kind) - getAgentTimelineKindRank(b.kind)
  return kindDiff === 0 ? a.id.localeCompare(b.id) : kindDiff
}
