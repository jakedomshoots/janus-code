import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'
import { retryAgentComposerRecoverablePrompt } from './agent-composer-recoverable-prompt-retry'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function useAgentComposerRecoverablePromptActions({
  activeWorktreeId,
  selectedThread,
  recoverablePrompt,
  submitting,
  canSendToSelectedThread,
  onMessageSent,
  setPrompt,
  setRecoverablePrompt,
  setSubmitResult,
  setSubmitting,
  onRecoverablePromptRestored
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  recoverablePrompt: string | null
  submitting: boolean
  canSendToSelectedThread: boolean
  onMessageSent?: AgentComposerMessageSentHandler
  setPrompt: Dispatch<SetStateAction<string>>
  setRecoverablePrompt: Dispatch<SetStateAction<string | null>>
  setSubmitResult: Dispatch<SetStateAction<AgentComposerFeedback | null>>
  setSubmitting: Dispatch<SetStateAction<boolean>>
  onRecoverablePromptRestored?: (prompt: string) => void
}): {
  restoreRecoverablePrompt: () => void
  retryRecoverablePrompt: () => Promise<void>
} {
  const restoreRecoverablePrompt = useCallback((): void => {
    if (!recoverablePrompt) {
      return
    }
    setPrompt(recoverablePrompt)
    onRecoverablePromptRestored?.(recoverablePrompt)
    setRecoverablePrompt(null)
    setSubmitResult(null)
  }, [
    onRecoverablePromptRestored,
    recoverablePrompt,
    setPrompt,
    setRecoverablePrompt,
    setSubmitResult
  ])

  const retryRecoverablePrompt = useCallback(async (): Promise<void> => {
    if (!recoverablePrompt || submitting || !canSendToSelectedThread) {
      return
    }
    setSubmitting(true)
    const { result, recoveryFeedback } = await retryAgentComposerRecoverablePrompt({
      activeWorktreeId,
      selectedThread,
      prompt: recoverablePrompt
    })
    setSubmitResult(result)
    setSubmitting(false)
    if (result.status !== 'sent') {
      return
    }
    notifyAgentComposerMessageSent(onMessageSent, result)
    setPrompt('')
    setRecoverablePrompt(recoveryFeedback ? result.prompt : null)
    if (recoveryFeedback) {
      setSubmitResult(recoveryFeedback)
    }
  }, [
    activeWorktreeId,
    canSendToSelectedThread,
    onMessageSent,
    recoverablePrompt,
    selectedThread,
    setPrompt,
    setRecoverablePrompt,
    setSubmitResult,
    setSubmitting,
    submitting
  ])

  return { restoreRecoverablePrompt, retryRecoverablePrompt }
}
