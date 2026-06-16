import type { AppState } from '@/store'
import {
  getRepoExecutionHostId,
  getSettingsFocusedExecutionHostId,
  parseExecutionHostId,
  toSshExecutionHostId
} from '../../../../shared/execution-host'
import type { ExecutionHostId, ExecutionHostKind } from '../../../../shared/execution-host'
import type { Repo, Worktree } from '../../../../shared/types'
import type { AgentWorkspaceProject } from './agent-workspace-types'

function getRepoForWorktree(state: AppState, worktree: Worktree): Repo | undefined {
  return state.repos.find((repo) => repo.id === worktree.repoId)
}

export function getWorktreeExecutionHostId(state: AppState, worktree: Worktree): ExecutionHostId {
  const worktreeHostId = parseExecutionHostId(worktree.hostId)?.id
  if (worktreeHostId) {
    return worktreeHostId
  }
  const repo = getRepoForWorktree(state, worktree)
  return repo?.connectionId || repo?.executionHostId
    ? getRepoExecutionHostId(repo)
    : getSettingsFocusedExecutionHostId(state.settings)
}

export function getWorktreeHostKind(state: AppState, worktree: Worktree): ExecutionHostKind {
  return parseExecutionHostId(getWorktreeExecutionHostId(state, worktree))?.kind ?? 'local'
}

export function getFolderExecutionHostId(
  state: AppState,
  folderWorkspace: AppState['folderWorkspaces'][number]
): ExecutionHostId {
  const projectGroup = state.projectGroups.find(
    (group) => group.id === folderWorkspace.projectGroupId
  )
  const connectionId = folderWorkspace.connectionId ?? projectGroup?.connectionId
  if (connectionId) {
    return toSshExecutionHostId(connectionId)
  }
  return getSettingsFocusedExecutionHostId(state.settings)
}

export function getFolderHostKind(
  state: AppState,
  folderWorkspace: AppState['folderWorkspaces'][number]
): ExecutionHostKind {
  return parseExecutionHostId(getFolderExecutionHostId(state, folderWorkspace))?.kind ?? 'local'
}

export function getAgentDetectionTargetFromHostId(
  hostId: ExecutionHostId
): AgentWorkspaceProject['agentDetectionTarget'] {
  const parsed = parseExecutionHostId(hostId)
  if (!parsed) {
    return { kind: 'local' }
  }
  switch (parsed.kind) {
    case 'ssh':
      return { kind: 'ssh', connectionId: parsed.targetId }
    case 'runtime':
      return { kind: 'runtime', environmentId: parsed.environmentId }
    case 'local':
      return { kind: 'local' }
  }
}
