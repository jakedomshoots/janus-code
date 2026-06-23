import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { resolveAgentWorkspaceLifecycle } from './agent-workspace-lifecycle'

export type AgentWorkspaceEvidenceItemTone = 'neutral' | 'good' | 'warning' | 'danger'

export type AgentWorkspaceEvidenceItem = {
  readonly id: string
  readonly label: string
  readonly detail: string
  readonly tone: AgentWorkspaceEvidenceItemTone
  readonly timestamp: string | null
}

export type AgentWorkspacePreviewStatus = 'available' | 'unavailable' | 'needs-attention'

export type AgentWorkspacePreviewHealth = {
  readonly status: AgentWorkspacePreviewStatus
  readonly label: string
  readonly detail: string
  readonly recoverySteps: readonly string[]
}

export type AgentWorkspaceEvidence = {
  readonly items: readonly AgentWorkspaceEvidenceItem[]
  readonly preview: AgentWorkspacePreviewHealth
}

export function buildAgentWorkspaceEvidence({
  thread,
  plan,
  approval,
  diffs,
  review,
  timeline,
  terminalAvailable,
  browserAvailable
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
  approval: AgentWorkspaceApproval | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
  browserAvailable: boolean
}): AgentWorkspaceEvidence {
  const items: AgentWorkspaceEvidenceItem[] = []
  const lifecycle = resolveAgentWorkspaceLifecycle({ thread, diffs, review })
  items.push({
    id: 'lifecycle',
    label: translate('auto.components.agentWorkspace.evidence.lifecycle', 'Lifecycle'),
    detail: lifecycle.currentLabel,
    tone: lifecycle.current === 'changes-requested' ? 'warning' : 'neutral',
    timestamp: thread?.updatedAt ?? null
  })

  const latestUserMessage = findLatestTimelineEntry(timeline, 'user')
  if (latestUserMessage) {
    items.push({
      id: 'last-user-message',
      label:
        latestUserMessage.status === 'pending'
          ? translate('auto.components.agentWorkspace.evidence.promptQueued', 'Prompt queued')
          : latestUserMessage.status === 'failed'
            ? translate('auto.components.agentWorkspace.evidence.promptFailed', 'Prompt failed')
            : translate(
                'auto.components.agentWorkspace.evidence.promptDelivered',
                'Prompt delivered'
              ),
      detail: truncateDetail(latestUserMessage.text),
      tone: latestUserMessage.status === 'failed' ? 'danger' : 'good',
      timestamp: latestUserMessage.createdAt
    })
  }

  const activeTool = [...timeline]
    .reverse()
    .find((entry) => entry.kind === 'tool' && entry.status === 'running')
  if (activeTool) {
    items.push({
      id: 'active-tool',
      label: translate('auto.components.agentWorkspace.evidence.toolRunning', 'Tool running'),
      detail: truncateDetail(activeTool.text),
      tone: 'neutral',
      timestamp: activeTool.createdAt
    })
  }

  if (approval?.status === 'requested') {
    items.push({
      id: 'approval',
      label: translate(
        'auto.components.agentWorkspace.evidence.approvalRequested',
        'Approval requested'
      ),
      detail: approval.title ?? approval.toolName ?? approval.fallbackText,
      tone: 'warning',
      timestamp: approval.updatedAt
    })
  }

  if (plan?.steps.length) {
    const completeSteps = plan.steps.filter((step) => step.status === 'completed').length
    items.push({
      id: 'plan-progress',
      label: translate('auto.components.agentWorkspace.evidence.planProgress', 'Plan progress'),
      detail: translate(
        'auto.components.agentWorkspace.evidence.planProgressDetail',
        '{{complete}}/{{total}} steps complete',
        { complete: completeSteps, total: plan.steps.length }
      ),
      tone: completeSteps === plan.steps.length ? 'good' : 'neutral',
      timestamp: plan.updatedAt
    })
  }

  if (diffs.length > 0) {
    const totals = summarizeDiffs(diffs)
    items.push({
      id: 'changed-files',
      label: translate('auto.components.agentWorkspace.evidence.changedFiles', 'Changed files'),
      detail: translate(
        'auto.components.agentWorkspace.evidence.changedFilesDetail',
        '{{count}} file · +{{additions}} -{{deletions}}',
        { count: diffs.length, additions: totals.additions, deletions: totals.deletions }
      ),
      tone: 'neutral',
      timestamp: thread?.updatedAt ?? null
    })
  }

  if (review) {
    items.push({
      id: 'hosted-review',
      label: translate('auto.components.agentWorkspace.evidence.hostedReview', 'Hosted review'),
      detail: `${review.providerLabel} #${review.number} · ${review.state}`,
      tone:
        review.status === 'success' ? 'good' : review.status === 'failure' ? 'danger' : 'neutral',
      timestamp: review.updatedAt
    })
  }

  const latestError = findLatestTimelineEntry(timeline, 'error')
  if (latestError) {
    items.push({
      id: 'error',
      label: translate('auto.components.agentWorkspace.evidence.errorCaptured', 'Error captured'),
      detail: truncateDetail(latestError.text),
      tone: 'danger',
      timestamp: latestError.createdAt
    })
  }

  if (terminalAvailable) {
    items.push({
      id: 'terminal',
      label: translate(
        'auto.components.agentWorkspace.evidence.terminalAttached',
        'Terminal attached'
      ),
      detail: translate(
        'auto.components.agentWorkspace.evidence.rawOutputAvailable',
        'Raw output and recovery controls are available.'
      ),
      tone: 'neutral',
      timestamp: thread?.updatedAt ?? null
    })
  }

  return {
    items,
    preview: buildPreviewHealth({ thread, terminalAvailable, browserAvailable })
  }
}

function findLatestTimelineEntry(
  timeline: readonly AgentWorkspaceTimelineEntry[],
  kind: AgentWorkspaceTimelineEntry['kind']
): AgentWorkspaceTimelineEntry | null {
  return [...timeline].reverse().find((entry) => entry.kind === kind) ?? null
}

function summarizeDiffs(diffs: readonly AgentWorkspaceDiffSummary[]): {
  readonly additions: number
  readonly deletions: number
} {
  return diffs.reduce(
    (total, diff) => ({
      additions: total.additions + diff.additions,
      deletions: total.deletions + diff.deletions
    }),
    { additions: 0, deletions: 0 }
  )
}

function buildPreviewHealth({
  thread,
  terminalAvailable,
  browserAvailable
}: {
  thread: AgentWorkspaceThread | null
  terminalAvailable: boolean
  browserAvailable: boolean
}): AgentWorkspacePreviewHealth {
  if (thread?.phase === 'failed') {
    return {
      status: 'needs-attention',
      label: translate(
        'auto.components.agentWorkspace.evidence.previewNeedsAttention',
        'Needs attention'
      ),
      detail: translate(
        'auto.components.agentWorkspace.evidence.previewFailureDetail',
        'The selected agent failed before Janus could trust the preview state.'
      ),
      recoverySteps: getPreviewRecoverySteps({ terminalAvailable, browserAvailable })
    }
  }
  if (browserAvailable) {
    return {
      status: 'available',
      label: translate(
        'auto.components.agentWorkspace.evidence.previewAvailable',
        'Preview available'
      ),
      detail: translate(
        'auto.components.agentWorkspace.evidence.previewAvailableDetail',
        'Use the Browser workbench to inspect the running app or captured pages.'
      ),
      recoverySteps: getPreviewRecoverySteps({ terminalAvailable, browserAvailable })
    }
  }
  return {
    status: 'unavailable',
    label: translate(
      'auto.components.agentWorkspace.evidence.previewUnavailable',
      'Preview not open'
    ),
    detail: translate(
      'auto.components.agentWorkspace.evidence.previewUnavailableDetail',
      'No Browser workbench is available for this workspace yet.'
    ),
    recoverySteps: getPreviewRecoverySteps({ terminalAvailable, browserAvailable })
  }
}

function getPreviewRecoverySteps({
  terminalAvailable,
  browserAvailable
}: {
  terminalAvailable: boolean
  browserAvailable: boolean
}): readonly string[] {
  const steps: string[] = []
  if (terminalAvailable) {
    steps.push(
      translate(
        'auto.components.agentWorkspace.evidence.openTerminalInspectServer',
        'Open the terminal drawer to start or inspect the app server.'
      )
    )
  }
  if (browserAvailable) {
    steps.push(
      translate(
        'auto.components.agentWorkspace.evidence.openBrowserInspectPreview',
        'Open preview in the Browser workbench after the server is reachable.'
      )
    )
  }
  steps.push(
    translate(
      'auto.components.agentWorkspace.evidence.copyContextForRecovery',
      'Copy the recovery context when handing the issue back to the agent.'
    )
  )
  return steps
}

function truncateDetail(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 96 ? `${normalized.slice(0, 93)}...` : normalized
}
