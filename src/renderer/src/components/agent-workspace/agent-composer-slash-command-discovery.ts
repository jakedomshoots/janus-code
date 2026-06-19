import { useEffect, useState } from 'react'
import type { AgentComposerSlashCommand } from './agent-composer-slash-command-model'
import type { TuiAgent } from '../../../../shared/types'

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
  selectedAgent: TuiAgent | null
): AgentSlashCommandDiscoveryState {
  const [commands, setCommands] = useState<readonly AgentComposerSlashCommand[]>([])

  useEffect(() => {
    if (!selectedAgent || typeof window.api?.git?.discoverAgentSlashCommands !== 'function') {
      setCommands([])
      return
    }
    let canceled = false
    void window.api.git
      .discoverAgentSlashCommands({ agentId: selectedAgent })
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
  }, [selectedAgent])

  return { commands }
}
