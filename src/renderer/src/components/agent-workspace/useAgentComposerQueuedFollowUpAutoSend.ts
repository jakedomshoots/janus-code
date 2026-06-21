import { useEffect, type MutableRefObject } from 'react'
import { translate } from '@/i18n/i18n'
import {
  getQueuedFollowUpKey,
  isQueuedFollowUpTarget,
  type AgentComposerQueuedFollowUp
} from './agent-composer-queued-follow-up'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'
import { submitAgentComposerMessage, type AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentComposerProps } from './agent-composer-props'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function useAgentComposerQueuedFollowUpAutoSend({
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
}: {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  selectedThreadBusy: boolean
  canSendToSelectedThread: boolean
  queuedFollowUp: AgentComposerQueuedFollowUp | null
  queuedFollowUpAutoSendAttemptRef: MutableRefObject<string | null>
  submitContextKeyRef: MutableRefObject<string>
  submittingRef: MutableRefObject<boolean>
  onMessageSent?: AgentComposerProps['onMessageSent']
  setQueuedFollowUp: React.Dispatch<React.SetStateAction<AgentComposerQueuedFollowUp | null>>
  setSubmitResult: React.Dispatch<React.SetStateAction<AgentComposerFeedback | null>>
}): void {
  useEffect(() => {
    if (
      !queuedFollowUp ||
      !selectedThread ||
      !isQueuedFollowUpTarget({ queuedFollowUp, activeWorktreeId, selectedThread }) ||
      !canSendToSelectedThread ||
      selectedThreadBusy ||
      submittingRef.current
    ) {
      return
    }

    const queuedFollowUpKey = getQueuedFollowUpKey(queuedFollowUp)
    if (queuedFollowUpAutoSendAttemptRef.current === queuedFollowUpKey) {
      return
    }
    queuedFollowUpAutoSendAttemptRef.current = queuedFollowUpKey
    const requestContextKey = submitContextKeyRef.current
    let cancelled = false
    submittingRef.current = true
    void submitAgentComposerMessage({
      activeWorktreeId,
      selectedThread,
      prompt: queuedFollowUp.prompt
    })
      .then((result: AgentComposerSubmitResult) => {
        if (cancelled || submitContextKeyRef.current !== requestContextKey) {
          return
        }
        submittingRef.current = false
        setSubmitResult(result)
        if (result.status === 'sent') {
          setQueuedFollowUp((current) =>
            current && getQueuedFollowUpKey(current) === queuedFollowUpKey ? null : current
          )
          queuedFollowUpAutoSendAttemptRef.current = null
          notifyAgentComposerMessageSent(onMessageSent, result)
        }
      })
      .catch(() => {
        if (cancelled || submitContextKeyRef.current !== requestContextKey) {
          return
        }
        submittingRef.current = false
        setSubmitResult({
          status: 'error',
          reason: 'send-exception',
          message: translate(
            'auto.components.agentWorkspace.composer.sendException',
            'Could not send the message to the agent.'
          )
        })
      })

    return () => {
      cancelled = true
    }
  }, [
    activeWorktreeId,
    canSendToSelectedThread,
    onMessageSent,
    queuedFollowUp,
    queuedFollowUpAutoSendAttemptRef,
    selectedThread,
    selectedThreadBusy,
    setQueuedFollowUp,
    setSubmitResult,
    submitContextKeyRef,
    submittingRef
  ])
}
