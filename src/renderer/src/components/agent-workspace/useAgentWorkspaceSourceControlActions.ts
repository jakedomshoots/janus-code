import { useState } from 'react'
import {
  notifyEditorExternalFileChange,
  requestEditorSaveQuiesce
} from '@/components/editor/editor-autosave'
import { translate } from '@/i18n/i18n'
import { getRepoOwnerRoutedSettings } from '@/lib/repo-runtime-owner'
import {
  commitRuntimeGit,
  discardRuntimeGitPath,
  stageRuntimeGitPath,
  type RuntimeGitContext,
  unstageRuntimeGitPath
} from '@/runtime/runtime-git-client'
import { useAppStore } from '@/store'
import type { GlobalSettings, Repo } from '../../../../shared/types'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceProject } from './agent-workspace-types'
import { refreshGitStatusForWorktree } from '../right-sidebar/git-status-refresh'

type SourceControlContext = Omit<RuntimeGitContext, 'worktreeId'> & {
  readonly worktreeId: string
  readonly project: AgentWorkspaceProject
}

export type AgentWorkspaceSourceControlActions = {
  readonly sourceControlBusy: boolean
  readonly sourceControlError: string | null
  readonly onStageDiff?: (diff: AgentWorkspaceDiffSummary) => Promise<void>
  readonly onUnstageDiff?: (diff: AgentWorkspaceDiffSummary) => Promise<void>
  readonly onDiscardDiff?: (diff: AgentWorkspaceDiffSummary) => Promise<void>
  readonly onCommitStaged?: (message: string) => Promise<boolean>
}

function getProjectRepo(
  repos: readonly Pick<Repo, 'id' | 'connectionId' | 'executionHostId'>[],
  project: AgentWorkspaceProject | null
): Pick<Repo, 'id' | 'connectionId' | 'executionHostId'> | null {
  return project?.repoId ? (repos.find((repo) => repo.id === project.repoId) ?? null) : null
}

function getProjectRuntimeSettings(
  settings: GlobalSettings | null,
  repo: Pick<Repo, 'id' | 'connectionId' | 'executionHostId'> | null,
  project: AgentWorkspaceProject | null
): GlobalSettings | null {
  const routedSettings = getRepoOwnerRoutedSettings(settings, repo)
  if (!routedSettings) {
    return routedSettings
  }
  switch (project?.agentDetectionTarget?.kind) {
    case 'runtime':
      return {
        ...routedSettings,
        activeRuntimeEnvironmentId: project.agentDetectionTarget.environmentId
      }
    case 'local':
    case 'ssh':
      return { ...routedSettings, activeRuntimeEnvironmentId: null }
    case undefined:
      return project?.hostKind === 'local' || project?.hostKind === 'ssh'
        ? { ...routedSettings, activeRuntimeEnvironmentId: null }
        : routedSettings
  }
}

function getProjectConnectionId(
  repo: Pick<Repo, 'connectionId'> | null,
  project: AgentWorkspaceProject | null
): string | undefined {
  if (project?.agentDetectionTarget?.kind === 'ssh') {
    return project.agentDetectionTarget.connectionId
  }
  return repo?.connectionId?.trim() || undefined
}

function getProjectRuntimeEnvironmentId(project: AgentWorkspaceProject | null): string | null {
  return project?.agentDetectionTarget?.kind === 'runtime'
    ? project.agentDetectionTarget.environmentId
    : null
}

function getSourceControlErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function withoutProject(context: SourceControlContext): RuntimeGitContext {
  const { project: _project, ...runtimeContext } = context
  return runtimeContext
}

export function useAgentWorkspaceSourceControlActions(
  selectedProject: AgentWorkspaceProject | null
): AgentWorkspaceSourceControlActions {
  const repos = useAppStore((state) => state.repos)
  const settings = useAppStore((state) => state.settings)
  const setGitStatus = useAppStore((state) => state.setGitStatus)
  const updateWorktreeGitIdentity = useAppStore((state) => state.updateWorktreeGitIdentity)
  const setUpstreamStatus = useAppStore((state) => state.setUpstreamStatus)
  const fetchUpstreamStatus = useAppStore((state) => state.fetchUpstreamStatus)
  const [sourceControlBusy, setSourceControlBusy] = useState(false)
  const [sourceControlError, setSourceControlError] = useState<string | null>(null)

  function getSelectedProjectGitContext(): SourceControlContext | null {
    if (!selectedProject?.repoId) {
      return null
    }
    const repo = getProjectRepo(repos, selectedProject)
    return {
      settings: getProjectRuntimeSettings(settings, repo, selectedProject),
      worktreeId: selectedProject.id,
      worktreePath: selectedProject.path,
      connectionId: getProjectConnectionId(repo, selectedProject),
      project: selectedProject
    }
  }

  async function refreshSelectedProjectGitStatus(): Promise<void> {
    const context = getSelectedProjectGitContext()
    if (!context) {
      return
    }
    await refreshGitStatusForWorktree({
      settings: context.settings,
      worktreeId: context.worktreeId,
      worktreePath: context.worktreePath,
      connectionId: context.connectionId,
      pushTarget: context.project.pushTarget,
      deps: {
        setGitStatus,
        updateWorktreeGitIdentity,
        setUpstreamStatus,
        fetchUpstreamStatus
      }
    })
  }

  async function runSourceControlMutation(
    mutation: (context: SourceControlContext) => Promise<boolean | void>,
    fallbackError: string
  ): Promise<boolean> {
    const context = getSelectedProjectGitContext()
    if (!context || sourceControlBusy) {
      return false
    }
    setSourceControlBusy(true)
    setSourceControlError(null)
    try {
      const result = await mutation(context)
      if (result === false) {
        return false
      }
      await refreshSelectedProjectGitStatus()
      return true
    } catch (error) {
      setSourceControlError(getSourceControlErrorMessage(error, fallbackError))
      return false
    } finally {
      setSourceControlBusy(false)
    }
  }

  if (!selectedProject?.repoId) {
    return {
      sourceControlBusy,
      sourceControlError
    }
  }

  return {
    sourceControlBusy,
    sourceControlError,
    onStageDiff: async (diff) => {
      await runSourceControlMutation(
        (context) => stageRuntimeGitPath(withoutProject(context), diff.filePath),
        translate('auto.components.agentWorkspace.layout.stageChangeFailed', 'Stage failed')
      )
    },
    onUnstageDiff: async (diff) => {
      await runSourceControlMutation(
        (context) => unstageRuntimeGitPath(withoutProject(context), diff.filePath),
        translate('auto.components.agentWorkspace.layout.unstageChangeFailed', 'Unstage failed')
      )
    },
    onDiscardDiff: async (diff) => {
      await runSourceControlMutation(
        async (context) => {
          const runtimeEnvironmentId = getProjectRuntimeEnvironmentId(context.project)
          await requestEditorSaveQuiesce({
            worktreeId: context.worktreeId,
            worktreePath: context.worktreePath,
            relativePath: diff.filePath,
            runtimeEnvironmentId
          })
          await discardRuntimeGitPath(withoutProject(context), diff.filePath)
          notifyEditorExternalFileChange({
            worktreeId: context.worktreeId,
            worktreePath: context.worktreePath,
            relativePath: diff.filePath,
            runtimeEnvironmentId
          })
        },
        translate('auto.components.agentWorkspace.layout.discardChangeFailed', 'Discard failed')
      )
    },
    onCommitStaged: async (message) =>
      runSourceControlMutation(
        async (context) => {
          const result = await commitRuntimeGit(withoutProject(context), message)
          if (!result.success) {
            setSourceControlError(
              result.error ??
                translate('auto.components.agentWorkspace.layout.commitFailed', 'Commit failed')
            )
            return false
          }
          return true
        },
        translate('auto.components.agentWorkspace.layout.commitFailed', 'Commit failed')
      )
  }
}
