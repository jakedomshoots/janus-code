export const JANUS_SKILLS_REPOSITORY_URL = 'https://github.com/jakedomshoots/janus-code'

export const JANUS_CLI_SKILL_NAME = 'janus-cli'
export const COMPUTER_USE_SKILL_NAME = 'computer-use'
export const ORCHESTRATION_SKILL_NAME = 'orchestration'
export const LINEAR_TICKETS_SKILL_NAME = 'linear-tickets'

export function buildAgentFeatureSkillInstallCommand(skillNames: readonly string[]): string {
  if (skillNames.length === 0) {
    throw new Error('At least one skill name is required.')
  }
  return `npx skills add ${JANUS_SKILLS_REPOSITORY_URL} --skill ${skillNames.join(' ')} --global`
}

export const JANUS_CLI_SKILL_INSTALL_COMMAND = buildAgentFeatureSkillInstallCommand([
  JANUS_CLI_SKILL_NAME
])

export const COMPUTER_USE_SKILL_INSTALL_COMMAND = buildAgentFeatureSkillInstallCommand([
  COMPUTER_USE_SKILL_NAME
])

export const ORCHESTRATION_SKILL_INSTALL_COMMAND = buildAgentFeatureSkillInstallCommand([
  ORCHESTRATION_SKILL_NAME
])

export const JANUS_CLI_ORCHESTRATION_SKILL_INSTALL_COMMAND = buildAgentFeatureSkillInstallCommand([
  JANUS_CLI_SKILL_NAME,
  ORCHESTRATION_SKILL_NAME
])

export const LINEAR_TICKETS_SKILL_INSTALL_COMMAND = buildAgentFeatureSkillInstallCommand([
  LINEAR_TICKETS_SKILL_NAME
])
