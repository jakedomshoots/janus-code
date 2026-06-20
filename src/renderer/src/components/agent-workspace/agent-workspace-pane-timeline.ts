import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import { compareAgentTimelineEntries } from './agent-timeline-order'

export function mergeAgentWorkspacePaneTimeline({
  backendTimeline,
  localUserTimeline,
  threadId
}: {
  readonly backendTimeline: readonly AgentWorkspaceTimelineEntry[]
  readonly localUserTimeline: readonly AgentWorkspaceTimelineEntry[]
  readonly threadId: string | null
}): AgentWorkspaceTimelineEntry[] {
  const backendUserPromptKeys = new Set(
    backendTimeline
      .filter((entry) => entry.kind === 'user')
      .map((entry) => `${entry.threadId}:${entry.text}`)
  )
  return [
    ...backendTimeline,
    ...localUserTimeline.filter(
      (entry) =>
        entry.threadId === threadId && !backendUserPromptKeys.has(`${entry.threadId}:${entry.text}`)
    )
  ].sort((a, b) => {
    // Why: chat transcripts read oldest-to-newest; backend and local
    // optimistic entries arrive from different sources and need one order.
    return compareAgentTimelineEntries(a, b)
  })
}
