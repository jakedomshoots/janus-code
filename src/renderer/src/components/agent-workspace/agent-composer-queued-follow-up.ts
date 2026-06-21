import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export type AgentComposerQueuedFollowUp = {
  readonly threadId: string
  readonly worktreeId: string
  readonly prompt: string
}

export function isAgentComposerThreadBusy({
  thread,
  timeline
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): boolean {
  if (!thread || thread.phase !== 'running') {
    return false
  }
  return timeline.some(
    (entry) =>
      entry.threadId === thread.id &&
      entry.status === 'running' &&
      (entry.kind === 'agent' || entry.kind === 'tool' || entry.kind === 'approval')
  )
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
