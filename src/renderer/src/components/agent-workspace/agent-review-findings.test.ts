import { describe, expect, it } from 'vitest'
import type { AgentWorkspaceThread, AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import {
  parseAgentReviewFindingsFromText,
  selectAgentReviewFindingsFromTimeline
} from './agent-review-findings'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Review current changes',
  agentKind: 'codex',
  phase: 'completed',
  updatedAt: '2026-06-21T12:00:00.000Z',
  branchName: 'feature/review-only',
  cwd: '/Users/jakedom/janus-code'
}

function agentEntry(
  overrides: Partial<AgentWorkspaceTimelineEntry> = {}
): AgentWorkspaceTimelineEntry {
  return {
    id: 'agent-1',
    threadId: thread.id,
    kind: 'agent',
    text: [
      'Here are the review notes.',
      '```janus-review-findings',
      '[',
      '  {',
      '    "severity": "medium",',
      '    "filePath": "src/app.tsx",',
      '    "lineNumber": 42,',
      '    "title": "Cleanup is skipped",',
      '    "rationale": "The effect starts a subscription but never returns a cleanup."',
      '  },',
      '  {',
      '    "severity": "high",',
      '    "filePath": "src/db.ts",',
      '    "title": "Query can accept raw input",',
      '    "rationale": "The query path interpolates user input before validation."',
      '  }',
      ']',
      '```'
    ].join('\n'),
    createdAt: '2026-06-21T12:01:00.000Z',
    status: 'done',
    ...overrides
  }
}

describe('agent review findings', () => {
  it('parses a fenced review-findings block into normalized notes', () => {
    const findings = parseAgentReviewFindingsFromText(agentEntry().text, {
      entryId: 'agent-1',
      threadId: thread.id
    })

    expect(findings).toEqual([
      {
        id: 'agent-1:review-finding:0',
        threadId: 'thread-1',
        severity: 'medium',
        filePath: 'src/app.tsx',
        lineNumber: 42,
        title: 'Cleanup is skipped',
        rationale: 'The effect starts a subscription but never returns a cleanup.'
      },
      {
        id: 'agent-1:review-finding:1',
        threadId: 'thread-1',
        severity: 'high',
        filePath: 'src/db.ts',
        lineNumber: null,
        title: 'Query can accept raw input',
        rationale: 'The query path interpolates user input before validation.'
      }
    ])
  })

  it('selects only active-thread agent findings and orders them by severity', () => {
    const findings = selectAgentReviewFindingsFromTimeline({
      thread,
      timeline: [
        agentEntry({ id: 'agent-1' }),
        agentEntry({ id: 'agent-other-thread', threadId: 'thread-2' }),
        agentEntry({ id: 'user-entry', kind: 'user' }),
        agentEntry({
          id: 'agent-generic-text',
          text: 'Looks good to me. No structured notes.'
        })
      ]
    })

    expect(findings.map((finding) => `${finding.severity}:${finding.filePath}`)).toEqual([
      'high:src/db.ts',
      'medium:src/app.tsx'
    ])
  })
})
