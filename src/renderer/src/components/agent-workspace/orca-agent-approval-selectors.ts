import type { AppState } from '@/store'
import { classifyAgentCommandRisk } from '../../../../shared/agent-command-risk'
import { matchProtectedResourcePolicies } from '../../../../shared/protected-resource-policy'
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
  state: AppState,
  thread: AgentWorkspaceThread,
  entry: AgentStatusEntry
): AgentWorkspaceApproval | null {
  if (!entry.approval) {
    return null
  }
  const command = entry.approval.toolInput ?? entry.approval.fallbackText
  const risk = classifyAgentCommandRisk(command)
  const protectedResourcePolicyMatches = matchProtectedResourcePolicies(
    state.settings?.protectedResourcePolicies,
    {
      repoId: getThreadRepoId(state, thread),
      command,
      branchName: thread.branchName,
      targetPaths: getCommandPathCandidates(command),
      platform: getClientPlatform(),
      shellKind: 'posix'
    }
  )
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
    updatedAt: getIsoTimestamp(entry.updatedAt),
    ...(risk ? { risk } : {}),
    ...(protectedResourcePolicyMatches.length > 0 ? { protectedResourcePolicyMatches } : {})
  }
}

function getThreadRepoId(state: AppState, thread: AgentWorkspaceThread): string | null {
  for (const [repoId, worktrees] of Object.entries(state.worktreesByRepo ?? {})) {
    if (worktrees.some((worktree) => worktree.id === thread.worktreeId)) {
      return repoId
    }
  }
  return null
}

function getCommandPathCandidates(command: string | null | undefined): readonly string[] {
  if (!command) {
    return []
  }
  return command
    .split(/\s+/)
    .map((token) => token.replace(/^['"]|['"]$/g, ''))
    .filter((token) => token.includes('/') || token.includes('\\') || token.startsWith('.'))
}

function getClientPlatform(): NodeJS.Platform | undefined {
  return typeof process !== 'undefined' ? process.platform : undefined
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
    const approval = toWorkspaceApproval(state, thread, entry)
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
    const approval = toWorkspaceApproval(state, thread, retained.entry)
    if (approval) {
      approvals.push(approval)
    }
  }

  return approvals.sort((a, b) => {
    const updatedDiff = getSortTimestamp(b.updatedAt) - getSortTimestamp(a.updatedAt)
    return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
  })
}
