import type { AgentWorkspaceThread } from './agent-workspace-types'
import { getCompletedThreadRecoveryFeedback } from './agent-composer-completed-thread-recovery'
import { submitAgentComposerMessage, type AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentComposerFeedback } from './agent-composer-state'

export type AgentComposerRecoverablePromptRetryResult = {
  result: AgentComposerSubmitResult
  recoveryFeedback: AgentComposerFeedback | null
}

export async function retryAgentComposerRecoverablePrompt({
  activeWorktreeId,
  selectedThread,
  prompt
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  prompt: string
}): Promise<AgentComposerRecoverablePromptRetryResult> {
  const result = await submitAgentComposerMessage({
    activeWorktreeId,
    selectedThread,
    prompt
  })
  return {
    result,
    recoveryFeedback: getCompletedThreadRecoveryFeedback({ result, selectedThread })
  }
}
