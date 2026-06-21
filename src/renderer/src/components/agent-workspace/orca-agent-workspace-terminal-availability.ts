import type { AppState } from '@/store'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'

export function hasAgentWorkspaceTerminalTabs(
  state: AppState,
  projects: readonly AgentWorkspaceProject[]
): boolean {
  return projects.some((project) => (state.tabsByWorktree[project.id] ?? []).length > 0)
}

export function hasAgentWorkspaceTerminalAvailability({
  state,
  projects,
  threads
}: {
  state: AppState
  projects: readonly AgentWorkspaceProject[]
  threads: readonly AgentWorkspaceThread[]
}): boolean {
  return threads.length > 0 || hasAgentWorkspaceTerminalTabs(state, projects)
}
