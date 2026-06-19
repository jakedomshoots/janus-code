import { describe, expect, it } from 'vitest'
import type { AgentWorkspaceDiffSummary } from './agent-workspace-types'
import {
  getAgentTimelineMarkdownArtifacts,
  summarizeAgentTimelineDiffs
} from './agent-timeline-artifacts'

describe('agent timeline artifacts', () => {
  it('extracts unique markdown paths from agent text', () => {
    expect(
      getAgentTimelineMarkdownArtifacts({
        text: 'Created docs/reference/janus-direct-download-release-handoff-2026-06-19.md and `notes.md`.',
        cwd: '/repo'
      })
    ).toEqual([
      {
        id: 'docs/reference/janus-direct-download-release-handoff-2026-06-19.md',
        fileName: 'janus-direct-download-release-handoff-2026-06-19.md',
        filePath: 'docs/reference/janus-direct-download-release-handoff-2026-06-19.md',
        absolutePath: '/repo/docs/reference/janus-direct-download-release-handoff-2026-06-19.md'
      },
      {
        id: 'notes.md',
        fileName: 'notes.md',
        filePath: 'notes.md',
        absolutePath: '/repo/notes.md'
      }
    ])
  })

  it('summarizes changed files with totals and visible rows', () => {
    const summary = summarizeAgentTimelineDiffs([
      diff({ id: '1', filePath: 'a.md', additions: 4, deletions: 1 }),
      diff({ id: '2', filePath: 'b.ts', additions: 9, deletions: 0, status: 'added' }),
      diff({ id: '3', filePath: 'c.ts', additions: 1, deletions: 2 }),
      diff({ id: '4', filePath: 'd.ts', additions: 7, deletions: 3 })
    ])

    expect(summary).toMatchObject({
      fileCount: 4,
      totalAdditions: 21,
      totalDeletions: 6,
      hiddenCount: 1
    })
    expect(summary.visibleDiffs.map((item) => item.filePath)).toEqual(['a.md', 'b.ts', 'c.ts'])
  })
})

function diff(overrides: Partial<AgentWorkspaceDiffSummary>): AgentWorkspaceDiffSummary {
  return {
    id: 'diff',
    threadId: 'thread-1',
    filePath: 'file.ts',
    additions: 0,
    deletions: 0,
    status: 'modified',
    ...overrides
  }
}
