import { translate } from '@/i18n/i18n'
import { searchKeywords } from './settings-search-keywords'

const AGENT_TASK_FIT_HINTS_TITLE_KEY =
  'auto.components.settings.agent-task-fit-hints-copy.4f0e99f1a4'
const AGENT_TASK_FIT_HINTS_DESCRIPTION_KEY =
  'auto.components.settings.agent-task-fit-hints-copy.7650d6f937'

export function getAgentTaskFitHintsTitle(): string {
  return translate(AGENT_TASK_FIT_HINTS_TITLE_KEY, 'Provider task-fit hints')
}

export function getAgentTaskFitHintsDescription(): string {
  return translate(
    AGENT_TASK_FIT_HINTS_DESCRIPTION_KEY,
    'Show lightweight provider labels in the composer without treating them as hard rankings.'
  )
}

export function getAgentTaskFitHintsSearchKeywords(): string[] {
  return searchKeywords([
    { key: 'auto.components.settings.agents.search.96ba2373b6', fallback: 'agent' },
    { key: 'auto.components.settings.agents.search.c44d5d9771', fallback: 'provider' },
    { key: 'auto.components.settings.agents.search.62c63dff1a', fallback: 'hint' },
    { key: 'auto.components.settings.agents.search.50d03f5f62', fallback: 'hints' },
    { key: 'auto.components.settings.agents.search.f947d3a911', fallback: 'task fit' },
    { key: 'auto.components.settings.agents.search.20e6b55fb1', fallback: 'provider hint' },
    { key: 'auto.components.settings.agents.search.650dfd90d6', fallback: 'recommendation' },
    { key: 'auto.components.settings.agents.search.e1fd0f3954', fallback: 'quota' },
    { key: 'auto.components.settings.agents.search.f49c409f49', fallback: 'rate limit' }
  ])
}
