import type { AppState } from '@/store'
import type { AgentWorkspaceRunReplayContext, AgentWorkspaceThread } from './agent-workspace-types'

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function selectAgentWorkspaceRunReplayContexts(
  state: AppState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspaceRunReplayContext[] {
  const threadIds = new Set(threads.map((thread) => thread.id))
  const contexts: AgentWorkspaceRunReplayContext[] = []

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    if (!threadIds.has(paneKey)) {
      continue
    }
    const pendingLaunch = state.pendingAgentLaunchesByPaneKey[paneKey]
    contexts.push({
      threadId: paneKey,
      prompt: nonEmpty(entry.prompt) ?? nonEmpty(pendingLaunch?.prompt),
      ...(pendingLaunch?.promptContextManifest
        ? { promptContextManifest: pendingLaunch.promptContextManifest }
        : {})
    })
  }

  for (const [paneKey, launch] of Object.entries(state.pendingAgentLaunchesByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey || !threadIds.has(paneKey)) {
      continue
    }
    contexts.push({
      threadId: paneKey,
      prompt: nonEmpty(launch.prompt),
      ...(launch.promptContextManifest
        ? { promptContextManifest: launch.promptContextManifest }
        : {})
    })
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey || !threadIds.has(paneKey)) {
      continue
    }
    contexts.push({
      threadId: paneKey,
      prompt: nonEmpty(retained.entry.prompt)
    })
  }

  return contexts.sort((a, b) => a.threadId.localeCompare(b.threadId))
}
