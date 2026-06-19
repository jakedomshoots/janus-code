import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CHECKS_PANEL_SOURCE = readFileSync(join(__dirname, 'ChecksPanel.tsx'), 'utf8')

function sourceBetween(source: string, startPattern: string, endPattern: string): string {
  const start = source.indexOf(startPattern)
  expect(start).toBeGreaterThanOrEqual(0)
  const end = source.indexOf(endPattern, start + startPattern.length)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('ChecksPanel context builders', () => {
  it('routes creation eligibility through the shared request builder', () => {
    const eligibilitySection = sourceBetween(
      CHECKS_PANEL_SOURCE,
      'void getHostedReviewCreationEligibility(',
      '.then((result) => {'
    )

    expect(eligibilitySection).toContain('buildChecksPanelHostedReviewCreationEligibilityArgs')
    expect(eligibilitySection).toContain('repoId: repo.id')
    expect(eligibilitySection).toContain('worktreePath: activeWorktreePath')
  })

  it('routes manual refresh through the shared GitHub and hosted-review builders', () => {
    const refreshSection = sourceBetween(
      CHECKS_PANEL_SOURCE,
      'const handleRefresh = useCallback(async () => {',
      'const handleEntryRefresh = useCallback'
    )

    expect(refreshSection).toContain('buildChecksPanelRefreshGitHubReviewOptions')
    expect(refreshSection).toContain('worktreeId: activeWorktreeId')
    expect(refreshSection).toContain('buildChecksPanelRefreshHostedReviewArgs')
  })

  it('routes create review submission through the shared create input builder', () => {
    const createSection = sourceBetween(
      CHECKS_PANEL_SOURCE,
      'const handleCreatePullRequest = useCallback(async (): Promise<void> => {',
      'if (result.ok) {'
    )

    expect(createSection).toContain('buildChecksPanelCreateHostedReviewInput')
    expect(createSection).toContain('repoId: repo.id')
    expect(createSection).toContain('worktreePath')
  })
})
