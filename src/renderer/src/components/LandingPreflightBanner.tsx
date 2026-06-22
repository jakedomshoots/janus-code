import { AlertTriangle, ExternalLink } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import type { PreflightIssue } from './landing-preflight'

export function PreflightBanner({ issues }: { issues: PreflightIssue[] }): React.JSX.Element {
  const requiredIssues = issues.filter((issue) => issue.required)
  const optionalIssues = issues.filter((issue) => !issue.required)

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-yellow-500">
        <AlertTriangle className="size-4 shrink-0" />
        <span className="text-sm font-medium">
          {translate('auto.components.Landing.ce44fad849', 'Setup checks')}
        </span>
      </div>
      {requiredIssues.length > 0 ? (
        <PreflightIssueGroup
          label={translate('auto.components.Landing.requiredSetup', 'Required before Git projects')}
          issues={requiredIssues}
        />
      ) : null}
      {optionalIssues.length > 0 ? (
        <PreflightIssueGroup
          label={translate(
            'auto.components.Landing.optionalSetup',
            'Optional source-control setup'
          )}
          issues={optionalIssues}
        />
      ) : null}
    </div>
  )
}

function PreflightIssueGroup({
  label,
  issues
}: {
  label: string
  issues: PreflightIssue[]
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {issues.map((issue) => (
        <div key={issue.id} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{issue.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{issue.description}</p>
          </div>
          {issue.fixUrl && issue.fixLabel ? (
            <button
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              onClick={() => window.api.shell.openUrl(issue.fixUrl!)}
            >
              {issue.fixLabel}
              <ExternalLink className="size-3" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
