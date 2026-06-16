import type {
  AgentWorkspacePlan,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'

function getPlanSortTimestamp(plan: AgentWorkspacePlan): number {
  if (!plan.updatedAt) {
    return Number.NEGATIVE_INFINITY
  }
  const timestamp = Date.parse(plan.updatedAt)
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function selectAgentWorkspacePlansForThread(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspacePlan[] {
  if (!thread) {
    return []
  }
  return snapshot.plans
    .filter((plan) => plan.threadId === thread.id)
    .toSorted((a, b) => {
      const updatedDiff = getPlanSortTimestamp(b) - getPlanSortTimestamp(a)
      return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
    })
}

export function selectAgentWorkspacePlanForThread(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): AgentWorkspacePlan | null {
  return selectAgentWorkspacePlansForThread(snapshot, thread)[0] ?? null
}

export function hasStructuredAgentWorkspacePlan(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): boolean {
  return selectAgentWorkspacePlanForThread(snapshot, thread) !== null
}

export function getAgentWorkspacePlanTitle(plan: AgentWorkspacePlan): string | null {
  return nonEmpty(plan.title) ?? getAgentWorkspacePlanMarkdownTitle(plan.markdown)
}

export function getAgentWorkspacePlanMarkdownTitle(markdown: string | null): string | null {
  if (!markdown) {
    return null
  }
  const heading = markdown.match(/^\s{0,3}#{1,6}\s+(.+)$/m)?.[1]?.trim()
  return heading && heading.length > 0 ? heading : null
}

export function stripDisplayedAgentWorkspacePlanMarkdown(markdown: string): string {
  const lines = markdown.trimEnd().split(/\r?\n/)
  const sourceLines = lines[0] && /^\s{0,3}#{1,6}\s+/.test(lines[0]) ? lines.slice(1) : [...lines]
  while (sourceLines[0]?.trim().length === 0) {
    sourceLines.shift()
  }
  const firstHeadingMatch = sourceLines[0]?.match(/^\s{0,3}#{1,6}\s+(.+)$/)
  if (firstHeadingMatch?.[1]?.trim().toLowerCase() === 'summary') {
    sourceLines.shift()
    while (sourceLines[0]?.trim().length === 0) {
      sourceLines.shift()
    }
  }
  return sourceLines.join('\n')
}
