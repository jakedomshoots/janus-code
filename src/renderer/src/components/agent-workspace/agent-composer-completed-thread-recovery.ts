import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentComposerFeedback } from './agent-composer-state'

export function getCompletedThreadRecoveryFeedback({
  result,
  selectedThread
}: {
  result: AgentComposerSubmitResult
  selectedThread: AgentWorkspaceThread | null
}): AgentComposerFeedback | null {
  if (result.status !== 'sent' || selectedThread?.phase !== 'completed') {
    return null
  }
  return {
    status: 'sent',
    message: translate(
      'auto.components.agentWorkspace.composer.messageAcceptedCompletedThreadRecovery',
      'Message accepted by {{agent}}. If nothing changes, restore this message and try again or open the terminal drawer.',
      { agent: formatAgentTypeLabel(selectedThread.agentKind) }
    )
  }
}
