import { describe, expect, it } from 'vitest'
import {
  getDefaultAgentWorkspaceRightPanelState,
  getDefaultAgentWorkspaceRightPanelTab,
  type AgentWorkspaceRightPanelStateInput
} from './agent-workspace-right-panel-state'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceThread } from './agent-workspace-types'

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement right panel state',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/t3code-gui-workspace',
  cwd: '/Users/jakedom/orca'
}

const modifiedDiff: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx',
  additions: 18,
  deletions: 3,
  status: 'modified'
}

function resolveDefaultTab(input: Partial<AgentWorkspaceRightPanelStateInput>): string {
  return getDefaultAgentWorkspaceRightPanelTab(makeStateInput(input))
}

function makeStateInput(
  input: Partial<AgentWorkspaceRightPanelStateInput>
): AgentWorkspaceRightPanelStateInput {
  return {
    thread: runningThread,
    diffs: [],
    review: null,
    hasStructuredPlan: false,
    ...input
  }
}

describe('agent workspace right panel state', () => {
  it('opens details first when a thread needs approval', () => {
    expect(
      resolveDefaultTab({
        thread: {
          ...runningThread,
          phase: 'needs-approval'
        },
        diffs: [modifiedDiff],
        hasStructuredPlan: true
      })
    ).toBe('details')
  })

  it('opens diff first when the selected thread has diffs', () => {
    expect(resolveDefaultTab({ diffs: [modifiedDiff], hasStructuredPlan: true })).toBe('diff')
  })

  it('opens review first when a thread has review context but no diffs', () => {
    expect(
      resolveDefaultTab({
        review: {
          id: 'review-1',
          worktreeId: runningThread.worktreeId,
          provider: 'gitlab',
          providerLabel: 'GitLab',
          number: 7,
          title: 'Ship source control parity',
          state: 'open',
          url: 'https://gitlab.com/acme/orca/-/merge_requests/7',
          status: 'success',
          updatedAt: '2026-06-16T12:00:00.000Z'
        }
      })
    ).toBe('review')
  })

  it('opens plan first for a running thread with structured plan state', () => {
    expect(resolveDefaultTab({ hasStructuredPlan: true })).toBe('plan')
  })

  it('falls back to a collapsed terminal tab when no richer panel has data', () => {
    expect(getDefaultAgentWorkspaceRightPanelState(makeStateInput({}))).toEqual({
      selectedTab: 'terminal',
      collapsed: true
    })
    expect(getDefaultAgentWorkspaceRightPanelState(makeStateInput({ thread: null }))).toEqual({
      selectedTab: 'terminal',
      collapsed: true
    })
  })
})
