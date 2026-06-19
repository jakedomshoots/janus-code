import type {
  CreateHostedReviewInput,
  HostedReviewCreationEligibility,
  HostedReviewCreationEligibilityArgs,
  HostedReviewProvider
} from '../../../../shared/hosted-review'
import { normalizeHostedReviewBaseRef } from '../../../../shared/hosted-review-refs'
import type { RefreshHostedReviewCardArgs } from '@/store/slices/hosted-review'

type GitHubPRFallbackSource = 'explicit' | 'pr-cache' | 'hosted-review'

export function resolveChecksPanelHostedReviewBaseRef(input: {
  worktreeBaseRef?: string | null
  repoBaseRef?: string | null
}): string | null {
  const worktreeBaseRef = normalizeChecksPanelHostedReviewBaseRef(input.worktreeBaseRef)
  return worktreeBaseRef || normalizeChecksPanelHostedReviewBaseRef(input.repoBaseRef)
}

function normalizeChecksPanelHostedReviewBaseRef(ref: string | null | undefined): string | null {
  const normalizedRef = ref ? normalizeHostedReviewBaseRef(ref) : ''
  return normalizedRef || null
}

export function shouldOpenChecksPanelCreateComposer(input: {
  activeReview: unknown | null
  isFolder: boolean
  branch: string
  hostedReviewCreation: HostedReviewCreationEligibility | null
}): boolean {
  return (
    !input.activeReview &&
    !input.isFolder &&
    Boolean(input.branch) &&
    (input.hostedReviewCreation?.canCreate === true ||
      input.hostedReviewCreation?.blockedReason === 'needs_push')
  )
}

export type ChecksPanelRefreshGitHubReviewOptions = {
  force: true
  repoId: string
  worktreeId?: string
  linkedPRNumber?: number | null
  fallbackPRNumber?: number | null
  fallbackPRSource?: GitHubPRFallbackSource | null
}

export function buildChecksPanelHostedReviewCreationEligibilityArgs(
  input: HostedReviewCreationEligibilityArgs
): HostedReviewCreationEligibilityArgs {
  return { ...input }
}

export function buildChecksPanelRefreshGitHubReviewOptions(input: {
  repoId: string
  worktreeId?: string | null
  linkedGitHubPR?: number | null
  fallbackGitHubPR?: number | null
  fallbackPRSource?: GitHubPRFallbackSource | null
}): ChecksPanelRefreshGitHubReviewOptions {
  return {
    force: true,
    repoId: input.repoId,
    worktreeId: input.worktreeId ?? undefined,
    linkedPRNumber: input.linkedGitHubPR ?? null,
    ...(input.fallbackGitHubPR !== undefined ? { fallbackPRNumber: input.fallbackGitHubPR } : {}),
    ...(input.fallbackPRSource !== undefined ? { fallbackPRSource: input.fallbackPRSource } : {})
  }
}

export function buildChecksPanelRefreshHostedReviewArgs(
  input: RefreshHostedReviewCardArgs
): RefreshHostedReviewCardArgs {
  return { ...input }
}

export function buildChecksPanelCreateHostedReviewInput(
  input: CreateHostedReviewInput & {
    repoId: string
    provider: Exclude<HostedReviewProvider, 'unsupported'>
  }
): CreateHostedReviewInput & { repoId: string } {
  return { ...input }
}

export function buildChecksPanelLinkedGitHubReviewRefreshContext(input: {
  repoPath: string
  repoId: string
  worktreeId?: string | null
  branch: string
  linkedPRNumber: number
  linkedGitLabMR?: number | null
  linkedBitbucketPR?: number | null
  linkedAzureDevOpsPR?: number | null
  linkedGiteaPR?: number | null
}): {
  fetchPRForBranch: {
    repoPath: string
    branch: string
    options: {
      force: true
      repoId: string
      worktreeId?: string
      linkedPRNumber: number
    }
  }
  hostedReview: RefreshHostedReviewCardArgs
  fetchPRChecks: {
    force: true
    repoId: string
  }
  fetchPRComments: {
    force: true
    repoId: string
  }
} {
  return {
    fetchPRForBranch: {
      repoPath: input.repoPath,
      branch: input.branch,
      options: {
        force: true,
        repoId: input.repoId,
        ...(input.worktreeId ? { worktreeId: input.worktreeId } : {}),
        linkedPRNumber: input.linkedPRNumber
      }
    },
    hostedReview: buildChecksPanelRefreshHostedReviewArgs({
      repoPath: input.repoPath,
      repoId: input.repoId,
      branch: input.branch,
      linkedGitHubPR: input.linkedPRNumber,
      linkedGitLabMR: input.linkedGitLabMR ?? null,
      linkedBitbucketPR: input.linkedBitbucketPR ?? null,
      linkedAzureDevOpsPR: input.linkedAzureDevOpsPR ?? null,
      linkedGiteaPR: input.linkedGiteaPR ?? null
    }),
    fetchPRChecks: {
      force: true,
      repoId: input.repoId
    },
    fetchPRComments: {
      force: true,
      repoId: input.repoId
    }
  }
}
