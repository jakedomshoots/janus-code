import type { AppState } from '@/store'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import type {
  AgentWorkspaceApproval,
  AgentWorkspaceApprovalStatus,
  AgentWorkspaceThread
} from './agent-workspace-types'

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function getSortTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY
}

function toWorkspaceApproval(
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceApproval | null {
  if (!entry.approval) {
    return null
  }
  return {
    id: `${thread.id}:approval:${entry.approval.id}`,
    threadId: thread.id,
    providerKind: entry.agentType ?? thread.agentKind,
    worktreeId: thread.worktreeId,
    status: entry.approval.status as AgentWorkspaceApprovalStatus,
    title: entry.approval.title ?? null,
    description: entry.approval.description ?? null,
    toolName: entry.approval.toolName ?? null,
    toolInput: entry.approval.toolInput ?? null,
    fallbackText: entry.approval.fallbackText,
    updatedAt: getIsoTimestamp(entry.updatedAt)
  }
}

export function selectAgentWorkspaceApprovals(
  state: AppState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspaceApproval[] {
  const approvals: AgentWorkspaceApproval[] = []
  const threadsById = new Map(threads.map((thread) => [thread.id, thread]))

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    const approval = toWorkspaceApproval(thread, entry)
    if (approval) {
      approvals.push(approval)
    }
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    const thread = threadsById.get(paneKey)
    if (!thread) {
      continue
    }
    const approval = toWorkspaceApproval(thread, retained.entry)
    if (approval) {
      approvals.push(approval)
    }
  }

  return approvals.sort((a, b) => {
    const updatedDiff = getSortTimestamp(b.updatedAt) - getSortTimestamp(a.updatedAt)
    return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
  })
}
