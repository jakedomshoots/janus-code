import { translate } from '@/i18n/i18n'
import { getAgentLabel } from '@/lib/agent-catalog'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export type PromptDeliveredFeedback = {
  message: string
  status: 'sent'
}

export type AgentComposerDeliveryState =
  | 'idle'
  | 'blocked'
  | 'queued'
  | 'accepted'
  | 'running'
  | 'needs-input'
  | 'failed'

export type AgentComposerDeliveryStepId =
  | 'queued'
  | 'accepted'
  | 'running'
  | 'needs-input'
  | 'failed'

export type AgentComposerDeliveryStep = {
  readonly id: AgentComposerDeliveryStepId
  readonly label: string
  readonly state: 'complete' | 'current' | 'upcoming'
}

export type AgentComposerDeliveryFeedback = {
  readonly state: AgentComposerDeliveryState
  readonly label: string
  readonly detail: string
  readonly steps: readonly AgentComposerDeliveryStep[]
}

export function createPromptDeliveredFeedback(agent: TuiAgent | null): PromptDeliveredFeedback {
  const agentLabel = agent ? getAgentLabel(agent) : 'agent'
  return {
    status: 'sent',
    message: translate(
      'auto.components.agentWorkspace.composer.messageAcceptedByAgent',
      'Message accepted by {{agent}}.',
      { agent: agentLabel }
    )
  }
}

export function resolveAgentComposerDeliveryFeedback({
  submitting,
  statusTone,
  statusMessage,
  selectedThread,
  recoverablePrompt
}: {
  submitting: boolean
  statusTone: string | null
  statusMessage: string | null
  selectedThread: AgentWorkspaceThread | null
  recoverablePrompt: string | null
}): AgentComposerDeliveryFeedback {
  const state = getDeliveryState({
    submitting,
    statusTone,
    statusMessage,
    selectedThread,
    recoverablePrompt
  })
  const label = getDeliveryStateLabel(state)
  return {
    state,
    label,
    detail: getDeliveryStateDetail(state, selectedThread),
    steps: getDeliverySteps(state)
  }
}

function getDeliveryState({
  submitting,
  statusTone,
  statusMessage,
  selectedThread,
  recoverablePrompt
}: {
  submitting: boolean
  statusTone: string | null
  statusMessage: string | null
  selectedThread: AgentWorkspaceThread | null
  recoverablePrompt: string | null
}): AgentComposerDeliveryState {
  if (statusTone === 'error' || recoverablePrompt) {
    return 'failed'
  }
  if (submitting) {
    return 'queued'
  }
  if (statusTone === 'sent') {
    return 'accepted'
  }
  if (selectedThread?.phase === 'waiting-for-user' || selectedThread?.phase === 'needs-approval') {
    return 'needs-input'
  }
  if (selectedThread?.phase === 'running') {
    return 'running'
  }
  if (statusTone === 'blocked' || statusMessage) {
    return 'blocked'
  }
  return 'idle'
}

function getDeliveryStateLabel(state: AgentComposerDeliveryState): string {
  switch (state) {
    case 'idle':
      return translate('auto.components.agentWorkspace.composer.deliveryIdle', 'Ready')
    case 'blocked':
      return translate('auto.components.agentWorkspace.composer.deliveryBlocked', 'Blocked')
    case 'queued':
      return translate('auto.components.agentWorkspace.composer.deliveryQueued', 'Queued')
    case 'accepted':
      return translate('auto.components.agentWorkspace.composer.deliveryAccepted', 'Agent accepted')
    case 'running':
      return translate('auto.components.agentWorkspace.composer.deliveryRunning', 'Running')
    case 'needs-input':
      return translate('auto.components.agentWorkspace.composer.deliveryNeedsInput', 'Needs input')
    case 'failed':
      return translate('auto.components.agentWorkspace.composer.deliveryFailed', 'Failed')
  }
}

function getDeliveryStateDetail(
  state: AgentComposerDeliveryState,
  selectedThread: AgentWorkspaceThread | null
): string {
  switch (state) {
    case 'queued':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryQueuedDetail',
        'Waiting for terminal acceptance.'
      )
    case 'accepted':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryAcceptedDetail',
        'The agent accepted the message.'
      )
    case 'running':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryRunningDetail',
        '{{agent}} is working in this thread.',
        { agent: formatAgentTypeLabel(selectedThread?.agentKind) }
      )
    case 'needs-input':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryNeedsInputDetail',
        '{{agent}} is waiting for input or approval.',
        { agent: formatAgentTypeLabel(selectedThread?.agentKind) }
      )
    case 'failed':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryFailedDetail',
        'Delivery failed. The draft can be restored or sent again.'
      )
    case 'blocked':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryBlockedDetail',
        'Resolve the message above before sending.'
      )
    case 'idle':
      return translate(
        'auto.components.agentWorkspace.composer.deliveryIdleDetail',
        'Type a prompt to queue delivery.'
      )
  }
}

function getDeliverySteps(state: AgentComposerDeliveryState): readonly AgentComposerDeliveryStep[] {
  const stepIds: readonly AgentComposerDeliveryStepId[] = [
    'queued',
    'accepted',
    'running',
    'needs-input',
    'failed'
  ]
  const currentIndex = stepIds.indexOf(toStepState(state))
  return stepIds.map((id, index) => ({
    id,
    label: getDeliveryStateLabel(id),
    state:
      state === 'idle' || state === 'blocked'
        ? 'upcoming'
        : index < currentIndex
          ? 'complete'
          : index === currentIndex
            ? 'current'
            : 'upcoming'
  }))
}

function toStepState(state: AgentComposerDeliveryState): AgentComposerDeliveryStepId {
  switch (state) {
    case 'idle':
    case 'blocked':
      return 'queued'
    case 'queued':
    case 'accepted':
    case 'running':
    case 'needs-input':
    case 'failed':
      return state
  }
}
