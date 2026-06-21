export const AGENT_COMMAND_RISK_CATEGORIES = [
  'safe-read',
  'edit',
  'install',
  'delete',
  'migration',
  'deploy',
  'credential',
  'network'
] as const

export type AgentCommandRiskCategory = (typeof AGENT_COMMAND_RISK_CATEGORIES)[number]
export type AgentCommandRiskLevel = 'low' | 'medium' | 'high'

export type AgentCommandRisk = {
  category: AgentCommandRiskCategory
  level: AgentCommandRiskLevel
  reason: string
}

const CATEGORY_LEVELS: Record<AgentCommandRiskCategory, AgentCommandRiskLevel> = {
  'safe-read': 'low',
  edit: 'medium',
  install: 'medium',
  delete: 'high',
  migration: 'high',
  deploy: 'high',
  credential: 'high',
  network: 'medium'
}

const CATEGORY_REASONS: Record<AgentCommandRiskCategory, string> = {
  'safe-read': 'Read-only command.',
  edit: 'May change files.',
  install: 'May change dependencies or local tools.',
  delete: 'Deletes files or directories.',
  migration: 'May change databases or schemas.',
  deploy: 'May publish, push, or deploy changes.',
  credential: 'Reads or touches credential material.',
  network: 'Uses the network or a remote host.'
}

const CREDENTIAL_PATTERN =
  /(^|[\s"'=:;/\\])(?:\.env(?:[.\w-]*)?|id_rsa|id_dsa|id_ed25519|private[-_\s]?key|credentials?|secrets?|tokens?)(?=$|[\s"'`:;,.\\/])/i
const DELETE_PATTERN =
  /\b(?:rm|del|erase|remove-item|rd|rmdir|git\s+(?:reset\s+--hard|clean\s+-[^\s]*f[^\s]*))\b/i
const MIGRATION_PATTERN =
  /\b(?:prisma\s+migrate|knex\s+migrate|sequelize\s+db:migrate|rails\s+db:migrate|db:migrate|migrate|migration)\b/i
const DEPLOY_PATTERN =
  /\b(?:git\s+push|deploy|firebase\s+deploy|vercel\b.*\b--prod\b|netlify\s+deploy\b.*\b--prod\b|kubectl\s+(?:apply|delete|rollout|scale)|terraform\s+(?:apply|destroy))\b/i
const INSTALL_PATTERN =
  /\b(?:(?:npm|pnpm|yarn|bun)\s+(?:install|add|remove|uninstall|update|upgrade)|(?:pip|pipx|uv|poetry)\s+(?:install|add|remove|update)|(?:brew|apt|apt-get|dnf|yum|pacman|choco|winget)\s+(?:install|remove|update|upgrade))\b/i
const EDIT_PATTERN = /(^|[\s;&|])(?:sed\s+-[^\s]*i|perl\s+-pi|mv|cp|touch|mkdir|tee|>|>>)\b/i
const NETWORK_PATTERN =
  /\b(?:curl|wget|ssh|scp|rsync|invoke-webrequest|invoke-restmethod|iwr|irm)\b/i
const SAFE_READ_PATTERN =
  /^\s*(?:git\s+(?:status|diff|log|show|branch)|ls|pwd|cat|type|get-content|gc|head|tail|less|more|rg|grep|find)\b/i

const RISK_MATCHERS: readonly [AgentCommandRiskCategory, RegExp][] = [
  ['credential', CREDENTIAL_PATTERN],
  ['delete', DELETE_PATTERN],
  ['migration', MIGRATION_PATTERN],
  ['deploy', DEPLOY_PATTERN],
  ['install', INSTALL_PATTERN],
  ['edit', EDIT_PATTERN],
  ['network', NETWORK_PATTERN],
  ['safe-read', SAFE_READ_PATTERN]
]

export function classifyAgentCommandRisk(
  command: string | null | undefined
): AgentCommandRisk | null {
  const normalizedCommand = command?.trim()
  if (!normalizedCommand) {
    return null
  }
  if (/^\s*(?:echo|printf)\b/i.test(normalizedCommand)) {
    return null
  }

  const category = RISK_MATCHERS.find(([, matcher]) => matcher.test(normalizedCommand))?.[0]
  if (!category) {
    return null
  }

  return {
    category,
    level: CATEGORY_LEVELS[category],
    reason: CATEGORY_REASONS[category]
  }
}
