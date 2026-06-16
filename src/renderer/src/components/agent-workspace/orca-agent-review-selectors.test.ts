import { describe, expect, it } from 'vitest'
import type { AppState } from '@/store'
import { getHostedReviewCacheKey } from '@/store/slices/hosted-review'
import { TEST_REPO, createTestStore, makeWorktree } from '@/store/slices/store-test-helpers'
import type { HostedReviewInfo } from '../../../../shared/hosted-review'
import type { Repo } from '../../../../shared/types'
import { selectAgentWorkspaceReviews } from './orca-agent-review-selectors'

const repo: Repo = { ...TEST_REPO, id: 'repo-orca', path: '/repo/orca', displayName: 'Orca' }

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState(overrides as Partial<AppState>)
  return store.getState()
}

const gitLabReview: HostedReviewInfo = {
  provider: 'gitlab',
  number: 7,
  title: 'Add review panel',
  state: 'open',
  url: 'https://gitlab.com/acme/orca/-/merge_requests/7',
  status: 'success',
  updatedAt: '2026-06-16T12:00:00.000Z',
  mergeable: 'MERGEABLE'
}

describe('selectAgentWorkspaceReviews', () => {
  it('maps cached hosted reviews by worktree branch without assuming GitHub', () => {
    const worktree = makeWorktree({
      id: 'worktree-1',
      repoId: repo.id,
      path: '/repo/orca/worktrees/review',
      branch: 'refs/heads/feature/review'
    })
    const cacheKey = getHostedReviewCacheKey(
      repo.path,
      'feature/review',
      undefined,
      repo.id,
      repo.connectionId,
      repo.executionHostId
    )

    expect(
      selectAgentWorkspaceReviews(
        getState({
          repos: [repo],
          worktreesByRepo: { [repo.id]: [worktree] },
          hostedReviewCache: {
            [cacheKey]: { data: gitLabReview, fetchedAt: 1 }
          }
        })
      )
    ).toEqual([
      {
        id: 'worktree-1:gitlab:7',
        worktreeId: 'worktree-1',
        provider: 'gitlab',
        providerLabel: 'GitLab',
        number: 7,
        title: 'Add review panel',
        state: 'open',
        url: 'https://gitlab.com/acme/orca/-/merge_requests/7',
        status: 'success',
        updatedAt: '2026-06-16T12:00:00.000Z'
      }
    ])
  })
})
