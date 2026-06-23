import { useMemo, useState, type ReactNode } from 'react'
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  FileText,
  ListChecks,
  MessageSquareText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceTimelineEntry,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'

export function PanelSummary({
  thread,
  plan,
  diffs,
  sources,
  subagents
}: {
  thread: AgentWorkspaceThread | null
  plan: AgentWorkspacePlan | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  sources: number
  subagents: number
}): React.JSX.Element {
  const completeSteps = plan?.steps.filter((step) => step.status === 'completed').length ?? 0
  const totalSteps = plan?.steps.length ?? 0
  const summaryItems = [
    totalSteps > 0
      ? translate(
          'auto.components.agentWorkspace.rightPanel.stepProgress',
          '{{complete}}/{{total}} steps',
          {
            complete: completeSteps,
            total: totalSteps
          }
        )
      : translate('auto.components.agentWorkspace.rightPanel.noPlan', 'No plan'),
    translate('auto.components.agentWorkspace.rightPanel.changeCount', '{{count}} changes', {
      count: diffs.length
    }),
    translate('auto.components.agentWorkspace.rightPanel.agentCount', '{{count}} agents', {
      count: subagents
    }),
    translate('auto.components.agentWorkspace.rightPanel.sourceCount', '{{count}} sources', {
      count: sources
    })
  ]

  return (
    <section className="mb-4 rounded-xl border border-border bg-background/65 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <Bot className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {thread?.title ?? 'Janus Code'}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {thread
              ? `${formatAgentTypeLabel(thread.agentKind)} · ${formatAgentWorkspacePhase(thread.phase)}`
              : translate(
                  'auto.components.agentWorkspace.rightPanel.readyForNewSession',
                  'Ready for a new session'
                )}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {summaryItems.map((item) => (
          <div
            key={item}
            className="truncate rounded-lg border border-border/70 bg-card/70 px-2 py-1 text-[11px] text-muted-foreground"
            title={item}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

export function PlanProgress({
  plan
}: {
  plan: AgentWorkspacePlan | null
}): React.JSX.Element | null {
  if (!plan || plan.steps.length === 0) {
    return null
  }

  const completeSteps = plan.steps.filter((step) => step.status === 'completed').length
  const activeStep = plan.steps.find((step) => step.status === 'in-progress') ?? null

  return (
    <section className="mb-4 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ListChecks className="size-3.5" aria-hidden="true" />
        {translate('auto.components.agentWorkspace.rightPanel.planProgress', 'Plan progress')}
        <span className="ml-auto text-foreground">
          {completeSteps}/{plan.steps.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.round((completeSteps / plan.steps.length) * 100)}%` }}
        />
      </div>
      {activeStep ? (
        <div className="mt-2 truncate text-xs text-muted-foreground" title={activeStep.title}>
          {translate('auto.components.agentWorkspace.rightPanel.nowStep', 'Now: {{title}}', {
            title: activeStep.title
          })}
        </div>
      ) : null}
    </section>
  )
}

export function ReviewModePanel({
  thread,
  diffs,
  review,
  timeline
}: {
  thread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
}): React.JSX.Element {
  const orderedDiffs = useMemo(() => orderReviewDiffs(diffs), [diffs])
  const [viewedDiffIds, setViewedDiffIds] = useState<ReadonlySet<string>>(() => new Set())
  const testEvidence = getTestEvidence(timeline)
  const stale = isReviewPossiblyStale(thread, review)

  function toggleViewed(diffId: string): void {
    setViewedDiffIds((current) => {
      const next = new Set(current)
      if (next.has(diffId)) {
        next.delete(diffId)
      } else {
        next.add(diffId)
      }
      return next
    })
  }

  return (
    <section
      className="space-y-4"
      aria-label={translate('auto.components.agentWorkspace.review.reviewMode', 'Review mode')}
    >
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <div className="flex min-w-0 items-start gap-2">
          <ListChecks className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-foreground">
              {translate('auto.components.agentWorkspace.review.reviewMode', 'Review mode')}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {translate(
                'auto.components.agentWorkspace.review.reviewModeDetail',
                'Walk the candidate by changed files, test evidence, comments, and stale-review status.'
              )}
            </p>
          </div>
        </div>
        {stale ? (
          <p className="mt-3 rounded-lg border border-[color:var(--git-decoration-modified)]/40 bg-muted/40 p-2 text-xs text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.review.reviewMayBeStale',
              'Review may be stale because the agent updated after the linked review.'
            )}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.review.recommendedFileOrder',
              'Recommended file order'
            )}
          </h3>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {viewedDiffIds.size}/{orderedDiffs.length}
          </span>
        </div>
        {orderedDiffs.length > 0 ? (
          <div className="space-y-1">
            {orderedDiffs.map((diff) => {
              const viewed = viewedDiffIds.has(diff.id)
              return (
                <button
                  key={diff.id}
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-2 text-left transition-colors hover:bg-accent/60"
                  aria-pressed={viewed}
                  onClick={() => toggleViewed(diff.id)}
                >
                  <FileText
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {diff.filePath}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      +{diff.additions} -{diff.deletions}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {viewed
                      ? translate('auto.components.agentWorkspace.review.viewed', 'Viewed')
                      : translate(
                          'auto.components.agentWorkspace.review.markViewed',
                          'Mark viewed'
                        )}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-background/60 p-3 text-sm text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.review.noChangedFiles',
              'No changed files are available for this candidate yet.'
            )}
          </p>
        )}
      </div>

      <ReviewInfoBlock
        icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
        title={translate('auto.components.agentWorkspace.review.testEvidence', 'Test evidence')}
        detail={testEvidence}
      />
      <ReviewInfoBlock
        icon={<MessageSquareText className="size-4" aria-hidden="true" />}
        title={translate('auto.components.agentWorkspace.review.inlineComments', 'Inline comments')}
        detail={
          review
            ? translate(
                'auto.components.agentWorkspace.review.commentsInHostedReview',
                'Use the linked {{provider}} review for durable inline comments.',
                { provider: review.providerLabel }
              )
            : translate(
                'auto.components.agentWorkspace.review.commentsAfterReviewLinked',
                'Inline comments appear after a hosted review is linked.'
              )
        }
      />
      {review ? (
        <Button type="button" variant="outline" size="sm" className="w-full" asChild>
          <a href={review.url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" aria-hidden="true" />
            {translate(
              'auto.components.agentWorkspace.review.openHostedReview',
              'Open hosted review'
            )}
          </a>
        </Button>
      ) : null}
    </section>
  )
}

function ReviewInfoBlock({
  icon,
  title,
  detail
}: {
  icon: ReactNode
  title: string
  detail: string
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function orderReviewDiffs(
  diffs: readonly AgentWorkspaceDiffSummary[]
): readonly AgentWorkspaceDiffSummary[] {
  return [...diffs].sort((a, b) => {
    const statusDiff = getReviewStatusWeight(a.status) - getReviewStatusWeight(b.status)
    if (statusDiff !== 0) {
      return statusDiff
    }
    return b.additions + b.deletions - (a.additions + a.deletions)
  })
}

function getReviewStatusWeight(status: AgentWorkspaceDiffSummary['status']): number {
  switch (status) {
    case 'deleted':
      return 0
    case 'renamed':
      return 1
    case 'added':
      return 2
    case 'modified':
      return 3
    case 'unknown':
      return 4
  }
}

function getTestEvidence(timeline: readonly AgentWorkspaceTimelineEntry[]): string {
  const testEntry = [...timeline]
    .reverse()
    .find(
      (entry) =>
        entry.kind === 'tool' && /\b(test|vitest|playwright|typecheck|lint)\b/i.test(entry.text)
    )
  if (!testEntry) {
    return translate(
      'auto.components.agentWorkspace.review.noTestEvidence',
      'No test command has been captured in this timeline yet.'
    )
  }
  if (testEntry.status === 'running') {
    return translate(
      'auto.components.agentWorkspace.review.testRunning',
      'Test command is still running: {{command}}',
      { command: testEntry.text }
    )
  }
  if (testEntry.status === 'failed') {
    return translate(
      'auto.components.agentWorkspace.review.testFailed',
      'Latest captured test evidence failed: {{command}}',
      { command: testEntry.text }
    )
  }
  return translate(
    'auto.components.agentWorkspace.review.testCaptured',
    'Latest captured test evidence: {{command}}',
    { command: testEntry.text }
  )
}

function isReviewPossiblyStale(
  thread: AgentWorkspaceThread | null,
  review: AgentWorkspaceReviewSummary | null
): boolean {
  if (!thread?.updatedAt || !review?.updatedAt) {
    return false
  }
  return Date.parse(thread.updatedAt) > Date.parse(review.updatedAt)
}
