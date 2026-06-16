import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'

export type AgentWorkspaceRightPanelTab = 'plan' | 'diff' | 'terminal' | 'details'

export type AgentWorkspaceRightPanelState = {
  readonly selectedTab: AgentWorkspaceRightPanelTab
  readonly collapsed: boolean
}

export type AgentWorkspaceRightPanelStateInput = {
  readonly thread: AgentWorkspaceThread | null
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly hasStructuredPlan: boolean
}

export function getDefaultAgentWorkspaceRightPanelTab({
  thread,
  diffs,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelTab {
  return getDefaultAgentWorkspaceRightPanelState({
    thread,
    diffs,
    hasStructuredPlan
  }).selectedTab
}

export function getDefaultAgentWorkspaceRightPanelState({
  thread,
  diffs,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): AgentWorkspaceRightPanelState {
  if (!thread) {
    return { selectedTab: 'terminal', collapsed: true }
  }
  if (thread.phase === 'needs-approval') {
    return { selectedTab: 'details', collapsed: false }
  }
  if (diffs.length > 0) {
    return { selectedTab: 'diff', collapsed: false }
  }
  if (thread.phase === 'running' && hasStructuredPlan) {
    return { selectedTab: 'plan', collapsed: false }
  }
  return { selectedTab: 'terminal', collapsed: true }
}

export function coerceAgentWorkspaceRightPanelTab(
  value: string
): AgentWorkspaceRightPanelTab | null {
  switch (value) {
    case 'plan':
    case 'diff':
    case 'terminal':
    case 'details':
      return value
    default:
      return null
  }
}
