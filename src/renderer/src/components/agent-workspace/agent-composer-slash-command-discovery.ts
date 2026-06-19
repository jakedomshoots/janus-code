import { useEffect, useState } from 'react'
import type { AgentComposerSlashCommand } from './agent-composer-slash-command-model'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentWorkspaceProject } from './agent-workspace-types'

type AgentSlashCommandDiscoveryState = {
  readonly commands: readonly AgentComposerSlashCommand[]
}

function toAgentComposerSlashCommand(command: {
  command: string
  title: string
  description: string
}): AgentComposerSlashCommand {
  return {
    command: command.command,
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.discovered.title',
    titleFallback: command.title,
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.discovered.description',
    descriptionFallback: command.description
  }
}

export function useAgentComposerSlashCommandDiscovery(
  selectedAgent: TuiAgent | null,
  selectedProject: AgentWorkspaceProject | null
): AgentSlashCommandDiscoveryState {
  const [commands, setCommands] = useState<readonly AgentComposerSlashCommand[]>([])
  const selectedProjectPath = selectedProject?.path
  const selectedProjectConnectionId =
    selectedProject?.agentDetectionTarget?.kind === 'ssh'
      ? selectedProject.agentDetectionTarget.connectionId
      : undefined

  useEffect(() => {
    if (!selectedAgent || typeof window.api?.git?.discoverAgentSlashCommands !== 'function') {
      setCommands([])
      return
    }
    let canceled = false
    void window.api.git
      .discoverAgentSlashCommands({
        agentId: selectedAgent,
        ...(selectedProjectPath ? { worktreePath: selectedProjectPath } : {}),
        ...(selectedProjectConnectionId ? { connectionId: selectedProjectConnectionId } : {})
      })
      .then((result) => {
        if (canceled) {
          return
        }
        if (!result.success) {
          setCommands([])
          return
        }
        setCommands(result.commands.map(toAgentComposerSlashCommand))
      })
      .catch(() => {
        if (!canceled) {
          setCommands([])
        }
      })
    return () => {
      canceled = true
    }
  }, [selectedAgent, selectedProjectConnectionId, selectedProjectPath])

  return { commands }
}
