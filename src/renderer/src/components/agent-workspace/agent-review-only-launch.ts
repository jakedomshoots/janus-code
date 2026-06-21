import { translate } from '@/i18n/i18n'
import { launchAgentInNewTab } from '@/lib/launch-agent-in-new-tab'
import { resolveTuiAgentLaunchArgs } from '../../../../shared/tui-agent-launch-defaults'
import { isTuiAgent } from '../../../../shared/tui-agent-config'
import { YOLO_TUI_AGENT_ARGS } from '../../../../shared/tui-agent-permissions'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentComposerContextManifest } from './agent-composer-context-manifest'
import { formatAgentWorkspaceDiffStatus } from './agent-workspace-labels'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary
} from './agent-workspace-types'

export type AgentReviewOnlyLaunchSurface = 'diff' | 'review'

export type AgentReviewOnlyLaunchProfile = {
  readonly agentArgs: string
  readonly enforcement: 'hard' | 'soft'
  readonly warning: string | null
}

type AgentReviewOnlySettings = {
  readonly defaultTuiAgent?: TuiAgent | 'blank' | null
  readonly agentDefaultArgs?: Partial<Record<TuiAgent, string>> | null
}

export function getAgentReviewOnlyPreferredAgent(
  settings: AgentReviewOnlySettings | null | undefined
): TuiAgent | null {
  const agent = settings?.defaultTuiAgent
  return agent && agent !== 'blank' && isTuiAgent(agent) ? agent : null
}

export function getAgentReviewOnlyLaunchProfile({
  agent,
  settings
}: {
  agent: TuiAgent
  settings?: AgentReviewOnlySettings | null
}): AgentReviewOnlyLaunchProfile {
  const baseArgs = resolveTuiAgentLaunchArgs(agent, settings?.agentDefaultArgs)
  if (agent === 'codex') {
    return {
      agentArgs: appendArg(stripCodexWriteArgs(baseArgs), '--sandbox read-only'),
      enforcement: 'hard',
      warning: null
    }
  }

  const yoloArgs = YOLO_TUI_AGENT_ARGS[agent]?.trim()
  return {
    agentArgs: yoloArgs && baseArgs.trim() === yoloArgs ? '' : baseArgs.trim(),
    enforcement: 'soft',
    warning: translate(
      'auto.components.agentWorkspace.reviewOnly.bestEffortWarning',
      'Best-effort review-only mode. This agent may still be able to edit files.'
    )
  }
}

export function buildAgentReviewOnlyPrompt({
  diffs,
  review
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): string {
  const lines = [
    translate(
      'auto.components.agentWorkspace.reviewOnly.promptInstruction',
      'Review only the current changes. Do not edit files or run mutating commands.'
    ),
    translate(
      'auto.components.agentWorkspace.reviewOnly.promptFindings',
      'Return prioritized findings with severity, file path, and rationale. If there are no material issues, say so clearly.'
    ),
    translate(
      'auto.components.agentWorkspace.reviewOnly.promptStructuredFindings',
      'When there are findings, include one fenced ```janus-review-findings JSON array with objects containing "severity", "filePath", optional "lineNumber", "title", and "rationale".'
    )
  ]

  if (review) {
    lines.push(
      '',
      translate('auto.components.agentWorkspace.reviewOnly.hostedReviewLabel', 'Hosted review:'),
      `- ${review.providerLabel} #${review.number}: ${review.title}`,
      `- ${review.url}`,
      `- ${review.state} / ${review.status}`
    )
  }

  if (diffs.length > 0) {
    lines.push(
      '',
      translate('auto.components.agentWorkspace.reviewOnly.changedFilesLabel', 'Changed files:')
    )
    for (const diff of diffs) {
      const lineTotals = `+${diff.additions} -${diff.deletions}`
      const area = diff.area ? `, ${diff.area}` : ''
      lines.push(
        `- ${diff.filePath} (${formatAgentWorkspaceDiffStatus(diff.status)}${area}, ${lineTotals})`
      )
    }
  }

  return lines.join('\n')
}

export function buildAgentReviewOnlyContextManifest({
  diffs,
  review
}: {
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentComposerContextManifest {
  const items: AgentComposerContextManifest['items'] = [
    ...(diffs.length > 0
      ? [
          {
            id: 'changes-context' as const,
            kind: 'changes' as const,
            fileCount: diffs.length,
            additions: diffs.reduce((sum, diff) => sum + diff.additions, 0),
            deletions: diffs.reduce((sum, diff) => sum + diff.deletions, 0),
            stale: false
          }
        ]
      : []),
    ...(review
      ? [
          {
            id: 'review-context' as const,
            kind: 'review' as const,
            providerLabel: review.providerLabel,
            number: review.number,
            title: review.title,
            stale: false
          }
        ]
      : [])
  ]
  return { items }
}

export function launchAgentReviewOnly({
  agent,
  worktreeId,
  groupId,
  diffs,
  review,
  settings,
  onPromptDelivered
}: {
  agent: TuiAgent
  worktreeId: string
  groupId?: string | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  settings?: AgentReviewOnlySettings | null
  onPromptDelivered?: () => void
}): ReturnType<typeof launchAgentInNewTab> {
  const profile = getAgentReviewOnlyLaunchProfile({ agent, settings })
  const promptContextManifest = buildAgentReviewOnlyContextManifest({ diffs, review })
  return launchAgentInNewTab({
    agent,
    worktreeId,
    ...(groupId ? { groupId } : {}),
    prompt: buildAgentReviewOnlyPrompt({ diffs, review }),
    promptDelivery: 'submit-after-ready',
    launchSource: 'diff_notes_send',
    agentArgs: profile.agentArgs,
    ...(promptContextManifest.items.length > 0 ? { promptContextManifest } : {}),
    ...(onPromptDelivered ? { onPromptDelivered } : {})
  })
}

function stripCodexWriteArgs(args: string): string {
  return args
    .replace(/(^|\s)--dangerously-bypass-approvals-and-sandbox(?=\s|$)/g, ' ')
    .replace(/(^|\s)--sandbox(?:=|\s+)(?:"[^"]*"|'[^']*'|[^\s]+)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function appendArg(args: string, arg: string): string {
  return [args.trim(), arg].filter(Boolean).join(' ')
}
