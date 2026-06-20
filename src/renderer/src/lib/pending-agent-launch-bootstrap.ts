import type { AppState } from '@/store'
import { mintStablePaneId } from '@/lib/pane-manager/mint-stable-pane-id'
import { makePaneKey } from '../../../shared/stable-pane-id'
import type { TuiAgent } from '../../../shared/types'

type PendingAgentLaunchBootstrapStore = Pick<AppState, 'queuePendingAgentLaunch' | 'setTabLayout'>

type PendingAgentLaunchBootstrapArgs = {
  store: PendingAgentLaunchBootstrapStore
  tabId: string
  worktreeId: string
  agent: TuiAgent
  prompt: string
}

export function bootstrapPendingAgentLaunch({
  store,
  tabId,
  worktreeId,
  agent,
  prompt
}: PendingAgentLaunchBootstrapArgs): string {
  const leafId = mintStablePaneId()
  const paneKey = makePaneKey(tabId, leafId)

  // Why: the optimistic thread must use the eventual PTY pane key so real
  // status replaces it instead of creating a duplicate row.
  store.setTabLayout(tabId, {
    root: { type: 'leaf', leafId },
    activeLeafId: leafId,
    expandedLeafId: null
  })
  store.queuePendingAgentLaunch({
    paneKey,
    tabId,
    worktreeId,
    agent,
    prompt,
    startedAt: Date.now()
  })

  return paneKey
}
