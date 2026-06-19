import { isTuiAgent } from './tui-agent-config'
import type { TuiAgent } from './types'

export type TuiAgentSlashCommand = {
  command: string
  title: string
  description: string
  source: 'catalog'
  agentIds?: readonly TuiAgent[]
}

export type DiscoverTuiAgentSlashCommandsResult =
  | {
      success: true
      agentId: TuiAgent
      commands: TuiAgentSlashCommand[]
    }
  | {
      success: false
      error: string
    }

const COMMON_TUI_AGENT_SLASH_COMMANDS: readonly TuiAgentSlashCommand[] = [
  {
    command: '/commands',
    title: 'Commands',
    description: 'Refresh the live slash-command list from the selected agent.',
    source: 'catalog'
  },
  {
    command: '/help',
    title: 'Help',
    description: 'Show the selected agent commands and shortcuts.',
    source: 'catalog'
  },
  {
    command: '/model',
    title: 'Model',
    description: 'Inspect or change the active model when the agent supports it.',
    source: 'catalog'
  },
  {
    command: '/status',
    title: 'Status',
    description: 'Ask for the current session, plan, or runtime status.',
    source: 'catalog'
  },
  {
    command: '/clear',
    title: 'Clear',
    description: 'Clear or reset context when the agent supports it.',
    source: 'catalog'
  },
  {
    command: '/compact',
    title: 'Compact',
    description: 'Ask the agent to compact long conversation context.',
    source: 'catalog'
  },
  {
    command: '/init',
    title: 'Init',
    description: 'Initialize project or agent guidance files.',
    source: 'catalog'
  },
  {
    command: '/review',
    title: 'Review',
    description: 'Request a code review workflow.',
    source: 'catalog'
  },
  {
    command: '/diff',
    title: 'Diff',
    description: 'Ask the agent to inspect current changes.',
    source: 'catalog'
  },
  {
    command: '/permissions',
    title: 'Permissions',
    description: 'Inspect or adjust tool approval behavior when supported.',
    source: 'catalog'
  },
  {
    command: '/resume',
    title: 'Resume',
    description: 'Resume or inspect session continuity when supported.',
    source: 'catalog'
  }
]

const AGENT_SPECIFIC_TUI_AGENT_SLASH_COMMANDS: readonly TuiAgentSlashCommand[] = [
  {
    command: '/approvals',
    title: 'Approvals',
    description: 'Inspect or adjust Codex approval behavior when supported.',
    source: 'catalog',
    agentIds: ['codex']
  },
  {
    command: '/doctor',
    title: 'Doctor',
    description: 'Run agent diagnostics when the selected CLI supports it.',
    source: 'catalog',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/cost',
    title: 'Cost',
    description: 'Show Claude session cost or usage when supported.',
    source: 'catalog',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/mcp',
    title: 'MCP',
    description: 'Inspect connected MCP servers when the selected CLI supports it.',
    source: 'catalog',
    agentIds: ['claude', 'codex', 'openclaude']
  },
  {
    command: '/memory',
    title: 'Memory',
    description: 'Inspect or edit agent memory when the selected CLI supports it.',
    source: 'catalog',
    agentIds: ['claude', 'openclaude']
  },
  {
    command: '/login',
    title: 'Login',
    description: 'Open authentication flow when the selected CLI supports it.',
    source: 'catalog',
    agentIds: ['claude', 'codex', 'openclaude']
  },
  {
    command: '/logout',
    title: 'Logout',
    description: 'Sign out when the selected CLI supports it.',
    source: 'catalog',
    agentIds: ['claude', 'codex', 'openclaude']
  }
]

export function discoverTuiAgentSlashCommands(
  agentId: string
): DiscoverTuiAgentSlashCommandsResult {
  if (!isTuiAgent(agentId)) {
    return { success: false, error: `Unknown agent "${agentId}".` }
  }
  return {
    success: true,
    agentId,
    commands: getTuiAgentSlashCommands(agentId)
  }
}

export function getTuiAgentSlashCommands(agentId: TuiAgent): TuiAgentSlashCommand[] {
  const commands = new Map<string, TuiAgentSlashCommand>()
  for (const item of COMMON_TUI_AGENT_SLASH_COMMANDS) {
    commands.set(item.command, item)
  }
  for (const item of AGENT_SPECIFIC_TUI_AGENT_SLASH_COMMANDS) {
    if (item.agentIds?.includes(agentId)) {
      commands.set(item.command, item)
    }
  }
  return [...commands.values()].sort((left, right) => left.command.localeCompare(right.command))
}
