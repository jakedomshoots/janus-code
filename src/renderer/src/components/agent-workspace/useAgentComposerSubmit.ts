import { useCallback, type FormEvent, type MutableRefObject } from 'react'
import { translate } from '@/i18n/i18n'
import { createPromptDeliveredFeedback } from './agent-composer-delivery-feedback'
import { getCompletedThreadRecoveryFeedback } from './agent-composer-completed-thread-recovery'
import { launchCompletedThreadFallback } from './agent-composer-completed-thread-fallback'
import { launchSelectedAgent } from './agent-composer-launch'
import { launchProjectlessPlanningComposerAgent } from './agent-composer-projectless-launch'
import type { AgentComposerQueuedFollowUp } from './agent-composer-queued-follow-up'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'
import { submitAgentComposerMessage } from './agent-composer-submit'
import { useAgentComposerQueuedFollowUpAutoSend } from './useAgentComposerQueuedFollowUpAutoSend'
import type { AgentComposerContextManifest } from './agent-composer-context-manifest'
import type { AgentComposerProps } from './agent-composer-props'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentStatusVerificationExecutionContext } from '../../../../shared/agent-status-types'

export function useAgentComposerSubmit({
  activeWorktreeId,
  selectedThread,
  selectedThreadBusy,
  canSendToSelectedThread,
  selectedAgent,
  selectedModel,
  thinkingMode,
  prompt,
  trimmedPrompt,
  trimmedVerificationCommand,
  verificationExecutionContext,
  promptContextManifest,
  agentLaunchPlatform,
  composerModelSelections,
  submitContextKey,
  submitting,
  queuedFollowUp,
  submitSequenceRef,
  submitContextKeyRef,
  queuedFollowUpAutoSendAttemptRef,
  submittingRef,
  onMessageSent,
  onPendingAgentLaunch,
  setPrompt,
  setVerificationCommand,
  setQueuedFollowUp,
  setSubmitResult,
  setSubmitting,
  setRecoverablePrompt,
  setAgentMemoryContextEnabled
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  selectedThreadBusy: boolean
  canSendToSelectedThread: boolean
  selectedAgent: TuiAgent | null
  selectedModel: string
  thinkingMode: TuiAgentThinkingMode
  prompt: string
  trimmedPrompt: string
  trimmedVerificationCommand: string
  verificationExecutionContext?: AgentStatusVerificationExecutionContext
  promptContextManifest: AgentComposerContextManifest
  agentLaunchPlatform?: NodeJS.Platform
  composerModelSelections: Partial<Record<TuiAgent, string>>
  submitContextKey: string
  submitting: boolean
  queuedFollowUp: AgentComposerQueuedFollowUp | null
  submitSequenceRef: MutableRefObject<number>
  submitContextKeyRef: MutableRefObject<string>
  queuedFollowUpAutoSendAttemptRef: MutableRefObject<string | null>
  submittingRef: MutableRefObject<boolean>
  onMessageSent?: AgentComposerProps['onMessageSent']
  onPendingAgentLaunch?: AgentComposerProps['onPendingAgentLaunch']
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  setVerificationCommand: React.Dispatch<React.SetStateAction<string>>
  setQueuedFollowUp: React.Dispatch<React.SetStateAction<AgentComposerQueuedFollowUp | null>>
  setSubmitResult: React.Dispatch<React.SetStateAction<AgentComposerFeedback | null>>
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>
  setRecoverablePrompt: React.Dispatch<React.SetStateAction<string | null>>
  setAgentMemoryContextEnabled: React.Dispatch<React.SetStateAction<boolean>>
}): {
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  handleQueuedFollowUpChange: (value: string) => void
  handleDeleteQueuedFollowUp: () => void
} {
  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
      event?.preventDefault()
      if (submitting || !trimmedPrompt) {
        return
      }
      const submitSequence = submitSequenceRef.current + 1
      submitSequenceRef.current = submitSequence
      const requestContextKey = submitContextKey
      if (canSendToSelectedThread && selectedThreadBusy && selectedThread) {
        setQueuedFollowUp({
          threadId: selectedThread.id,
          worktreeId: selectedThread.worktreeId,
          prompt: trimmedPrompt
        })
        queuedFollowUpAutoSendAttemptRef.current = null
        setPrompt('')
        setSubmitResult({
          status: 'blocked',
          reason: 'queued-follow-up',
          message: translate(
            'auto.components.agentWorkspace.composer.followUpQueued',
            'Queued follow-up.'
          )
        })
        return
      }
      setSubmitting(true)
      const launchingNewAgent = !canSendToSelectedThread && Boolean(activeWorktreeId)
      const result = canSendToSelectedThread
        ? await submitAgentComposerMessage({
            activeWorktreeId,
            selectedThread,
            prompt
          })
        : activeWorktreeId
          ? launchSelectedAgent({
              activeWorktreeId,
              selectedAgent,
              selectedModel,
              thinkingMode,
              prompt: trimmedPrompt,
              verificationCommand: trimmedVerificationCommand,
              verificationExecutionContext,
              promptContextManifest,
              launchPlatform: agentLaunchPlatform,
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
                setVerificationCommand((currentCommand) =>
                  currentCommand.trim() === trimmedVerificationCommand ? '' : currentCommand
                )
                setAgentMemoryContextEnabled(true)
              }
            })
          : await launchProjectlessPlanningComposerAgent({
              prompt: trimmedPrompt,
              selectedAgent
            })
      if (
        submitSequenceRef.current !== submitSequence ||
        submitContextKeyRef.current !== requestContextKey
      ) {
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
          setSubmitResult(fallbackResult)
          setSubmitting(false)
          if (fallbackResult.status === 'launching') {
            onPendingAgentLaunch?.()
          }
          return
        }
      }
      setSubmitResult(result)
      setSubmitting(false)
      if (launchingNewAgent && result.status === 'launching') {
        onPendingAgentLaunch?.()
      }
      if (canSendToSelectedThread && result.status === 'sent') {
        notifyAgentComposerMessageSent(onMessageSent, result)
      }
      if (canSendToSelectedThread && result.status === 'sent') {
        setPrompt('')
      }
      if (canSendToSelectedThread && result.status === 'sent') {
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
      agentLaunchPlatform,
      canSendToSelectedThread,
      composerModelSelections,
      prompt,
      promptContextManifest,
      selectedAgent,
      selectedModel,
      selectedThread,
      selectedThreadBusy,
      trimmedVerificationCommand,
      onMessageSent,
      onPendingAgentLaunch,
      submitContextKey,
      submitting,
      thinkingMode,
      trimmedPrompt,
      verificationExecutionContext,
      setAgentMemoryContextEnabled,
      setPrompt,
      setQueuedFollowUp,
      setRecoverablePrompt,
      setSubmitResult,
      setSubmitting,
      setVerificationCommand,
      queuedFollowUpAutoSendAttemptRef,
      submitContextKeyRef,
      submitSequenceRef
    ]
  )

  useAgentComposerQueuedFollowUpAutoSend({
    activeWorktreeId,
    selectedThread,
    selectedThreadBusy,
    canSendToSelectedThread,
    queuedFollowUp,
    queuedFollowUpAutoSendAttemptRef,
    submitContextKeyRef,
    submittingRef,
    onMessageSent,
    setQueuedFollowUp,
    setSubmitResult
  })

  const handleQueuedFollowUpChange = useCallback(
    (value: string): void => {
      queuedFollowUpAutoSendAttemptRef.current = null
      setQueuedFollowUp((current) => (current ? { ...current, prompt: value } : current))
    },
    [queuedFollowUpAutoSendAttemptRef, setQueuedFollowUp]
  )

  const handleDeleteQueuedFollowUp = useCallback((): void => {
    queuedFollowUpAutoSendAttemptRef.current = null
    setQueuedFollowUp(null)
  }, [queuedFollowUpAutoSendAttemptRef, setQueuedFollowUp])

  return {
    handleSubmit,
    handleQueuedFollowUpChange,
    handleDeleteQueuedFollowUp
  }
}
