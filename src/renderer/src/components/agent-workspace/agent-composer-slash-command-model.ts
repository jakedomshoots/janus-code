import type { TuiAgent } from '../../../../shared/types'
import { getTuiAgentSlashCommands } from '../../../../shared/tui-agent-slash-commands'
import type { TuiAgentSlashCommand } from '../../../../shared/tui-agent-slash-commands'

export type AgentComposerSlashCommand = {
  command: string
  titleKey: string
  titleFallback: string
  descriptionKey: string
  descriptionFallback: string
  agentIds?: readonly TuiAgent[]
}

function toAgentComposerSlashCommand(command: TuiAgentSlashCommand): AgentComposerSlashCommand {
  return {
    command: command.command,
    titleKey: `auto.components.agentWorkspace.composer.slashCommand.${command.command.slice(1)}.title`,
    titleFallback: command.title,
    descriptionKey: `auto.components.agentWorkspace.composer.slashCommand.${command.command.slice(1)}.description`,
    descriptionFallback: command.description,
    agentIds: command.agentIds
  }
}

export function getAgentComposerSlashQuery(prompt: string): string | null {
  if (!prompt.startsWith('/')) {
    return null
  }
  if (/\s/.test(prompt)) {
    return null
  }
  return prompt.slice(1).toLowerCase()
}

export function getAgentComposerSlashCommandMatches(
  prompt: string,
  agentId?: TuiAgent | null,
  learnedCommands: readonly AgentComposerSlashCommand[] = []
): readonly AgentComposerSlashCommand[] {
  const query = getAgentComposerSlashQuery(prompt)
  if (query === null) {
    return []
  }
  const commands = getAgentComposerSlashCommandsForAgent(agentId, learnedCommands)
  if (!query) {
    return commands
  }
  return commands.filter((item) => {
    const haystack =
      `${item.command} ${item.titleFallback} ${item.descriptionFallback}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function completeAgentComposerSlashCommand(command: string): string {
  return command
}

function getAgentComposerSlashCommandsForAgent(
  agentId: TuiAgent | null | undefined,
  learnedCommands: readonly AgentComposerSlashCommand[]
): readonly AgentComposerSlashCommand[] {
  const commands = new Map<string, AgentComposerSlashCommand>()
  if (agentId) {
    for (const item of getTuiAgentSlashCommands(agentId).map(toAgentComposerSlashCommand)) {
      commands.set(item.command, item)
    }
  }
  for (const item of learnedCommands) {
    commands.set(item.command, item)
  }
  return [...commands.values()].sort((left, right) => left.command.localeCompare(right.command))
}
