import {
  buildAgentDraftLaunchPlan,
  buildAgentStartupPlan,
  type AgentDraftLaunchPlan,
  type AgentStartupPlan
} from '@/lib/tui-agent-startup'
import { TUI_AGENT_CONFIG } from '../../../shared/tui-agent-config'
import type { TuiAgent } from '../../../shared/types'

const WIN32_INLINE_DRAFT_LIMIT_CHARS = 24_000

export type AgentTabPromptDelivery = 'auto-submit' | 'draft' | 'submit-after-ready'

export type AgentTabStartupPlanResolution = {
  startupPlan: AgentStartupPlan | null
  pasteDraftAfterLaunch: string | null
  submitPastedPrompt: boolean
  forcePasteAfterLaunch: boolean
}

export function resolveAgentTabStartupPlan({
  agent,
  trimmedPrompt,
  promptDelivery,
  cmdOverrides,
  launchPlatform,
  agentArgs,
  agentEnv
}: {
  agent: TuiAgent
  trimmedPrompt: string
  promptDelivery: AgentTabPromptDelivery
  cmdOverrides: Partial<Record<TuiAgent, string>>
  launchPlatform: NodeJS.Platform
  agentArgs?: string | null
  agentEnv?: Record<string, string> | null
}): AgentTabStartupPlanResolution {
  const hasPrompt = trimmedPrompt.length > 0
  const isFollowupPath = TUI_AGENT_CONFIG[agent].promptInjectionMode === 'stdin-after-start'

  if (hasPrompt && promptDelivery === 'submit-after-ready') {
    return {
      startupPlan: buildEmptyPromptStartupPlan({
        agent,
        cmdOverrides,
        launchPlatform,
        agentArgs,
        agentEnv
      }),
      pasteDraftAfterLaunch: trimmedPrompt,
      submitPastedPrompt: true,
      forcePasteAfterLaunch: true
    }
  }

  if (hasPrompt && promptDelivery === 'draft') {
    const draftLaunchPlan = buildAgentDraftLaunchPlan({
      agent,
      draft: trimmedPrompt,
      cmdOverrides,
      platform: launchPlatform,
      agentArgs,
      agentEnv
    })
    if (draftLaunchPlan && canUseInlineDraftLaunchPlan(draftLaunchPlan, launchPlatform)) {
      return {
        startupPlan: {
          agent: draftLaunchPlan.agent,
          launchCommand: draftLaunchPlan.launchCommand,
          expectedProcess: draftLaunchPlan.expectedProcess,
          followupPrompt: null,
          ...(draftLaunchPlan.env ? { env: draftLaunchPlan.env } : {})
        },
        pasteDraftAfterLaunch: null,
        submitPastedPrompt: false,
        forcePasteAfterLaunch: false
      }
    }
    return {
      startupPlan: buildEmptyPromptStartupPlan({
        agent,
        cmdOverrides,
        launchPlatform,
        agentArgs,
        agentEnv
      }),
      pasteDraftAfterLaunch: trimmedPrompt,
      submitPastedPrompt: false,
      forcePasteAfterLaunch: false
    }
  }

  if (hasPrompt && isFollowupPath) {
    return {
      startupPlan: buildEmptyPromptStartupPlan({
        agent,
        cmdOverrides,
        launchPlatform,
        agentArgs,
        agentEnv
      }),
      pasteDraftAfterLaunch: trimmedPrompt,
      submitPastedPrompt: false,
      forcePasteAfterLaunch: false
    }
  }

  return {
    startupPlan: buildAgentStartupPlan({
      agent,
      prompt: hasPrompt ? trimmedPrompt : '',
      cmdOverrides,
      platform: launchPlatform,
      agentArgs,
      agentEnv,
      allowEmptyPromptLaunch: !hasPrompt
    }),
    pasteDraftAfterLaunch: null,
    submitPastedPrompt: false,
    forcePasteAfterLaunch: false
  }
}

function buildEmptyPromptStartupPlan({
  agent,
  cmdOverrides,
  launchPlatform,
  agentArgs,
  agentEnv
}: {
  agent: TuiAgent
  cmdOverrides: Partial<Record<TuiAgent, string>>
  launchPlatform: NodeJS.Platform
  agentArgs?: string | null
  agentEnv?: Record<string, string> | null
}): AgentStartupPlan | null {
  return buildAgentStartupPlan({
    agent,
    prompt: '',
    cmdOverrides,
    platform: launchPlatform,
    agentArgs,
    agentEnv,
    allowEmptyPromptLaunch: true
  })
}

function canUseInlineDraftLaunchPlan(
  plan: AgentDraftLaunchPlan,
  platform: NodeJS.Platform
): boolean {
  if (platform !== 'win32') {
    return true
  }
  const envChars = Object.entries(plan.env ?? {}).reduce(
    (total, [key, value]) => total + key.length + value.length,
    0
  )
  // Why: Windows CreateProcess/env blocks have tight length ceilings. Large
  // generated drafts should use the existing post-ready paste path instead of
  // failing the PTY spawn before the agent starts.
  return plan.launchCommand.length + envChars <= WIN32_INLINE_DRAFT_LIMIT_CHARS
}
