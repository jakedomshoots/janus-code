import type { TuiAgent } from '../../../../shared/types'
import type { AgentWorkspaceAgentDetectionTarget } from './agent-workspace-types'
import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceProject } from './agent-workspace-types'

export type AgentComposerFeedback = {
  message: string
  status: AgentComposerSubmitResult['status'] | 'launching'
  reason?: string
}

export const EMPTY_DISABLED_TUI_AGENTS: readonly TuiAgent[] = []

export function getAgentComposerDetectionTarget(
  selectedProject: AgentWorkspaceProject | null,
  activeWorktreeId: string | null
): AgentWorkspaceAgentDetectionTarget | undefined {
  return (
    selectedProject?.agentDetectionTarget ??
    (activeWorktreeId ? { kind: 'local' as const } : undefined)
  )
}
