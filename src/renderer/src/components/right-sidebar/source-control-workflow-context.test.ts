import { describe, expect, it } from 'vitest'
import {
  buildSourceControlBranchActionArgs,
  buildSourceControlRuntimeGitContext
} from './source-control-workflow-context'
import type { GitPushTarget, GlobalSettings } from '../../../../shared/types'

const sshSettings = {
  activeRuntimeEnvironmentId: null,
  guiAgentWorkspaceEnabled: false
} as Pick<GlobalSettings, 'activeRuntimeEnvironmentId'>

const pushTarget: GitPushTarget = {
  remoteName: 'fork',
  branchName: 'feature/ssh'
}

describe('source control workflow context builders', () => {
  it('builds runtime git mutation context for the selected SSH worktree', () => {
    expect(
      buildSourceControlRuntimeGitContext({
        settings: sshSettings,
        worktreeId: 'wt-ssh',
        worktreePath: '/home/jake/repo',
        connectionId: 'ssh-1'
      })
    ).toEqual({
      settings: sshSettings,
      worktreeId: 'wt-ssh',
      worktreePath: '/home/jake/repo',
      connectionId: 'ssh-1'
    })
  })

  it('builds branch action args with selected worktree, connection, push target, and owner settings', () => {
    expect(
      buildSourceControlBranchActionArgs({
        settings: sshSettings,
        worktreeId: 'wt-ssh',
        worktreePath: '/home/jake/repo',
        connectionId: 'ssh-1',
        pushTarget
      })
    ).toEqual({
      worktreeId: 'wt-ssh',
      worktreePath: '/home/jake/repo',
      connectionId: 'ssh-1',
      pushTarget,
      options: { runtimeTargetSettings: sshSettings }
    })
  })
})
