import type { AppState } from '@/store'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import type { AgentWorkspacePlan, AgentWorkspaceThread } from './agent-workspace-types'

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function toAgentWorkspacePlan(
  threadId: string,
  entry: AgentStatusEntry
): AgentWorkspacePlan | null {
  const plan = entry.plan
  if (!plan) {
    return null
  }
  return {
    id: `${threadId}:plan`,
    threadId,
    title: plan.title ?? null,
    explanation: plan.explanation ?? null,
    steps: plan.steps.map((step) => ({
      id: step.id,
      title: step.title,
      status: step.status
    })),
    markdown: plan.markdown ?? null,
    updatedAt: getIsoTimestamp(plan.updatedAt ?? entry.updatedAt)
  }
}

export function selectAgentWorkspacePlans(
  state: AppState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspacePlan[] {
  const threadIds = new Set(threads.map((thread) => thread.id))
  const plans: AgentWorkspacePlan[] = []

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    if (!threadIds.has(paneKey)) {
      continue
    }
    const plan = toAgentWorkspacePlan(paneKey, entry)
    if (plan) {
      plans.push(plan)
    }
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey || !threadIds.has(paneKey)) {
      continue
    }
    const plan = toAgentWorkspacePlan(paneKey, retained.entry)
    if (plan) {
      plans.push(plan)
    }
  }

  return plans
}
