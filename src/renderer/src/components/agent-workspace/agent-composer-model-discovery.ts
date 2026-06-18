import { useEffect, useMemo, useState } from 'react'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'
import {
  getTuiAgentModelOptions,
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
  type TuiAgentModelOption
} from '../../../../shared/tui-agent-models'
import type { Repo, TuiAgent } from '../../../../shared/types'
import type { AgentWorkspaceProject } from './agent-workspace-types'

type AgentModelDiscoveryState = {
  readonly options: readonly TuiAgentModelOption[]
  readonly loading: boolean
  readonly error: string | null
}

function getProjectRepo(
  repos: readonly Pick<Repo, 'id' | 'connectionId' | 'executionHostId'>[],
  project: AgentWorkspaceProject | null
): Pick<Repo, 'id' | 'connectionId' | 'executionHostId'> | null {
  return project?.repoId ? (repos.find((repo) => repo.id === project.repoId) ?? null) : null
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

function toTuiAgentModelOptions(models: readonly TuiAgentModelOption[]): TuiAgentModelOption[] {
  return [
    {
      id: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
      label: translate(
        'auto.components.agentWorkspace.composer.providerDefault',
        'Provider default'
      )
    },
    ...models.map((model) => ({ id: model.id, label: model.label }))
  ]
}

export function useAgentComposerModelDiscovery(
  selectedAgent: TuiAgent | null,
  selectedProject: AgentWorkspaceProject | null
): AgentModelDiscoveryState {
  const repos = useAppStore((state) => state.repos)
  const fallbackOptions = useMemo(() => getTuiAgentModelOptions(selectedAgent), [selectedAgent])
  const repo = useMemo(() => getProjectRepo(repos, selectedProject), [repos, selectedProject])
  const connectionId = getProjectConnectionId(repo, selectedProject)
  const [state, setState] = useState<AgentModelDiscoveryState>(() => ({
    options: fallbackOptions,
    loading: false,
    error: null
  }))

  useEffect(() => {
    if (!selectedAgent || !selectedProject?.path) {
      setState({ options: fallbackOptions, loading: false, error: null })
      return
    }
    if (typeof window.api?.git?.discoverCommitMessageModels !== 'function') {
      setState({ options: fallbackOptions, loading: false, error: null })
      return
    }

    let canceled = false
    setState({ options: fallbackOptions, loading: true, error: null })
    void window.api.git
      .discoverCommitMessageModels({
        agentId: selectedAgent,
        worktreePath: selectedProject.path,
        connectionId
      })
      .then((result) => {
        if (canceled) {
          return
        }
        if (!result.success) {
          setState({ options: fallbackOptions, loading: false, error: result.error })
          return
        }
        setState({
          options: toTuiAgentModelOptions(result.models),
          loading: false,
          error: null
        })
      })
      .catch((error: unknown) => {
        if (canceled) {
          return
        }
        setState({
          options: fallbackOptions,
          loading: false,
          error: error instanceof Error ? error.message : 'Could not discover models.'
        })
      })

    return () => {
      canceled = true
    }
  }, [connectionId, fallbackOptions, selectedAgent, selectedProject?.id, selectedProject?.path])

  return state
}
