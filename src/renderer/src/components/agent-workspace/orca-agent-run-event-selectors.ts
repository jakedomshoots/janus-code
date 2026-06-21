import type { AppState } from '@/store'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { translate } from '@/i18n/i18n'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import type { PendingAgentLaunch } from '@/store/slices/terminals'
import type { AgentWorkspaceRunEvent, AgentWorkspaceThread } from './agent-workspace-types'
import { getAgentRunCommandEvidenceProps } from './orca-agent-run-command-evidence'
import {
  getAgentRunApprovalStatus,
  getAgentRunApprovalTitle,
  getAgentRunStateStatus,
  getAgentRunStateTitle,
  getAgentRunToolStatus,
  getAgentRunVerificationDetail,
  getAgentRunVerificationStatus,
  getAgentRunVerificationTitle
} from './orca-agent-run-event-labels'

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function appendAgentRunEvents(
  state: AppState,
  events: AgentWorkspaceRunEvent[],
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): void {
  for (const [index, history] of entry.stateHistory.entries()) {
    events.push({
      id: `${thread.id}:run:state-history:${history.startedAt}:${index}`,
      threadId: thread.id,
      kind: 'state',
      title: getAgentRunStateTitle(history.state),
      detail: history.prompt || thread.title,
      createdAt: getIsoTimestamp(history.startedAt),
      status: 'done',
      telemetry: 'partial'
    })
  }

  events.push({
    id: `${thread.id}:run:state:${entry.stateStartedAt}`,
    threadId: thread.id,
    kind: 'state',
    title: getAgentRunStateTitle(entry.state),
    detail: entry.prompt || thread.title,
    createdAt: getIsoTimestamp(entry.stateStartedAt),
    status: getAgentRunStateStatus(entry.state),
    telemetry: 'partial'
  })

  if (entry.toolEvent) {
    events.push({
      id: `${thread.id}:run:tool:${entry.toolEvent.id}`,
      threadId: thread.id,
      kind: 'tool',
      title: entry.toolEvent.name,
      detail: entry.toolEvent.input ?? entry.toolEvent.fallbackText,
      createdAt: getIsoTimestamp(entry.updatedAt),
      status: getAgentRunToolStatus(entry.toolEvent.status),
      telemetry: 'structured',
      ...getAgentRunCommandEvidenceProps({ state, thread, command: entry.toolEvent.input })
    })
  } else if (entry.toolName) {
    events.push({
      id: `${thread.id}:run:tool-snapshot:${entry.stateStartedAt}:${entry.toolName}`,
      threadId: thread.id,
      kind: 'tool',
      title: entry.toolName,
      detail: entry.toolInput ?? entry.toolName,
      createdAt: getIsoTimestamp(entry.updatedAt),
      status: entry.state === 'working' ? 'running' : 'unknown',
      telemetry: 'partial',
      ...getAgentRunCommandEvidenceProps({ state, thread, command: entry.toolInput })
    })
  }

  if (entry.approval) {
    const approvalCommand =
      entry.approval.toolInput ??
      entry.approval.description ??
      entry.approval.title ??
      entry.approval.fallbackText
    events.push({
      id: `${thread.id}:run:approval:${entry.approval.id}`,
      threadId: thread.id,
      kind: 'approval',
      title: getAgentRunApprovalTitle(entry.approval.status),
      detail: approvalCommand,
      createdAt: getIsoTimestamp(entry.updatedAt),
      status: getAgentRunApprovalStatus(entry.approval.status),
      telemetry: 'structured',
      ...getAgentRunCommandEvidenceProps({ state, thread, command: approvalCommand })
    })
  }

  if (entry.failure) {
    events.push({
      id: `${thread.id}:run:error:${entry.failure.id}`,
      threadId: thread.id,
      kind: 'error',
      title: translate('auto.components.agentWorkspace.rightPanel.runEventFailure', 'Failure'),
      detail: entry.failure.fallbackText,
      createdAt: getIsoTimestamp(entry.failure.occurredAt),
      status: 'failed',
      telemetry: 'structured'
    })
  }

  if (entry.verification) {
    events.push({
      id: `${thread.id}:run:verification:${entry.verification.command}`,
      threadId: thread.id,
      kind: 'verification',
      title: getAgentRunVerificationTitle(entry.verification.status),
      detail: getAgentRunVerificationDetail(entry.verification),
      createdAt: getIsoTimestamp(entry.updatedAt),
      status: getAgentRunVerificationStatus(entry.verification.status),
      telemetry: 'partial'
    })
  }

  events.push({
    id: `${thread.id}:run:telemetry:${entry.updatedAt}`,
    threadId: thread.id,
    kind: 'telemetry',
    title: translate(
      'auto.components.agentWorkspace.rightPanel.partialTelemetry',
      'Partial telemetry'
    ),
    detail: translate(
      'auto.components.agentWorkspace.rightPanel.partialTelemetryDetail',
      'Janus is showing the run evidence available from this agent integration.'
    ),
    createdAt: getIsoTimestamp(entry.updatedAt),
    status: 'unknown',
    telemetry: 'partial'
  })
}

function appendPendingLaunchRunEvents(
  events: AgentWorkspaceRunEvent[],
  thread: AgentWorkspaceThread,
  launch: PendingAgentLaunch
): void {
  events.push({
    id: `${thread.id}:run:pending-launch:${launch.startedAt}`,
    threadId: thread.id,
    kind: 'state',
    title: translate('auto.components.agentWorkspace.rightPanel.runEventStarting', 'Starting'),
    detail: formatAgentTypeLabel(launch.agent),
    createdAt: getIsoTimestamp(launch.startedAt),
    status: 'running',
    telemetry: 'partial'
  })
  if (launch.verification) {
    events.push({
      id: `${thread.id}:run:verification:${launch.verification.command}`,
      threadId: thread.id,
      kind: 'verification',
      title: getAgentRunVerificationTitle(launch.verification.status),
      detail: getAgentRunVerificationDetail(launch.verification),
      createdAt: getIsoTimestamp(launch.startedAt),
      status: getAgentRunVerificationStatus(launch.verification.status),
      telemetry: 'partial'
    })
  }
  events.push({
    id: `${thread.id}:run:telemetry:${launch.startedAt}`,
    threadId: thread.id,
    kind: 'telemetry',
    title: translate(
      'auto.components.agentWorkspace.rightPanel.partialTelemetry',
      'Partial telemetry'
    ),
    detail: translate(
      'auto.components.agentWorkspace.rightPanel.waitingForStructuredRunState',
      'Janus is waiting for the agent to report structured run state.'
    ),
    createdAt: getIsoTimestamp(launch.startedAt),
    status: 'unknown',
    telemetry: 'partial'
  })
}

export function selectAgentWorkspaceRunEvents(
  state: AppState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspaceRunEvent[] {
  const events: AgentWorkspaceRunEvent[] = []
  const threadsById = new Map(threads.map((thread) => [thread.id, thread]))

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendAgentRunEvents(state, events, thread, entry)
  }

  for (const [paneKey, launch] of Object.entries(state.pendingAgentLaunchesByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendPendingLaunchRunEvents(events, thread, launch)
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey || paneKey in state.pendingAgentLaunchesByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    appendAgentRunEvents(state, events, thread, retained.entry)
  }

  return events
}
