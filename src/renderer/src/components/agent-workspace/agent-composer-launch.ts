import { translate } from '@/i18n/i18n'
import { getAgentCatalog } from '@/lib/agent-catalog'
import { launchAgentInNewTab } from '@/lib/launch-agent-in-new-tab'
import { useAppStore } from '@/store'
import { resolveTuiAgentLaunchArgs } from '../../../../shared/tui-agent-launch-defaults'
import {
  resolveTuiAgentModelLaunchArgs,
  stripTuiAgentModelLaunchArgs
} from '../../../../shared/tui-agent-models'
import {
  mergeTuiAgentLaunchArgs,
  resolveTuiAgentThinkingArgs,
  type TuiAgentThinkingMode
} from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentStatusVerificationExecutionContext } from '../../../../shared/agent-status-types'
import type { AgentComposerContextManifest } from './agent-composer-context-manifest'

export type AgentComposerLaunchFeedback = {
  message: string
  status: 'launching' | 'blocked' | 'error'
  reason?: string
}

export function launchSelectedAgent({
  activeWorktreeId,
  selectedAgent,
  selectedModel,
  thinkingMode,
  prompt,
  verificationCommand,
  verificationExecutionContext,
  promptContextManifest,
  launchPlatform,
  onPromptDelivered
}: {
  activeWorktreeId: string | null
  selectedAgent: TuiAgent | null
  selectedModel: string
  thinkingMode: TuiAgentThinkingMode
  prompt: string
  verificationCommand?: string | null
  verificationExecutionContext?: AgentStatusVerificationExecutionContext
  promptContextManifest?: AgentComposerContextManifest
  launchPlatform?: NodeJS.Platform
  onPromptDelivered?: () => void
}): AgentComposerLaunchFeedback {
  if (!activeWorktreeId || !selectedAgent) {
    return {
      status: 'blocked',
      reason: 'no-launch-target',
      message: translate(
        'auto.components.agentWorkspace.composer.selectProviderBeforeLaunching',
        'Select an available agent before sending.'
      )
    }
  }
  const store = useAppStore.getState()
  const baseAgentArgs = resolveTuiAgentLaunchArgs(selectedAgent, store.settings?.agentDefaultArgs)
  const modelBaseAgentArgs = stripTuiAgentModelLaunchArgs(selectedAgent, baseAgentArgs)
  const modelAgentArgs = resolveTuiAgentModelLaunchArgs(selectedAgent, selectedModel)
  const agentArgs = mergeTuiAgentLaunchArgs(
    mergeTuiAgentLaunchArgs(modelBaseAgentArgs, modelAgentArgs),
    resolveTuiAgentThinkingArgs(selectedAgent, thinkingMode)
  )
  const result = launchAgentInNewTab({
    agent: selectedAgent,
    worktreeId: activeWorktreeId,
    prompt,
    promptDelivery: 'auto-submit',
    ...(agentArgs ? { agentArgs } : {}),
    launchSource: 'new_workspace_composer',
    ...(verificationCommand?.trim() ? { verificationCommand: verificationCommand.trim() } : {}),
    ...(verificationCommand?.trim() && verificationExecutionContext
      ? { verificationExecutionContext }
      : {}),
    ...(promptContextManifest && promptContextManifest.items.length > 0
      ? { promptContextManifest }
      : {}),
    ...(launchPlatform ? { launchPlatform } : {}),
    onPromptDelivered
  })
  const agentLabel = getAgentLabel(selectedAgent)
  if (!result) {
    return {
      status: 'error',
      reason: 'launch-failed',
      message: translate(
        'auto.components.agentWorkspace.composer.launchFailed',
        'Could not start {{agent}}.',
        { agent: agentLabel }
      )
    }
  }
  return {
    status: 'launching',
    message: translate(
      'auto.components.agentWorkspace.composer.agentLaunching',
      'Starting {{agent}} with your message.',
      {
        agent: agentLabel
      }
    )
  }
}

function getAgentLabel(agent: TuiAgent): string {
  return getAgentCatalog().find((candidate) => candidate.id === agent)?.label ?? agent
}
