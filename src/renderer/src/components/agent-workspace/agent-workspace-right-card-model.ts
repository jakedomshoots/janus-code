import { getRuntimePathBasename } from '../../../../shared/cross-platform-path'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { formatAgentWorkspaceDiffStatus, formatAgentWorkspacePhase } from './agent-workspace-labels'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'

export type AgentWorkspaceRightCardItem = {
  readonly id: string
  readonly label: string
  readonly detail: string
}

export type AgentWorkspaceRightCardModel = {
  readonly outputs: readonly AgentWorkspaceRightCardItem[]
  readonly subagents: readonly AgentWorkspaceRightCardItem[]
  readonly sources: readonly AgentWorkspaceRightCardItem[]
}

export function buildAgentWorkspaceRightCardModel({
  project,
  thread,
  threads,
  plan,
  approval,
  diffs,
  review
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  threads: readonly AgentWorkspaceThread[]
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentWorkspaceRightCardModel {
  return {
    outputs: buildOutputItems({ thread, plan, approval, diffs, review }),
    subagents: buildSubagentItems(threads),
    sources: buildSourceItems(project, thread)
  }
}

function buildOutputItems({
  thread,
  plan,
  approval,
  diffs,
  review
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
}): AgentWorkspaceRightCardItem[] {
  const outputs: AgentWorkspaceRightCardItem[] = []

  if (approval?.status === 'requested') {
    outputs.push({
      id: approval.id,
      label: approval.title ?? 'Approval request',
      detail: approval.toolInput ?? approval.fallbackText
    })
  }

  if (review) {
    outputs.push({
      id: review.id,
      label: review.title,
      detail: `${review.providerLabel} #${review.number} · ${review.state}`
    })
  }

  if (plan) {
    outputs.push({
      id: plan.id,
      label: plan.title ?? 'Plan',
      detail: summarizePlan(plan)
    })
  }

  for (const diff of diffs) {
    outputs.push({
      id: diff.id,
      label: getRuntimePathBasename(diff.filePath) || diff.filePath,
      detail: `${formatAgentWorkspaceDiffStatus(diff.status)} · +${diff.additions} -${diff.deletions}`
    })
  }

  if (outputs.length === 0 && thread) {
    outputs.push({
      id: `${thread.id}:status`,
      label: thread.title,
      detail: formatAgentWorkspacePhase(thread.phase)
    })
  }

  return outputs
}

function summarizePlan(plan: AgentWorkspacePlan): string {
  const completeCount = plan.steps.filter((step) => step.status === 'completed').length
  if (plan.steps.length > 0) {
    return `${completeCount}/${plan.steps.length} steps complete`
  }
  return plan.explanation ?? 'Structured agent plan'
}

function buildSubagentItems(
  threads: readonly AgentWorkspaceThread[]
): AgentWorkspaceRightCardItem[] {
  return threads.map((thread) => ({
    id: thread.id,
    label: thread.title,
    detail: `${formatAgentTypeLabel(thread.agentKind)} · ${formatAgentWorkspacePhase(thread.phase)}`
  }))
}

function buildSourceItems(
  project: AgentWorkspaceProject | null,
  thread: AgentWorkspaceThread | null
): AgentWorkspaceRightCardItem[] {
  const sources: AgentWorkspaceRightCardItem[] = []

  if (project) {
    sources.push({
      id: `${project.id}:project`,
      label: project.label,
      detail: project.path
    })
    sources.push({
      id: `${project.id}:host`,
      label: translate('auto.components.agentWorkspace.rightPanel.environment', 'Environment'),
      detail: formatHostKind(project.hostKind)
    })
  }

  const branchName = thread?.branchName ?? project?.branchName ?? null
  if (branchName) {
    sources.push({
      id: `${project?.id ?? thread?.id ?? 'source'}:branch`,
      label: translate('auto.components.agentWorkspace.rightPanel.branch', 'Branch'),
      detail: branchName
    })
  }

  if (thread?.cwd && thread.cwd !== project?.path) {
    sources.push({
      id: `${thread.id}:cwd`,
      label: translate(
        'auto.components.agentWorkspace.rightPanel.workingDirectory',
        'Working directory'
      ),
      detail: thread.cwd
    })
  }

  return sources
}

function formatHostKind(hostKind: AgentWorkspaceProject['hostKind']): string {
  switch (hostKind) {
    case 'local':
      return 'Local'
    case 'ssh':
      return 'SSH'
    case 'runtime':
      return 'Runtime'
  }
}
