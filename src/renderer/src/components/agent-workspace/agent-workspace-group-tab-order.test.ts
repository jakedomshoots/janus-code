import { describe, expect, it } from 'vitest'
import type { Tab } from '../../../../shared/types'
import { sortUnifiedTabsByGroupOrder } from './agent-workspace-group-tab-order'

function makeTab(id: string): Tab {
  return {
    id,
    entityId: id,
    groupId: 'group-1',
    worktreeId: 'worktree-1',
    contentType: 'browser',
    label: id,
    sortOrder: 0,
    createdAt: 1
  }
}

describe('sortUnifiedTabsByGroupOrder', () => {
  it('orders tabs by the group tabOrder sequence', () => {
    const tabs = [makeTab('tab-c'), makeTab('tab-a'), makeTab('tab-b')]
    const ordered = sortUnifiedTabsByGroupOrder(tabs, ['tab-a', 'tab-b', 'tab-c'])
    expect(ordered.map((tab) => tab.id)).toEqual(['tab-a', 'tab-b', 'tab-c'])
  })
})
