import { translate } from '@/i18n/i18n'
import type { TuiAgent } from '../../../../shared/types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function isSelectedThreadReady(
  thread: AgentWorkspaceThread | null,
  activeWorktreeId: string | null
): boolean {
  return Boolean(
    thread &&
    (thread.phase === 'running' || thread.phase === 'waiting-for-user') &&
    activeWorktreeId === thread.worktreeId
  )
}

export function getAgentComposerReadinessMessage({
  thread,
  activeWorktreeId,
  selectedAgent,
  detectingAgents
}: {
  thread: AgentWorkspaceThread | null
  activeWorktreeId: string | null
  selectedAgent: TuiAgent | null
  detectingAgents: boolean
}): string | null {
  if (thread && activeWorktreeId !== thread.worktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.threadNotActiveWorktree',
      'Switch to this worktree before sending a message.'
    )
  }
  if (isSelectedThreadReady(thread, activeWorktreeId)) {
    return null
  }
  if (!activeWorktreeId && thread) {
    return translate(
      'auto.components.agentWorkspace.composer.selectWorkspaceBeforeLaunching',
      'Select a workspace before starting an agent.'
    )
  }
  if (detectingAgents) {
    return translate(
      'auto.components.agentWorkspace.composer.detectingProviders',
      'Detecting available agents for this workspace...'
    )
  }
  if (!selectedAgent) {
    return translate(
      'auto.components.agentWorkspace.composer.noDetectedProviders',
      'No detected agents are available for this workspace.'
    )
  }
  return null
}

export function getAgentComposerPlaceholder(
  thread: AgentWorkspaceThread | null,
  activeWorktreeId: string | null
): string {
  if (!thread) {
    return translate(
      'auto.components.agentWorkspace.composer.startNewAgentPlaceholder',
      'Start a new agent session'
    )
  }
  if (thread.phase !== 'running' && thread.phase !== 'waiting-for-user') {
    return translate(
      'auto.components.agentWorkspace.composer.startAfterThreadPlaceholder',
      'Start a new agent; selected thread is {{phase}}',
      { phase: formatAgentWorkspacePhase(thread.phase) }
    )
  }
  if (activeWorktreeId !== thread.worktreeId) {
    return translate(
      'auto.components.agentWorkspace.composer.switchWorktreePlaceholder',
      'Switch to this worktree'
    )
  }
  return translate(
    'auto.components.agentWorkspace.composer.messageSelectedAgent',
    'Message the selected agent...'
  )
}

export function encodeAgentModelSelections(
  selections: Partial<Record<TuiAgent, string>> | null | undefined
): string {
  return JSON.stringify(
    Object.entries(selections ?? {}).sort(([left], [right]) => left.localeCompare(right))
  )
}

export function decodeAgentModelSelectionsKey(key: string): Partial<Record<TuiAgent, string>> {
  try {
    return Object.fromEntries(JSON.parse(key) as [TuiAgent, string][])
  } catch {
    return {}
  }
}
