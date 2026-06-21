import { translate } from '@/i18n/i18n'
import type { TuiAgent } from '../../../../shared/types'

type AgentProviderTaskFitLabel =
  | 'review'
  | 'broad-refactor'
  | 'fast-edit'
  | 'browser-task'
  | 'local-only'
  | 'long-context'

const TASK_FIT_LABELS_BY_AGENT: Partial<Record<TuiAgent, readonly AgentProviderTaskFitLabel[]>> = {
  claude: ['broad-refactor', 'long-context', 'review'],
  openclaude: ['broad-refactor', 'long-context', 'review'],
  codex: ['review', 'long-context', 'local-only'],
  opencode: ['fast-edit', 'local-only'],
  pi: ['fast-edit', 'local-only'],
  omp: ['fast-edit', 'local-only'],
  cursor: ['fast-edit', 'browser-task', 'local-only'],
  copilot: ['fast-edit', 'review'],
  gemini: ['long-context', 'review'],
  aider: ['local-only', 'broad-refactor'],
  goose: ['local-only', 'browser-task'],
  amp: ['broad-refactor', 'long-context']
}

export function getAgentProviderTaskFitDescription(agent: TuiAgent): string | undefined {
  const labels = TASK_FIT_LABELS_BY_AGENT[agent]
  if (!labels || labels.length === 0) {
    return undefined
  }

  return translate(
    'auto.components.agentWorkspace.composer.taskFitDescription',
    'Good fit: {{labels}}',
    {
      labels: labels.map(formatAgentProviderTaskFitLabel).join(' · ')
    }
  )
}

function formatAgentProviderTaskFitLabel(label: AgentProviderTaskFitLabel): string {
  switch (label) {
    case 'review':
      return translate('auto.components.agentWorkspace.composer.taskFitReview', 'Review')
    case 'broad-refactor':
      return translate(
        'auto.components.agentWorkspace.composer.taskFitBroadRefactor',
        'Broad refactor'
      )
    case 'fast-edit':
      return translate('auto.components.agentWorkspace.composer.taskFitFastEdit', 'Fast edit')
    case 'browser-task':
      return translate('auto.components.agentWorkspace.composer.taskFitBrowserTask', 'Browser task')
    case 'local-only':
      return translate('auto.components.agentWorkspace.composer.taskFitLocalOnly', 'Local-only')
    case 'long-context':
      return translate('auto.components.agentWorkspace.composer.taskFitLongContext', 'Long context')
  }
}
