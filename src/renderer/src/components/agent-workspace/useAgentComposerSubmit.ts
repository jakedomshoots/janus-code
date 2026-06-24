import {
  useCallback,
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type SetStateAction
} from 'react'
import { createPromptDeliveredFeedback } from './agent-composer-delivery-feedback'
import { launchCompletedThreadFallback } from './agent-composer-completed-thread-fallback'
import { getCompletedThreadRecoveryFeedback } from './agent-composer-completed-thread-recovery'
import { launchSelectedAgent } from './agent-composer-launch'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'
import {
  markPendingAgentComposerEchoDelivered,
  settlePendingAgentComposerEcho,
  startPendingAgentComposerEcho
} from './agent-composer-pending-echo'
import { launchProjectlessPlanningComposerAgent } from './agent-composer-projectless-launch'
import { submitAgentComposerMessage } from './agent-composer-submit'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'

export function useAgentComposerSubmit({
  activeWorktreeId,
  canSendToSelectedThread,
  composerModelSelections,
  onMessageSent,
  onPromptRepresentedInTranscript,
  onPendingAgentLaunch,
  prompt,
  selectedAgent,
  selectedModel,
  selectedThread,
  selectedThreadIdentityKeyRef,
  setPrompt,
  setRecoverablePrompt,
  setSubmitResult,
  setSubmitting,
  submitContextKey,
  submitContextKeyRef,
  submitSequenceRef,
  submitting,
  thinkingMode,
  trimmedPrompt
}: {
  activeWorktreeId: string | null
  canSendToSelectedThread: boolean
  composerModelSelections: Partial<Record<TuiAgent, string>>
  onMessageSent?: AgentComposerMessageSentHandler
  onPromptRepresentedInTranscript?: (prompt: string) => void
  onPendingAgentLaunch?: () => void
  prompt: string
  selectedAgent: TuiAgent | null
  selectedModel: string
  selectedThread: AgentWorkspaceThread | null
  selectedThreadIdentityKeyRef: MutableRefObject<string>
  setPrompt: Dispatch<SetStateAction<string>>
  setRecoverablePrompt: Dispatch<SetStateAction<string | null>>
  setSubmitResult: Dispatch<SetStateAction<AgentComposerFeedback | null>>
  setSubmitting: Dispatch<SetStateAction<boolean>>
  submitContextKey: string
  submitContextKeyRef: MutableRefObject<string>
  submitSequenceRef: MutableRefObject<number>
  submitting: boolean
  thinkingMode: TuiAgentThinkingMode
  trimmedPrompt: string
}): (event?: FormEvent<HTMLFormElement>) => Promise<void> {
  return useCallback(
    async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
      event?.preventDefault()
      if (submitting || !trimmedPrompt) {
        return
      }
      const submitSequence = submitSequenceRef.current + 1
      submitSequenceRef.current = submitSequence
      const requestContextKey = submitContextKey
      const requestThreadIdentityKey = getAgentComposerThreadIdentityKey(selectedThread)
      setSubmitting(true)
      const launchingNewAgent = !canSendToSelectedThread && Boolean(activeWorktreeId)
      const pendingEcho = startPendingAgentComposerEcho({
        canSendToSelectedThread,
        selectedThread,
        prompt: trimmedPrompt,
        submitSequence,
        onMessageSent
      })
      const result = canSendToSelectedThread
        ? await submitAgentComposerMessage({ activeWorktreeId, selectedThread, prompt })
        : activeWorktreeId
          ? launchSelectedAgent({
              activeWorktreeId,
              selectedAgent,
              selectedModel,
              thinkingMode,
              prompt: trimmedPrompt,
              onPromptDelivered: () => {
                if (
                  submitSequenceRef.current !== submitSequence ||
                  submitContextKeyRef.current !== requestContextKey
                ) {
                  return
                }
                setSubmitResult(createPromptDeliveredFeedback(selectedAgent))
                setPrompt((currentPrompt) =>
                  currentPrompt.trim() === trimmedPrompt ? '' : currentPrompt
                )
              }
            })
          : await launchProjectlessPlanningComposerAgent({ prompt: trimmedPrompt, selectedAgent })
      if (
        submitSequenceRef.current !== submitSequence ||
        submitContextKeyRef.current !== requestContextKey
      ) {
        if (canSendToSelectedThread) {
          const completedThreadSubmitResult = result as Awaited<
            ReturnType<typeof submitAgentComposerMessage>
          >
          settlePendingAgentComposerEcho(pendingEcho, completedThreadSubmitResult, onMessageSent)
          if (
            completedThreadSubmitResult.status === 'sent' &&
            selectedThreadIdentityKeyRef.current === requestThreadIdentityKey
          ) {
            // Why: a successful send can update the thread phase before this
            // promise resumes; only clear if the same thread is still selected.
            setPrompt((currentPrompt) =>
              currentPrompt.trim() === trimmedPrompt ? '' : currentPrompt
            )
            setRecoverablePrompt(null)
          }
        }
        return
      }
      if (canSendToSelectedThread) {
        const completedThreadSubmitResult = result as Awaited<
          ReturnType<typeof submitAgentComposerMessage>
        >
        const fallbackResult = launchCompletedThreadFallback({
          result: completedThreadSubmitResult,
          selectedThread,
          activeWorktreeId,
          composerModelSelections,
          thinkingMode,
          prompt: trimmedPrompt,
          onPromptDelivered: (agent) => {
            markPendingAgentComposerEchoDelivered(pendingEcho, onMessageSent)
            if (
              submitSequenceRef.current !== submitSequence ||
              submitContextKeyRef.current !== requestContextKey
            ) {
              return
            }
            setSubmitResult(createPromptDeliveredFeedback(agent))
            setPrompt((currentPrompt) =>
              currentPrompt.trim() === trimmedPrompt ? '' : currentPrompt
            )
          }
        })
        if (fallbackResult) {
          if (fallbackResult.status !== 'launching') {
            settlePendingAgentComposerEcho(pendingEcho, completedThreadSubmitResult, onMessageSent)
          }
          setSubmitResult(fallbackResult)
          setSubmitting(false)
          if (fallbackResult.status === 'launching') {
            onPromptRepresentedInTranscript?.(trimmedPrompt)
            onPendingAgentLaunch?.()
          }
          return
        }
        settlePendingAgentComposerEcho(pendingEcho, completedThreadSubmitResult, onMessageSent)
      }
      setSubmitResult(result)
      setSubmitting(false)
      if (!canSendToSelectedThread && !activeWorktreeId && result.status === 'launching') {
        // Projectless launches do not get a delivered callback, so clear only the accepted draft.
        setPrompt((currentPrompt) => (currentPrompt.trim() === trimmedPrompt ? '' : currentPrompt))
      }
      if (launchingNewAgent && result.status === 'launching') {
        onPromptRepresentedInTranscript?.(trimmedPrompt)
        onPendingAgentLaunch?.()
      }
      if (canSendToSelectedThread && result.status === 'sent' && !pendingEcho) {
        notifyAgentComposerMessageSent(onMessageSent, result)
      }
      if (canSendToSelectedThread && result.status === 'sent') {
        setPrompt('')
        const recoveryFeedback = getCompletedThreadRecoveryFeedback({ result, selectedThread })
        if (recoveryFeedback) {
          setRecoverablePrompt(result.prompt)
          setSubmitResult(recoveryFeedback)
        } else {
          setRecoverablePrompt(null)
        }
      }
    },
    [
      activeWorktreeId,
      canSendToSelectedThread,
      composerModelSelections,
      onMessageSent,
      onPromptRepresentedInTranscript,
      onPendingAgentLaunch,
      prompt,
      selectedAgent,
      selectedModel,
      selectedThread,
      selectedThreadIdentityKeyRef,
      setPrompt,
      setRecoverablePrompt,
      setSubmitResult,
      setSubmitting,
      submitContextKey,
      submitContextKeyRef,
      submitSequenceRef,
      submitting,
      thinkingMode,
      trimmedPrompt
    ]
  )
}

function getAgentComposerThreadIdentityKey(thread: AgentWorkspaceThread | null): string {
  return `${thread?.id ?? ''}\u0000${thread?.worktreeId ?? ''}`
}
