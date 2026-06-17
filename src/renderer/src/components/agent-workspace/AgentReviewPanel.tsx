import { ExternalLink, GitPullRequestArrow } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceReviewSummary } from './agent-workspace-types'

function getReviewTitle(review: AgentWorkspaceReviewSummary): string {
  switch (review.provider) {
    case 'github':
      return translate('auto.components.agentWorkspace.review.githubPr', 'GitHub PR #{{number}}', {
        number: review.number
      })
    case 'gitlab':
      return translate('auto.components.agentWorkspace.review.gitlabMr', 'GitLab MR #{{number}}', {
        number: review.number
      })
    default:
      return translate(
        'auto.components.agentWorkspace.review.hostedReviewNumber',
        '{{provider}} review #{{number}}',
        {
          provider: review.providerLabel,
          number: review.number
        }
      )
  }
}

function formatReviewState(state: string): string {
  switch (state) {
    case 'open':
      return translate('auto.components.agentWorkspace.review.open', 'open')
    case 'draft':
      return translate('auto.components.agentWorkspace.review.draft', 'draft')
    case 'closed':
      return translate('auto.components.agentWorkspace.review.closed', 'closed')
    case 'merged':
      return translate('auto.components.agentWorkspace.review.merged', 'merged')
    default:
      return state
  }
}

function formatChecksStatus(status: string): string {
  switch (status) {
    case 'success':
      return translate('auto.components.agentWorkspace.review.checksPassing', 'checks passing')
    case 'failure':
      return translate('auto.components.agentWorkspace.review.checksFailing', 'checks failing')
    case 'pending':
      return translate('auto.components.agentWorkspace.review.checksPending', 'checks pending')
    case 'neutral':
      return translate('auto.components.agentWorkspace.review.checksNeutral', 'checks neutral')
    default:
      return status
  }
}

export function AgentReviewPanel({
  review
}: {
  review: AgentWorkspaceReviewSummary | null
}): React.JSX.Element {
  if (!review) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GitPullRequestArrow className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.review.review', 'Review')}
        </div>
        <p className="mt-2 text-sm font-medium">
          {translate(
            'auto.components.agentWorkspace.review.noHostedReviewLinked',
            'No hosted review linked yet.'
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.review.hostedReviewWillAppear',
            'Hosted review status will appear here after Janus Code detects a branch review.'
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <GitPullRequestArrow className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{getReviewTitle(review)}</span>
          </div>
          <p className="mt-1 truncate text-sm text-foreground">{review.title}</p>
        </div>
        <Button type="button" size="icon-xs" variant="outline" asChild>
          <a
            href={review.url}
            target="_blank"
            rel="noreferrer"
            aria-label={translate(
              'auto.components.agentWorkspace.review.openReview',
              'Open review'
            )}
          >
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="outline">{review.providerLabel}</Badge>
        <Badge variant="outline">{formatReviewState(review.state)}</Badge>
        <Badge variant="outline">{formatChecksStatus(review.status)}</Badge>
      </div>
    </div>
  )
}
