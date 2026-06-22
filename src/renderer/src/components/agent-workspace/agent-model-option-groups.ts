import {
  getTuiAgentModelProviderCategory,
  type TuiAgentModelProviderCategory
} from '../../../../shared/tui-agent-model-provider-categories'
import type { TuiAgentModelOption } from '../../../../shared/tui-agent-models'

type GroupedModelOptions = {
  category: TuiAgentModelProviderCategory
  options: TuiAgentModelOption[]
}

export function agentModelOptionMatchesQuery(
  option: TuiAgentModelOption,
  normalizedQuery: string
): boolean {
  const category = getTuiAgentModelProviderCategory(option)
  return (
    option.label.toLowerCase().includes(normalizedQuery) ||
    option.id.toLowerCase().includes(normalizedQuery) ||
    category.label.toLowerCase().includes(normalizedQuery)
  )
}

export function groupAgentModelOptionsByProvider(
  options: readonly TuiAgentModelOption[]
): GroupedModelOptions[] {
  const groupsById = new Map<string, GroupedModelOptions>()
  for (const option of options) {
    const category = getTuiAgentModelProviderCategory(option)
    const group = groupsById.get(category.id)
    if (group) {
      group.options.push(option)
    } else {
      groupsById.set(category.id, { category, options: [option] })
    }
  }
  return Array.from(groupsById.values()).sort((left, right) => {
    const order = left.category.order - right.category.order
    return order === 0 ? left.category.label.localeCompare(right.category.label) : order
  })
}
