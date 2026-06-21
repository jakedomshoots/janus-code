import type { AppState } from '@/store'
import { mintStablePaneId } from '@/lib/pane-manager/mint-stable-pane-id'
import { makePaneKey } from '../../../shared/stable-pane-id'
import type { TuiAgent } from '../../../shared/types'
import type { AgentStatusVerification } from '../../../shared/agent-status-types'
import type { AgentComposerContextManifest } from '@/components/agent-workspace/agent-composer-context-manifest'

type PendingAgentLaunchBootstrapStore = Pick<AppState, 'queuePendingAgentLaunch' | 'setTabLayout'>

type PendingAgentLaunchBootstrapArgs = {
  store: PendingAgentLaunchBootstrapStore
  tabId: string
  worktreeId: string
  agent: TuiAgent
  prompt: string
  verification?: AgentStatusVerification
  promptContextManifest?: AgentComposerContextManifest
}

export function bootstrapPendingAgentLaunch({
  store,
  tabId,
  worktreeId,
  agent,
  prompt,
  verification,
  promptContextManifest
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
    ...(verification ? { verification } : {}),
    ...(promptContextManifest?.items.length ? { promptContextManifest } : {}),
    startedAt: Date.now()
  })

  return paneKey
}
