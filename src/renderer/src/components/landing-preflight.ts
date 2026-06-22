import { translate } from '@/i18n/i18n'
import type { CliInstallStatus } from '../../../shared/cli-install-types'

export type PreflightIssue = {
  id: string
  title: string
  description: string
  fixLabel?: string
  fixUrl?: string
  required: boolean
}

export function isWebClientPreflightFallback(args: {
  cliStatus: CliInstallStatus | null
  webSocketReady: boolean
}): boolean {
  return (
    args.webSocketReady === false &&
    args.cliStatus?.state === 'unsupported' &&
    args.cliStatus.unsupportedReason === 'launch_mode_unavailable' &&
    args.cliStatus.detail?.toLowerCase().includes('web browser') === true
  )
}

export function getPreflightIssues(
  status: {
    git: { installed: boolean }
    gh: { installed: boolean; authenticated: boolean }
  },
  options: { webClientDisconnected?: boolean } = {}
): PreflightIssue[] {
  if (options.webClientDisconnected) {
    return [
      {
        id: 'web-client-runtime',
        title: translate(
          'auto.components.Landing.webClientNotPairedTitle',
          'Web client is not paired'
        ),
        description: translate(
          'auto.components.Landing.webClientNotPairedDescription',
          'Pair this browser with Janus Code or open the desktop app before checking Git, source control, and workspaces.'
        ),
        required: true
      }
    ]
  }

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
