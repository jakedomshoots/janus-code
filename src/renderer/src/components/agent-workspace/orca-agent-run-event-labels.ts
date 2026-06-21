import type {
  AgentStatusApprovalStatus,
  AgentStatusState,
  AgentStatusVerification,
  AgentStatusVerificationExecutionContext,
  AgentStatusVerificationStatus,
  AgentStatusToolEventStatus
} from '../../../../shared/agent-status-types'
import type { AgentWorkspaceRunEvent } from './agent-workspace-types'

export function getAgentRunStateTitle(state: AgentStatusState): string {
  switch (state) {
    case 'working':
      return 'Working'
    case 'waiting':
      return 'Waiting for user'
    case 'blocked':
      return 'Blocked'
    case 'done':
      return 'Done'
  }
}

export function getAgentRunStateStatus(state: AgentStatusState): AgentWorkspaceRunEvent['status'] {
  switch (state) {
    case 'working':
      return 'running'
    case 'waiting':
    case 'blocked':
      return 'pending'
    case 'done':
      return 'done'
  }
}

export function getAgentRunToolStatus(
  status: AgentStatusToolEventStatus
): AgentWorkspaceRunEvent['status'] {
  switch (status) {
    case 'running':
      return 'running'
    case 'completed':
      return 'done'
    case 'failed':
      return 'failed'
  }
}

export function getAgentRunApprovalStatus(
  status: AgentStatusApprovalStatus
): AgentWorkspaceRunEvent['status'] {
  switch (status) {
    case 'requested':
      return 'pending'
    case 'approved':
      return 'done'
    case 'denied':
      return 'failed'
    case 'expired':
      return 'unknown'
  }
}

export function getAgentRunApprovalTitle(status: AgentStatusApprovalStatus): string {
  switch (status) {
    case 'requested':
      return 'Approval requested'
    case 'approved':
      return 'Approval approved'
    case 'denied':
      return 'Approval denied'
    case 'expired':
      return 'Approval expired'
  }
}

export function getAgentRunVerificationStatus(
  status: AgentStatusVerificationStatus
): AgentWorkspaceRunEvent['status'] {
  switch (status) {
    case 'not-run':
      return 'pending'
    case 'running':
      return 'running'
    case 'passed':
      return 'done'
    case 'failed':
      return 'failed'
    case 'unknown':
      return 'unknown'
  }
}

export function getAgentRunVerificationTitle(status: AgentStatusVerificationStatus): string {
  switch (status) {
    case 'not-run':
      return 'Verification not run'
    case 'running':
      return 'Verification running'
    case 'passed':
      return 'Verification passed'
    case 'failed':
      return 'Verification failed'
    case 'unknown':
      return 'Verification unknown'
  }
}

export function getAgentRunVerificationDetail(verification: AgentStatusVerification): string {
  if (!verification.executionContext) {
    return verification.command
  }
  return [
    verification.command,
    getVerificationExecutionLabel(verification.executionContext),
    verification.executionContext.cwd
  ].join(' - ')
}

function getVerificationExecutionLabel(context: AgentStatusVerificationExecutionContext): string {
  const platformSuffix = [getVerificationContextId(context), context.platform]
    .filter((value) => Boolean(value))
    .join(', ')
  const hostLabel =
    context.hostKind === 'ssh' ? 'SSH' : context.hostKind === 'runtime' ? 'Runtime' : 'Local'
  return platformSuffix ? `${hostLabel} (${platformSuffix})` : hostLabel
}

function getVerificationContextId(
  context: AgentStatusVerificationExecutionContext
): string | undefined {
  if (context.hostKind === 'ssh') {
    return context.connectionId
  }
  if (context.hostKind === 'runtime') {
    return context.runtimeEnvironmentId
  }
  return undefined
}
