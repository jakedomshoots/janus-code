import type { RuntimeGitContext } from '@/runtime/runtime-git-client'
import type { GitPushTarget, GlobalSettings } from '../../../../shared/types'

type RuntimeTargetSettings = Pick<GlobalSettings, 'activeRuntimeEnvironmentId'> | null | undefined

export type SourceControlBranchActionArgs = {
  worktreeId: string
  worktreePath: string
  connectionId?: string
  pushTarget?: GitPushTarget
  options: { runtimeTargetSettings: RuntimeTargetSettings }
}

export function buildSourceControlRuntimeGitContext(input: {
  settings: RuntimeGitContext['settings']
  worktreeId: RuntimeGitContext['worktreeId']
  worktreePath: RuntimeGitContext['worktreePath']
  connectionId?: RuntimeGitContext['connectionId']
}): RuntimeGitContext {
  return {
    settings: input.settings,
    worktreeId: input.worktreeId,
    worktreePath: input.worktreePath,
    connectionId: input.connectionId
  }
}

export function buildSourceControlBranchActionArgs(input: {
  settings: RuntimeTargetSettings
  worktreeId: string
  worktreePath: string
  connectionId?: string
  pushTarget?: GitPushTarget
}): SourceControlBranchActionArgs {
  return {
    worktreeId: input.worktreeId,
    worktreePath: input.worktreePath,
    connectionId: input.connectionId,
    pushTarget: input.pushTarget,
    options: { runtimeTargetSettings: input.settings }
  }
}
