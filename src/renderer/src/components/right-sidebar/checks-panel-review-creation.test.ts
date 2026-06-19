import { describe, expect, it } from 'vitest'
import {
  buildChecksPanelCreateHostedReviewInput,
  buildChecksPanelHostedReviewCreationEligibilityArgs,
  buildChecksPanelLinkedGitHubReviewRefreshContext,
  buildChecksPanelRefreshGitHubReviewOptions,
  buildChecksPanelRefreshHostedReviewArgs,
  resolveChecksPanelHostedReviewBaseRef,
  shouldOpenChecksPanelCreateComposer
} from './checks-panel-review-creation'

describe('resolveChecksPanelHostedReviewBaseRef', () => {
  it('prefers the worktree base ref over the repo default', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: ' release/1.4 ',
        repoBaseRef: 'main'
      })
    ).toBe('release/1.4')
  })

  it('falls back to the repo base ref when the worktree has no override', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: null,
        repoBaseRef: ' main '
      })
    ).toBe('main')
  })

  it('returns null when both inputs are null', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: null,
        repoBaseRef: null
      })
    ).toBe(null)
  })

  it('returns null when worktree base ref is whitespace-only', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: '   ',
        repoBaseRef: null
      })
    ).toBe(null)
  })

  it('strips origin prefix from the worktree base ref', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: 'origin/main',
        repoBaseRef: 'develop'
      })
    ).toBe('main')
  })

  it('strips upstream prefix from the repo base ref', () => {
    expect(
      resolveChecksPanelHostedReviewBaseRef({
        worktreeBaseRef: null,
        repoBaseRef: 'upstream/develop'
      })
    ).toBe('develop')
  })
})

describe('shouldOpenChecksPanelCreateComposer', () => {
  it('opens for GitLab MR creation eligibility', () => {
    expect(
      shouldOpenChecksPanelCreateComposer({
        activeReview: null,
        isFolder: false,
        branch: 'feature/gitlab-mr',
        hostedReviewCreation: {
          provider: 'gitlab',
          review: null,
          canCreate: true,
          blockedReason: null,
          nextAction: null
        }
      })
    ).toBe(true)
  })

  it('opens for push-before-create recovery', () => {
    expect(
      shouldOpenChecksPanelCreateComposer({
        activeReview: null,
        isFolder: false,
        branch: 'feature/gitlab-mr',
        hostedReviewCreation: {
          provider: 'gitlab',
          review: null,
          canCreate: false,
          blockedReason: 'needs_push',
          nextAction: 'push'
        }
      })
    ).toBe(true)
  })

  it('does not open when an active review exists', () => {
    expect(
      shouldOpenChecksPanelCreateComposer({
        activeReview: { provider: 'github', number: 123 },
        isFolder: false,
        branch: 'feature/test',
        hostedReviewCreation: {
          provider: 'github',
          review: null,
          canCreate: true,
          blockedReason: null,
          nextAction: null
        }
      })
    ).toBe(false)
  })

  it('does not open for folder repos', () => {
    expect(
      shouldOpenChecksPanelCreateComposer({
        activeReview: null,
        isFolder: true,
        branch: 'feature/test',
        hostedReviewCreation: {
          provider: 'github',
          review: null,
          canCreate: true,
          blockedReason: null,
          nextAction: null
        }
      })
    ).toBe(false)
  })

  it('does not open when branch is empty', () => {
    expect(
      shouldOpenChecksPanelCreateComposer({
        activeReview: null,
        isFolder: false,
        branch: '',
        hostedReviewCreation: {
          provider: 'github',
          review: null,
          canCreate: true,
          blockedReason: null,
          nextAction: null
        }
      })
    ).toBe(false)
  })
})

describe('Checks panel hosted review request builders', () => {
  it('preserves active worktree context for creation eligibility', () => {
    expect(
      buildChecksPanelHostedReviewCreationEligibilityArgs({
        repoPath: '/ssh/repo',
        repoId: 'repo-ssh',
        worktreePath: '/home/jake/repo',
        branch: 'feature/checks',
        base: 'origin/main',
        hasUncommittedChanges: false,
        hasUpstream: true,
        ahead: 2,
        behind: 0,
        linkedGitHubPR: 12,
        fallbackGitHubPR: null,
        linkedGitLabMR: null,
        linkedBitbucketPR: null,
        linkedAzureDevOpsPR: null,
        linkedGiteaPR: null
      })
    ).toEqual({
      repoPath: '/ssh/repo',
      repoId: 'repo-ssh',
      worktreePath: '/home/jake/repo',
      branch: 'feature/checks',
      base: 'origin/main',
      hasUncommittedChanges: false,
      hasUpstream: true,
      ahead: 2,
      behind: 0,
      linkedGitHubPR: 12,
      fallbackGitHubPR: null,
      linkedGitLabMR: null,
      linkedBitbucketPR: null,
      linkedAzureDevOpsPR: null,
      linkedGiteaPR: null
    })
  })

  it('preserves worktree identity and linked review hints for refreshes', () => {
    expect(
      buildChecksPanelRefreshGitHubReviewOptions({
        repoId: 'repo-ssh',
        worktreeId: 'wt-ssh',
        linkedGitHubPR: null,
        fallbackGitHubPR: 34
      })
    ).toEqual({
      force: true,
      repoId: 'repo-ssh',
      worktreeId: 'wt-ssh',
      linkedPRNumber: null,
      fallbackPRNumber: 34
    })

    expect(
      buildChecksPanelRefreshHostedReviewArgs({
        repoPath: '/ssh/repo',
        repoId: 'repo-ssh',
        branch: 'feature/checks',
        linkedGitHubPR: null,
        fallbackGitHubPR: 34,
        linkedGitLabMR: 22,
        linkedBitbucketPR: null,
        linkedAzureDevOpsPR: null,
        linkedGiteaPR: null
      })
    ).toEqual({
      repoPath: '/ssh/repo',
      repoId: 'repo-ssh',
      branch: 'feature/checks',
      linkedGitHubPR: null,
      fallbackGitHubPR: 34,
      linkedGitLabMR: 22,
      linkedBitbucketPR: null,
      linkedAzureDevOpsPR: null,
      linkedGiteaPR: null
    })
  })

  it('preserves selected worktree path when creating a hosted review', () => {
    expect(
      buildChecksPanelCreateHostedReviewInput({
        repoId: 'repo-ssh',
        provider: 'github',
        base: 'main',
        head: 'feature/checks',
        title: 'Fix checks',
        body: 'Details',
        draft: true,
        worktreePath: '/home/jake/repo',
        useTemplate: false
      })
    ).toEqual({
      repoId: 'repo-ssh',
      provider: 'github',
      base: 'main',
      head: 'feature/checks',
      title: 'Fix checks',
      body: 'Details',
      draft: true,
      worktreePath: '/home/jake/repo',
      useTemplate: false
    })
  })

  it('keeps linked GitHub PR refresh calls aligned to the selected worktree context', () => {
    expect(
      buildChecksPanelLinkedGitHubReviewRefreshContext({
        repoPath: '/ssh/repo',
        repoId: 'repo-ssh',
        worktreeId: 'wt-ssh',
        branch: 'feature/checks',
        linkedPRNumber: 77,
        linkedGitLabMR: 22,
        linkedBitbucketPR: null,
        linkedAzureDevOpsPR: null,
        linkedGiteaPR: null
      })
    ).toEqual({
      fetchPRForBranch: {
        repoPath: '/ssh/repo',
        branch: 'feature/checks',
        options: {
          force: true,
          repoId: 'repo-ssh',
          worktreeId: 'wt-ssh',
          linkedPRNumber: 77
        }
      },
      hostedReview: {
        repoPath: '/ssh/repo',
        repoId: 'repo-ssh',
        branch: 'feature/checks',
        linkedGitHubPR: 77,
        linkedGitLabMR: 22,
        linkedBitbucketPR: null,
        linkedAzureDevOpsPR: null,
        linkedGiteaPR: null
      },
      fetchPRChecks: {
        force: true,
        repoId: 'repo-ssh'
      },
      fetchPRComments: {
        force: true,
        repoId: 'repo-ssh'
      }
    })
  })
})
