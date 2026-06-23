import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function getTimelineSlashCommand(entry: AgentWorkspaceTimelineEntry): string | null {
  if (entry.kind !== 'user') {
    return null
  }
  const [firstToken] = entry.text.trim().split(/\s+/, 1)
  if (!firstToken?.startsWith('/') || firstToken.length === 1) {
    return null
  }
  return firstToken
}
