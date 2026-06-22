import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export type AgentComposerQueuedFollowUp = {
  readonly threadId: string
  readonly worktreeId: string
  readonly prompt: string
}

export function isAgentComposerThreadBusy({
  thread,
  timeline: _timeline
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): boolean {
  // Why: a running phase means the TUI has not asked for user input yet; direct
  // sends can become ghost timeline turns when provider telemetry is partial.
  return thread?.phase === 'running'
}

export function isQueuedFollowUpTarget({
  queuedFollowUp,
  activeWorktreeId,
  selectedThread
}: {
  queuedFollowUp: AgentComposerQueuedFollowUp | null
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
}): boolean {
  return Boolean(
    queuedFollowUp &&
    selectedThread &&
    activeWorktreeId === queuedFollowUp.worktreeId &&
    selectedThread.worktreeId === queuedFollowUp.worktreeId &&
    selectedThread.id === queuedFollowUp.threadId
  )
}

export function getQueuedFollowUpKey(queuedFollowUp: AgentComposerQueuedFollowUp): string {
  return `${queuedFollowUp.worktreeId}:${queuedFollowUp.threadId}:${queuedFollowUp.prompt}`
}
