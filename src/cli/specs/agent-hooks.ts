import type { CommandSpec } from '../args'
import { GLOBAL_FLAGS } from '../args'

export const AGENT_HOOK_COMMAND_SPECS: CommandSpec[] = [
  {
    path: ['agent', 'hooks', 'status'],
    summary: 'Show whether Janus Code-managed agent status hooks are enabled',
    usage: 'janus agent hooks status [--json]',
    allowedFlags: [...GLOBAL_FLAGS],
    examples: ['janus agent hooks status', 'janus agent hooks status --json']
  },
  {
    path: ['agent', 'hooks', 'off'],
    summary: 'Disable Janus Code-managed agent status hooks and remove local hook entries',
    usage: 'janus agent hooks off [--json]',
    allowedFlags: [...GLOBAL_FLAGS],
    examples: ['janus agent hooks off']
  },
  {
    path: ['agent', 'hooks', 'on'],
    summary: 'Enable Janus Code-managed agent status hooks',
    usage: 'janus agent hooks on [--json]',
    allowedFlags: [...GLOBAL_FLAGS],
    examples: ['janus agent hooks on']
  }
]
