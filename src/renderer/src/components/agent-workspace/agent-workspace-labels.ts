import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePhase,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'

export function formatAgentWorkspacePhase(phase: AgentWorkspacePhase | null): string {
  switch (phase) {
    case null:
    case 'idle':
      return translate('auto.components.agentWorkspace.phase.idle', 'idle')
    case 'starting':
      return translate('auto.components.agentWorkspace.phase.starting', 'starting')
    case 'running':
      return translate('auto.components.agentWorkspace.phase.running', 'running')
    case 'waiting-for-user':
      return translate('auto.components.agentWorkspace.phase.waitingForUser', 'waiting for user')
    case 'needs-approval':
      return translate('auto.components.agentWorkspace.phase.needsApproval', 'needs approval')
    case 'completed':
      return translate('auto.components.agentWorkspace.phase.completed', 'completed')
    case 'failed':
      return translate('auto.components.agentWorkspace.phase.failed', 'failed')
    case 'disconnected':
      return translate('auto.components.agentWorkspace.phase.disconnected', 'disconnected')
  }
}

export function formatAgentWorkspaceTimelineKind(
  kind: AgentWorkspaceTimelineEntry['kind']
): string {
  switch (kind) {
    case 'user':
      return translate('auto.components.agentWorkspace.timelineKind.user', 'user')
    case 'agent':
      return translate('auto.components.agentWorkspace.timelineKind.agent', 'agent')
    case 'system':
      return translate('auto.components.agentWorkspace.timelineKind.system', 'system')
    case 'tool':
      return translate('auto.components.agentWorkspace.timelineKind.tool', 'tool')
    case 'approval':
      return translate('auto.components.agentWorkspace.timelineKind.approval', 'approval')
    case 'error':
      return translate('auto.components.agentWorkspace.timelineKind.error', 'error')
  }
}

export function formatAgentWorkspaceTimelineStatus(
  status: AgentWorkspaceTimelineEntry['status']
): string {
  switch (status) {
    case undefined:
      return ''
    case 'pending':
      return translate('auto.components.agentWorkspace.timelineStatus.pending', 'pending')
    case 'running':
      return translate('auto.components.agentWorkspace.timelineStatus.running', 'running')
    case 'done':
      return translate('auto.components.agentWorkspace.timelineStatus.done', 'done')
    case 'failed':
      return translate('auto.components.agentWorkspace.timelineStatus.failed', 'failed')
  }
}

export function formatAgentWorkspaceDiffStatus(
  status: AgentWorkspaceDiffSummary['status']
): string {
  switch (status) {
    case 'added':
      return translate('auto.components.agentWorkspace.diffStatus.added', 'added')
    case 'modified':
      return translate('auto.components.agentWorkspace.diffStatus.modified', 'modified')
    case 'deleted':
      return translate('auto.components.agentWorkspace.diffStatus.deleted', 'deleted')
    case 'renamed':
      return translate('auto.components.agentWorkspace.diffStatus.renamed', 'renamed')
    case 'unknown':
      return translate('auto.components.agentWorkspace.diffStatus.unknown', 'unknown')
  }
}
