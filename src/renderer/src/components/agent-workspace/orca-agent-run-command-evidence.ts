import type { AppState } from '@/store'
import { classifyAgentCommandRisk } from '../../../../shared/agent-command-risk'
import { matchProtectedResourcePolicies } from '../../../../shared/protected-resource-policy'
import type { AgentWorkspaceRunEvent, AgentWorkspaceThread } from './agent-workspace-types'

export function getAgentRunCommandEvidenceProps({
  state,
  thread,
  command
}: {
  state: AppState
  thread: AgentWorkspaceThread
  command: string | null | undefined
}): Pick<AgentWorkspaceRunEvent, 'risk' | 'protectedResourcePolicyMatches'> | {} {
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
