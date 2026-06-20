import { beforeEach, describe, expect, it } from 'vitest'
import type { GitStatusEntry } from '../../../../shared/types'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import {
  mapGitStatusToAgentWorkspaceDiffStatus,
  resetAgentWorkspaceDiffBaselinesForTest,
  selectAgentWorkspaceDiffs,
  type AgentWorkspaceDiffSourceState
} from './orca-agent-diff-selectors'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement diff panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

function sourceState(entries: readonly GitStatusEntry[]): AgentWorkspaceDiffSourceState {
  return {
    gitStatusByWorktree: {
      [thread.worktreeId]: [...entries]
    }
  }
}

function entry(overrides: Partial<GitStatusEntry> & { path: string }): GitStatusEntry {
  const { path, ...rest } = overrides
  return {
    path,
    status: 'modified',
    area: 'unstaged',
    added: 0,
    removed: 0,
    ...rest
  }
}

describe('orca agent diff selectors', () => {
  beforeEach(() => {
    resetAgentWorkspaceDiffBaselinesForTest()
  })

  it('maps modified, added, deleted, and renamed git status entries', () => {
    expect(selectAgentWorkspaceDiffs(sourceState([]), [thread])).toEqual([])

    const diffs = selectAgentWorkspaceDiffs(
      sourceState([
        entry({
          path: 'src/modified.ts',
          status: 'modified',
          area: 'unstaged',
          added: 4,
          removed: 2
        }),
        entry({
          path: 'src/added.ts',
          status: 'added',
          area: 'staged',
          added: 8,
          removed: 0
        }),
        entry({
          path: 'src/deleted.ts',
          status: 'deleted',
          area: 'unstaged',
          added: 0,
          removed: 12
        }),
        entry({
          path: 'src/new-name.ts',
          oldPath: 'src/old-name.ts',
          status: 'renamed',
          area: 'staged',
          added: 1,
          removed: 1
        })
      ]),
      [thread]
    )

    expect(diffs.map((diff) => [diff.filePath, diff.status, diff.area])).toEqual([
      ['src/added.ts', 'added', 'staged'],
      ['src/deleted.ts', 'deleted', 'unstaged'],
      ['src/modified.ts', 'modified', 'unstaged'],
      ['src/new-name.ts', 'renamed', 'staged']
    ])
    expect(diffs[2]).toMatchObject({
      additions: 4,
      deletions: 2
    })
    expect(diffs[3]).toMatchObject({
      oldPath: 'src/old-name.ts',
      additions: 1,
      deletions: 1
    })
  })

  it('maps untracked and copied files into added summaries', () => {
    expect(mapGitStatusToAgentWorkspaceDiffStatus('untracked')).toBe('added')
    expect(mapGitStatusToAgentWorkspaceDiffStatus('copied')).toBe('added')
  })

  it('returns no diff summaries when source control has no entries for the thread worktree', () => {
    expect(selectAgentWorkspaceDiffs(sourceState([]), [thread])).toEqual([])
    expect(selectAgentWorkspaceDiffs({ gitStatusByWorktree: {} }, [thread])).toEqual([])
  })

  it('does not attribute pre-existing worktree changes to newly observed threads', () => {
    const siblingThread = {
      ...thread,
      id: 'thread-2',
      title: 'Second agent in same worktree'
    } satisfies AgentWorkspaceThread

    expect(
      selectAgentWorkspaceDiffs(sourceState([entry({ path: 'src/app.ts' })]), [thread])
    ).toEqual([])

    expect(
      selectAgentWorkspaceDiffs(sourceState([entry({ path: 'src/app.ts' })]), [
        thread,
        siblingThread
      ])
    ).toEqual([])

    expect(
      selectAgentWorkspaceDiffs(
        sourceState([entry({ path: 'src/app.ts' }), entry({ path: 'src/new-thread-file.ts' })]),
        [thread, siblingThread]
      ).map((diff) => [diff.threadId, diff.filePath])
    ).toEqual([
      ['thread-1', 'src/new-thread-file.ts'],
      ['thread-2', 'src/new-thread-file.ts']
    ])
  })
})
