import { translate } from '@/i18n/i18n'
import { startProjectlessPlanningAgent } from '@/lib/projectless-planning-agent'
import type { TuiAgent } from '../../../../shared/types'

export type ProjectlessPlanningComposerFeedback = {
  message: string
  status: 'launching' | 'error'
  reason?: 'launch-failed'
}

export async function launchProjectlessPlanningComposerAgent({
  prompt,
  selectedAgent
}: {
  prompt: string
  selectedAgent: TuiAgent | null
}): Promise<ProjectlessPlanningComposerFeedback> {
  const started = await startProjectlessPlanningAgent({ prompt, agent: selectedAgent })
  if (!started) {
    return {
      status: 'error',
      reason: 'launch-failed',
      message: translate(
        'auto.components.agentWorkspace.composer.projectlessLaunchFailed',
        'Could not start a planning agent.'
      )
    }
  }
  return {
    status: 'launching',
    message: translate(
      'auto.components.agentWorkspace.composer.projectlessAgentLaunching',
      'Starting a planning agent.'
    )
  }
}
