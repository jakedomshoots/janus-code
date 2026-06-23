import type { AppState } from '@/store'
import { branchName } from '@/lib/git-utils'
import { getRuntimePathBasename } from '../../../../shared/cross-platform-path'
import { folderWorkspaceKey } from '../../../../shared/workspace-scope'
import type { Worktree } from '../../../../shared/types'
import type { AgentWorkspaceProject } from './agent-workspace-types'
import {
  getAgentDetectionTargetFromHostId,
  getFolderExecutionHostId,
  getFolderHostKind,
  getWorktreeExecutionHostId,
  getWorktreeHostKind
} from './orca-agent-workspace-host-selectors'

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function pathFallback(path: string): string {
  return getRuntimePathBasename(path) || path
}

function getWorktreeLabel(worktree: Worktree): string {
  return (
    nonEmpty(worktree.displayName) ??
    nonEmpty(branchName(worktree.branch)) ??
    pathFallback(worktree.path)
  )
}

export function selectAgentWorkspaceProjects(state: AppState): readonly AgentWorkspaceProject[] {
  const projects: AgentWorkspaceProject[] = []
  for (const worktrees of Object.values(state.worktreesByRepo)) {
    for (const worktree of worktrees) {
      if (worktree.isArchived) {
        continue
      }
      projects.push({
        id: worktree.id,
        label: getWorktreeLabel(worktree),
        path: worktree.path,
        hostKind: getWorktreeHostKind(state, worktree),
        branchName: branchName(worktree.branch),
        repoId: worktree.repoId,
        canCreateWorktree: true,
        canDeleteWorktree: !worktree.isMainWorktree,
        pushTarget: worktree.pushTarget,
        agentDetectionTarget: getAgentDetectionTargetFromHostId(
          getWorktreeExecutionHostId(state, worktree)
        )
      })
    }
  }
  for (const folderWorkspace of state.folderWorkspaces) {
    if (folderWorkspace.isArchived) {
      continue
    }
    projects.push({
      id: folderWorkspaceKey(folderWorkspace.id),
      label: nonEmpty(folderWorkspace.name) ?? pathFallback(folderWorkspace.folderPath),
      path: folderWorkspace.folderPath,
      hostKind: getFolderHostKind(state, folderWorkspace),
      branchName: null,
      repoId: null,
      canCreateWorktree: false,
      canDeleteWorktree: false,
      agentDetectionTarget: getAgentDetectionTargetFromHostId(
        getFolderExecutionHostId(state, folderWorkspace)
      )
    })
  }
  return projects
}
