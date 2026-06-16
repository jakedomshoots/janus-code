import type { AppState } from '@/store'
import { branchName } from '@/lib/git-utils'
import { getHostedReviewCacheKey } from '@/store/slices/hosted-review-cache-identity'
import type { HostedReviewInfo, HostedReviewProvider } from '../../../../shared/hosted-review'
import type { Repo, Worktree } from '../../../../shared/types'
import type { AgentWorkspaceReviewSummary } from './agent-workspace-types'

function getRepoForWorktree(state: AppState, worktree: Worktree): Repo | undefined {
  return state.repos.find((repo) => repo.id === worktree.repoId)
}

function getProviderLabel(provider: HostedReviewProvider): string {
  switch (provider) {
    case 'github':
      return 'GitHub'
    case 'gitlab':
      return 'GitLab'
    case 'bitbucket':
      return 'Bitbucket'
    case 'azure-devops':
      return 'Azure DevOps'
    case 'gitea':
      return 'Gitea'
    case 'unsupported':
      return 'Hosted review'
  }
}

function toReviewSummary(
  worktree: Worktree,
  review: HostedReviewInfo
): AgentWorkspaceReviewSummary {
  return {
    id: `${worktree.id}:${review.provider}:${review.number}`,
    worktreeId: worktree.id,
    provider: review.provider,
    providerLabel: getProviderLabel(review.provider),
    number: review.number,
    title: review.title,
    state: review.state,
    url: review.url,
    status: review.status,
    updatedAt: review.updatedAt
  }
}

export function selectAgentWorkspaceReviews(
  state: AppState
): readonly AgentWorkspaceReviewSummary[] {
  const reviews: AgentWorkspaceReviewSummary[] = []
  for (const worktrees of Object.values(state.worktreesByRepo)) {
    for (const worktree of worktrees) {
      if (worktree.isArchived) {
        continue
      }
      const repo = getRepoForWorktree(state, worktree)
      const branch = branchName(worktree.branch)
      if (!repo || !branch) {
        continue
      }
      const cacheKey = getHostedReviewCacheKey(
        repo.path,
        branch,
        state.settings,
        repo.id,
        repo.connectionId,
        repo.executionHostId
      )
      const review = state.hostedReviewCache[cacheKey]?.data ?? null
      if (review) {
        reviews.push(toReviewSummary(worktree, review))
      }
    }
  }
  return reviews
}
