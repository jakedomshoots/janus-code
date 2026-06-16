import type { AppState } from '@/store'
import type { GitFileStatus, GitStatusEntry } from '../../../../shared/types'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'
import { compareGitStatusEntries } from '../right-sidebar/source-control-status-sort'

export type AgentWorkspaceDiffSourceState = Pick<AppState, 'gitStatusByWorktree'>

export function mapGitStatusToAgentWorkspaceDiffStatus(
  status: GitFileStatus
): AgentWorkspaceDiffSummary['status'] {
  switch (status) {
    case 'modified':
      return 'modified'
    case 'added':
    case 'untracked':
    case 'copied':
      return 'added'
    case 'deleted':
      return 'deleted'
    case 'renamed':
      return 'renamed'
  }
}

function getDiffId(thread: AgentWorkspaceThread, entry: GitStatusEntry): string {
  return [thread.id, entry.area, entry.status, entry.oldPath ?? 'no-old-path', entry.path].join(':')
}

function toAgentWorkspaceDiffSummary(
  thread: AgentWorkspaceThread,
  entry: GitStatusEntry
): AgentWorkspaceDiffSummary {
  return {
    id: getDiffId(thread, entry),
    threadId: thread.id,
    area: entry.area,
    filePath: entry.path,
    ...(entry.oldPath ? { oldPath: entry.oldPath } : {}),
    additions: entry.added ?? 0,
    deletions: entry.removed ?? 0,
    status: mapGitStatusToAgentWorkspaceDiffStatus(entry.status)
  }
}

export function selectAgentWorkspaceDiffs(
  state: AgentWorkspaceDiffSourceState,
  threads: readonly AgentWorkspaceThread[]
): readonly AgentWorkspaceDiffSummary[] {
  const diffs: AgentWorkspaceDiffSummary[] = []

  for (const thread of threads) {
    const entries = state.gitStatusByWorktree[thread.worktreeId] ?? []
    for (const entry of [...entries].sort(compareGitStatusEntries)) {
      diffs.push(toAgentWorkspaceDiffSummary(thread, entry))
    }
  }

  return diffs
}
