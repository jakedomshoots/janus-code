import { translate } from '@/i18n/i18n'
import { getAgentLabel } from '@/lib/agent-catalog'
import type { TuiAgent } from '../../../../shared/types'

export type PromptDeliveredFeedback = {
  message: string
  status: 'sent'
}

export function createPromptDeliveredFeedback(agent: TuiAgent | null): PromptDeliveredFeedback {
  return {
    status: 'sent',
    message: translate(
      'auto.components.agentWorkspace.composer.sentToAgent',
      'Sent to {{agent}}.',
      { agent: agent ? getAgentLabel(agent) : 'agent' }
    )
  }
}
