import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { translate } from '@/i18n/i18n'

export type PreflightIssue = {
  id: string
  title: string
  description: string
  fixLabel: string
  fixUrl: string
  required: boolean
}

export function getPreflightIssues(status: {
  git: { installed: boolean }
  gh: { installed: boolean; authenticated: boolean }
}): PreflightIssue[] {
  const issues: PreflightIssue[] = []

  if (!status.git.installed) {
    issues.push({
      id: 'git',
      title: translate('auto.components.Landing.e5b7296d9d', 'Git is not installed'),
      description: translate(
        'auto.components.Landing.b673e7cf1b',
        'Git is required for Git projects, source control, and workspace management.'
      ),
      fixLabel: 'Install Git',
      fixUrl: 'https://git-scm.com/downloads',
      required: true
    })
  }

  if (!status.gh.installed) {
    issues.push({
      id: 'gh',
      title: translate('auto.components.Landing.5beaef5f9e', 'GitHub CLI is not installed'),
      description: translate(
        'auto.components.Landing.73e1ad4282',
        'Janus Code uses the GitHub CLI (gh) to show pull requests, issues, and checks.'
      ),
      fixLabel: 'Install GitHub CLI',
      fixUrl: 'https://cli.github.com',
      required: false
    })
  } else if (!status.gh.authenticated) {
    issues.push({
      id: 'gh-auth',
      title: translate('auto.components.Landing.9f96d018b7', 'GitHub CLI is not authenticated'),
      description: translate(
        'auto.components.Landing.00cee697c1',
        'Run "gh auth login" in a terminal to connect your GitHub account.'
      ),
      fixLabel: 'Learn more',
      fixUrl: 'https://cli.github.com/manual/gh_auth_login',
      required: false
    })
  }

  return issues
}

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
          <button
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            onClick={() => window.api.shell.openUrl(issue.fixUrl)}
          >
            {issue.fixLabel}
            <ExternalLink className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function FirstRunSetupPath({
  canCreateWorktree,
  hasRequiredIssues
}: {
  canCreateWorktree: boolean
  hasRequiredIssues: boolean
}): React.JSX.Element {
  const steps = [
    {
      label: translate('auto.components.Landing.setupStepProject', 'Start with a project'),
      description: translate(
        'auto.components.Landing.setupStepProjectDescription',
        'Add a local folder, clone a repository, or create a new project.'
      ),
      done: canCreateWorktree
    },
    {
      label: translate('auto.components.Landing.setupStepRuntime', 'Connect Janus Code'),
      description: translate(
        'auto.components.Landing.setupStepRuntimeDescription',
        'Pair this web client or use the desktop app so local actions can run.'
      ),
      done: false
    },
    {
      label: translate('auto.components.Landing.setupStepGit', 'Install required Git'),
      description: translate(
        'auto.components.Landing.setupStepGitDescription',
        'Git projects need Git before source control and workspace management work.'
      ),
      done: !hasRequiredIssues
    },
    {
      label: translate('auto.components.Landing.setupStepAgent', 'Start an agent'),
      description: translate(
        'auto.components.Landing.setupStepAgentDescription',
        'Once setup is ready, launch an agent from a workspace.'
      ),
      done: false
    }
  ]

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">
        {translate('auto.components.Landing.setupPathTitle', 'First-run setup path')}
      </p>
      <div className="mt-3 space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="grid grid-cols-[auto_1fr] gap-3">
            <div className="flex size-6 items-center justify-center rounded-full border border-border bg-background text-[11px] font-medium text-muted-foreground">
              {step.done ? <CheckCircle2 className="size-3.5 text-primary" /> : index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
