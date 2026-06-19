export type AgentComposerSlashCommand = {
  command: string
  titleKey: string
  titleFallback: string
  descriptionKey: string
  descriptionFallback: string
}

export const AGENT_COMPOSER_SLASH_COMMANDS: readonly AgentComposerSlashCommand[] = [
  {
    command: '/help',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.help.title',
    titleFallback: 'Help',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.help.description',
    descriptionFallback: 'Show the selected agent commands and shortcuts.'
  },
  {
    command: '/model',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.model.title',
    titleFallback: 'Model',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.model.description',
    descriptionFallback: 'Inspect or change the active model when the agent supports it.'
  },
  {
    command: '/status',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.status.title',
    titleFallback: 'Status',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.status.description',
    descriptionFallback: 'Ask for the current session, plan, or runtime status.'
  },
  {
    command: '/clear',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.clear.title',
    titleFallback: 'Clear',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.clear.description',
    descriptionFallback: 'Clear or reset context when the agent supports it.'
  },
  {
    command: '/compact',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.compact.title',
    titleFallback: 'Compact',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.compact.description',
    descriptionFallback: 'Ask the agent to compact long conversation context.'
  },
  {
    command: '/init',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.init.title',
    titleFallback: 'Init',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.init.description',
    descriptionFallback: 'Initialize project or agent guidance files.'
  },
  {
    command: '/review',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.review.title',
    titleFallback: 'Review',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.review.description',
    descriptionFallback: 'Request a code review workflow.'
  },
  {
    command: '/diff',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.diff.title',
    titleFallback: 'Diff',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.diff.description',
    descriptionFallback: 'Ask the agent to inspect current changes.'
  },
  {
    command: '/permissions',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.permissions.title',
    titleFallback: 'Permissions',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.permissions.description',
    descriptionFallback: 'Inspect or adjust tool approval behavior when supported.'
  },
  {
    command: '/resume',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.resume.title',
    titleFallback: 'Resume',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.resume.description',
    descriptionFallback: 'Resume or inspect session continuity when supported.'
  }
]

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
  prompt: string
): readonly AgentComposerSlashCommand[] {
  const query = getAgentComposerSlashQuery(prompt)
  if (query === null) {
    return []
  }
  if (!query) {
    return AGENT_COMPOSER_SLASH_COMMANDS
  }
  return AGENT_COMPOSER_SLASH_COMMANDS.filter((item) => {
    const haystack =
      `${item.command} ${item.titleFallback} ${item.descriptionFallback}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function completeAgentComposerSlashCommand(command: string): string {
  return command
}
