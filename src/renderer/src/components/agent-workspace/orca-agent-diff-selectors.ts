import type { AppState } from '@/store'
import type { GitFileStatus, GitStatusEntry } from '../../../../shared/types'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'
import { compareGitStatusEntries } from '../right-sidebar/source-control-status-sort'

export type AgentWorkspaceDiffSourceState = Pick<AppState, 'gitStatusByWorktree'>

// Why: git status is worktree-scoped; each thread needs a live baseline so
// old worktree dirt does not appear as work performed by a newly opened thread.
const baselineSignaturesByThreadId = new Map<string, Set<string>>()

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

function getStatusSignature(entry: GitStatusEntry): string {
  return [
    entry.area,
    entry.status,
    entry.oldPath ?? 'no-old-path',
    entry.path,
    entry.added ?? 0,
    entry.removed ?? 0
  ].join(':')
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
  const currentThreadIds = new Set(threads.map((thread) => thread.id))

  for (const threadId of baselineSignaturesByThreadId.keys()) {
    if (!currentThreadIds.has(threadId)) {
      baselineSignaturesByThreadId.delete(threadId)
    }
  }

  for (const thread of threads) {
    const entries = state.gitStatusByWorktree[thread.worktreeId] ?? []
    const baselineSignatures =
      baselineSignaturesByThreadId.get(thread.id) ??
      new Set(entries.map((baselineEntry) => getStatusSignature(baselineEntry)))
    if (!baselineSignaturesByThreadId.has(thread.id)) {
      baselineSignaturesByThreadId.set(thread.id, baselineSignatures)
    }
    for (const entry of [...entries].sort(compareGitStatusEntries)) {
      const signature = getStatusSignature(entry)
      if (baselineSignatures.has(signature)) {
        continue
      }
      diffs.push(toAgentWorkspaceDiffSummary(thread, entry))
    }
  }

  return diffs
}

export function resetAgentWorkspaceDiffBaselinesForTest(): void {
  baselineSignaturesByThreadId.clear()
}
