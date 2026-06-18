import type { Tab } from '../../../../shared/types'

export function sortUnifiedTabsByGroupOrder(
  tabs: readonly Tab[],
  tabOrder: readonly string[]
): Tab[] {
  const orderIndex = new Map(tabOrder.map((tabId, index) => [tabId, index]))
  return [...tabs].sort((left, right) => {
    const leftIndex = orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER
    return leftIndex - rightIndex
  })
}
