import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AgentWorkspaceReviewSummary } from './agent-workspace-types'
import { AgentReviewPanel } from './AgentReviewPanel'

const gitHubReview: AgentWorkspaceReviewSummary = {
  id: 'github-review',
  worktreeId: 'worktree-1',
  provider: 'github',
  providerLabel: 'GitHub',
  number: 42,
  title: 'Add GUI review panel',
  state: 'open',
  url: 'https://github.com/acme/orca/pull/42',
  status: 'pending',
  updatedAt: '2026-06-16T12:00:00.000Z'
}

const gitLabReview: AgentWorkspaceReviewSummary = {
  ...gitHubReview,
  id: 'gitlab-review',
  provider: 'gitlab',
  providerLabel: 'GitLab',
  number: 7,
  title: 'Add GUI review panel for GitLab',
  url: 'https://gitlab.com/acme/orca/-/merge_requests/7',
  status: 'success'
}

describe('AgentReviewPanel', () => {
  it('uses GitHub pull request labels only for GitHub reviews', () => {
    const markup = renderToStaticMarkup(<AgentReviewPanel review={gitHubReview} />)

    expect(markup).toContain('GitHub PR #42')
    expect(markup).toContain('Add GUI review panel')
  })

  it('uses GitLab merge request labels only for GitLab reviews', () => {
    const markup = renderToStaticMarkup(<AgentReviewPanel review={gitLabReview} />)

    expect(markup).toContain('GitLab MR #7')
    expect(markup).not.toContain('Pull Request')
  })

  it('renders a provider-neutral empty state', () => {
    const markup = renderToStaticMarkup(<AgentReviewPanel review={null} />)

    expect(markup).toContain('No hosted review linked yet.')
    expect(markup).not.toContain('GitHub')
    expect(markup).not.toContain('GitLab')
  })
})
