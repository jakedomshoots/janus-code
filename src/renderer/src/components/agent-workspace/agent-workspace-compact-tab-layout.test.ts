import { describe, expect, it } from 'vitest'
import type { TabGroupLayoutNode } from '../../../../shared/types'
import { getAgentWorkspaceCompactSplitRatioUpdates } from './agent-workspace-compact-tab-layout'

describe('getAgentWorkspaceCompactSplitRatioUpdates', () => {
  it('widens each split ancestor that contains the active agent group', () => {
    const layout: TabGroupLayoutNode = {
      type: 'split',
      direction: 'horizontal',
      ratio: 0.5,
      first: {
        type: 'split',
        direction: 'vertical',
        ratio: 0.5,
        first: { type: 'leaf', groupId: 'editor-group' },
        second: { type: 'leaf', groupId: 'agent-group' }
      },
      second: { type: 'leaf', groupId: 'browser-group' }
    }

    expect(
      getAgentWorkspaceCompactSplitRatioUpdates({
        layout,
        targetGroupId: 'agent-group'
      })
    ).toEqual([
      { nodePath: 'first', ratio: 0.15 },
      { nodePath: '', ratio: 0.85 }
    ])
  })

  it('does not update a missing target group', () => {
    expect(
      getAgentWorkspaceCompactSplitRatioUpdates({
        layout: { type: 'leaf', groupId: 'agent-group' },
        targetGroupId: 'other-group'
      })
    ).toEqual([])
  })
})
