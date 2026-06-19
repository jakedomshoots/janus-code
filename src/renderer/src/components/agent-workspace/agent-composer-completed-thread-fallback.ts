import { isTuiAgent } from '../../../../shared/tui-agent-config'
import { resolveTuiAgentSelectedModel } from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { AgentComposerLaunchFeedback } from './agent-composer-launch'
import { launchSelectedAgent } from './agent-composer-launch'
import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function launchCompletedThreadFallback({
  result,
  selectedThread,
  activeWorktreeId,
  composerModelSelections,
  thinkingMode,
  prompt,
  onPromptDelivered
}: {
  result: AgentComposerSubmitResult
  selectedThread: AgentWorkspaceThread | null
  activeWorktreeId: string | null
  composerModelSelections: Partial<Record<TuiAgent, string>>
  thinkingMode: TuiAgentThinkingMode
  prompt: string
  onPromptDelivered: (agent: TuiAgent) => void
}): AgentComposerLaunchFeedback | null {
  if (
    selectedThread?.phase !== 'completed' ||
    result.status !== 'error' ||
    (result.reason !== 'no-agent' && result.reason !== 'no-active-terminal') ||
    !isTuiAgent(selectedThread.agentKind)
  ) {
    return null
  }

  const completedThreadAgent = selectedThread.agentKind
  return launchSelectedAgent({
    activeWorktreeId,
    selectedAgent: completedThreadAgent,
    selectedModel: resolveTuiAgentSelectedModel(completedThreadAgent, composerModelSelections),
    thinkingMode,
    prompt,
    onPromptDelivered: () => onPromptDelivered(completedThreadAgent)
  })
}
