import type { TuiAgent } from '../../../../shared/types'

export type AgentComposerSlashCommand = {
  command: string
  titleKey: string
  titleFallback: string
  descriptionKey: string
  descriptionFallback: string
  agentIds?: readonly TuiAgent[]
}

const COMMON_AGENT_COMPOSER_SLASH_COMMANDS: readonly AgentComposerSlashCommand[] = [
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

const AGENT_SPECIFIC_SLASH_COMMANDS: readonly AgentComposerSlashCommand[] = [
  {
    command: '/approvals',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.approvals.title',
    titleFallback: 'Approvals',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.approvals.description',
    descriptionFallback: 'Inspect or adjust Codex approval behavior when supported.',
    agentIds: ['codex']
  },
  {
    command: '/doctor',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.doctor.title',
    titleFallback: 'Doctor',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.doctor.description',
    descriptionFallback: 'Run agent diagnostics when the selected CLI supports it.',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/cost',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.cost.title',
    titleFallback: 'Cost',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.cost.description',
    descriptionFallback: 'Show Claude session cost or usage when supported.',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/mcp',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.mcp.title',
    titleFallback: 'MCP',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.mcp.description',
    descriptionFallback: 'Inspect connected MCP servers when the selected CLI supports it.',
    agentIds: ['claude', 'codex', 'openclaude']
  },
  {
    command: '/memory',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.memory.title',
    titleFallback: 'Memory',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.memory.description',
    descriptionFallback: 'Inspect or edit agent memory when the selected CLI supports it.',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/login',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.login.title',
    titleFallback: 'Login',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.login.description',
    descriptionFallback: 'Open authentication flow when the selected CLI supports it.',
    agentIds: ['claude', 'codex', 'openclaude']
  },
  {
    command: '/logout',
    titleKey: 'auto.components.agentWorkspace.composer.slashCommand.logout.title',
    titleFallback: 'Logout',
    descriptionKey: 'auto.components.agentWorkspace.composer.slashCommand.logout.description',
    descriptionFallback: 'Sign out when the selected CLI supports it.',
    agentIds: ['claude', 'codex', 'openclaude']
  }
]

export const AGENT_COMPOSER_SLASH_COMMANDS: readonly AgentComposerSlashCommand[] = [
  ...COMMON_AGENT_COMPOSER_SLASH_COMMANDS,
  ...AGENT_SPECIFIC_SLASH_COMMANDS
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
  prompt: string,
  agentId?: TuiAgent | null
): readonly AgentComposerSlashCommand[] {
  const query = getAgentComposerSlashQuery(prompt)
  if (query === null) {
    return []
  }
  const commands = getAgentComposerSlashCommandsForAgent(agentId)
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
  agentId: TuiAgent | null | undefined
): readonly AgentComposerSlashCommand[] {
  const commands = AGENT_COMPOSER_SLASH_COMMANDS.filter(
    (item) => !item.agentIds || (agentId ? item.agentIds.includes(agentId) : false)
  )
  return [...commands].sort((left, right) => left.command.localeCompare(right.command))
}
