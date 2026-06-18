import { getAgentCatalog } from '@/lib/agent-catalog'
import { filterEnabledTuiAgents, pickTuiAgent } from '../../../../shared/tui-agent-selection'
import type { TuiAgent } from '../../../../shared/types'

export function resolveAgentComposerSelection({
  detectedIds,
  defaultTuiAgent,
  disabledTuiAgents
}: {
  detectedIds: readonly TuiAgent[] | null
  defaultTuiAgent: TuiAgent | 'blank' | null
  disabledTuiAgents: readonly TuiAgent[]
}): {
  availableAgents: { id: TuiAgent; label: string }[]
  preferredAgent: TuiAgent | null
} {
  if (detectedIds === null) {
    return { availableAgents: [], preferredAgent: null }
  }
  const enabledIds = new Set(
    filterEnabledTuiAgents(
      getAgentCatalog().map((agent) => agent.id),
      disabledTuiAgents
    )
  )
  const detectedIdSet = new Set(detectedIds)
  return {
    availableAgents: getAgentCatalog().filter(
      (agent) => enabledIds.has(agent.id) && detectedIdSet.has(agent.id)
    ),
    preferredAgent: pickTuiAgent(defaultTuiAgent, detectedIds, disabledTuiAgents)
  }
}
