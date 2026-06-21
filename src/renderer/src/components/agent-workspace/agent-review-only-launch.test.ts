import { describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceReviewSummary
} from './agent-workspace-types'
import {
  buildAgentReviewOnlyPrompt,
  getAgentReviewOnlyLaunchProfile,
  launchAgentReviewOnly
} from './agent-review-only-launch'

const launchMocks = vi.hoisted(() => ({
  launchAgentInNewTab: vi.fn((_args: unknown) => ({
    tabId: 'tab-review',
    startupPlan: {
      agent: 'codex',
      launchCommand: 'codex',
      expectedProcess: 'codex',
      followupPrompt: null
    },
    pasteDraftAfterLaunch: true
  }))
}))

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: launchMocks.launchAgentInNewTab
}))

const diffSummary: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  area: 'unstaged',
  filePath: 'src/renderer/src/App.tsx',
  additions: 24,
  deletions: 6,
  status: 'modified'
}

const reviewSummary: AgentWorkspaceReviewSummary = {
  id: 'review-1',
  worktreeId: 'worktree-1',
  provider: 'gitlab',
  providerLabel: 'GitLab',
  number: 42,
  title: 'Tighten workspace context',
  state: 'open',
  url: 'https://gitlab.example.com/janus/merge_requests/42',
  status: 'pending',
  updatedAt: '2026-06-16T12:00:00.000Z'
}

describe('agent review-only launch', () => {
  it('builds a review-only prompt with diff and hosted review context', () => {
    const prompt = buildAgentReviewOnlyPrompt({
      diffs: [diffSummary],
      review: reviewSummary
    })

    expect(prompt).toContain('Review only')
    expect(prompt).toContain('Do not edit files')
    expect(prompt).toContain('prioritized findings')
    expect(prompt).toContain('janus-review-findings')
    expect(prompt).toContain('"severity"')
    expect(prompt).toContain('GitLab #42')
    expect(prompt).toContain('Tighten workspace context')
    expect(prompt).toContain('src/renderer/src/App.tsx')
    expect(prompt).toContain('+24 -6')
  })

  it('uses Codex read-only sandbox args instead of dangerous defaults', () => {
    const profile = getAgentReviewOnlyLaunchProfile({
      agent: 'codex',
      settings: {
        agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
      }
    })

    expect(profile.enforcement).toBe('hard')
    expect(profile.warning).toBeNull()
    expect(profile.agentArgs).toBe('--sandbox read-only')
  })

  it('launches review-only sessions through the generated prompt path', () => {
    launchAgentReviewOnly({
      agent: 'codex',
      worktreeId: 'worktree-1',
      groupId: 'group-1',
      diffs: [diffSummary],
      review: reviewSummary,
      settings: {
        agentDefaultArgs: { codex: '--dangerously-bypass-approvals-and-sandbox' }
      }
    })

    expect(launchMocks.launchAgentInNewTab).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: 'codex',
        worktreeId: 'worktree-1',
        groupId: 'group-1',
        promptDelivery: 'submit-after-ready',
        launchSource: 'diff_notes_send',
        agentArgs: '--sandbox read-only',
        promptContextManifest: {
          items: [
            {
              id: 'changes-context',
              kind: 'changes',
              fileCount: 1,
              additions: 24,
              deletions: 6,
              stale: false
            },
            {
              id: 'review-context',
              kind: 'review',
              providerLabel: 'GitLab',
              number: 42,
              title: 'Tighten workspace context',
              stale: false
            }
          ]
        }
      })
    )
    const launchArgs = launchMocks.launchAgentInNewTab.mock.calls[0]?.[0] as
      | { prompt?: string }
      | undefined
    expect(launchArgs?.prompt).toContain('Review only')
  })
})
