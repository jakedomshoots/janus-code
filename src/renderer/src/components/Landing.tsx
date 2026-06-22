import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FolderPlus, GitBranchPlus, Plug } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAppStore } from '../store'
import { isGitRepoKind } from '../../../shared/repo-kind'
import { ShortcutKeyCombo } from './ShortcutKeyCombo'
import { useShortcutKeys } from '@/hooks/useShortcutLabel'
import logo from '../../../../resources/janus-logo.png'
import { translate } from '@/i18n/i18n'
import { GitHubStarButton } from './LandingGitHubStarButton'
import { PreflightBanner } from './LandingPreflightBanner'
import {
  getPreflightIssues,
  isWebClientPreflightFallback,
  type PreflightIssue
} from './landing-preflight'

type ShortcutItem = {
  id: string
  keys: string[]
  action: string
}

function FirstRunSetupPath({
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

export default function Landing(): React.JSX.Element {
  const repos = useAppStore((s) => s.repos)
  const openModal = useAppStore((s) => s.openModal)

  const createTargetLabel =
    repos.length > 0 && repos.every((repo) => isGitRepoKind(repo)) ? 'Worktree' : 'Workspace'
  const canCreateWorktree = repos.length > 0

  const [preflightIssues, setPreflightIssues] = useState<PreflightIssue[]>([])
  const requiredPreflightIssueCount = preflightIssues.filter((issue) => issue.required).length

  useEffect(() => {
    let cancelled = false
    const refreshPreflight = (force = false): void => {
      void Promise.all([
        window.api.preflight.check(force ? { force: true } : undefined),
        window.api.cli.getInstallStatus().catch(() => null),
        window.api.mobile.isWebSocketReady().catch(() => ({ ready: true }))
      ]).then(([status, cliStatus, webSocketStatus]) => {
        if (cancelled) {
          return
        }
        setPreflightIssues(
          getPreflightIssues(status, {
            webClientDisconnected: isWebClientPreflightFallback({
              cliStatus,
              webSocketReady: webSocketStatus.ready
            })
          })
        )
      })
    }

    // oxlint-disable-next-line react-doctor/no-initialize-state -- Why: preflight status is read from an external IPC probe on mount and focus.
    refreshPreflight()

    // Why: users often install/authenticate gh outside Orca. Re-check when the
    // window becomes active again so the landing warning clears without relaunch.
    const handleWindowActive = (): void => {
      if (document.visibilityState === 'visible') {
        refreshPreflight(true)
      }
    }

    document.addEventListener('visibilitychange', handleWindowActive)
    window.addEventListener('focus', handleWindowActive)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleWindowActive)
      window.removeEventListener('focus', handleWindowActive)
    }
  }, [])

  useEffect(() => {
    if (preflightIssues.length === 0) {
      return
    }

    let cancelled = false
    // Why: some users complete `gh auth login` without ever leaving the Orca
    // window. Poll only while a warning is visible so the banner self-clears.
    const intervalId = window.setInterval(() => {
      void Promise.all([
        window.api.preflight.check({ force: true }),
        window.api.cli.getInstallStatus().catch(() => null),
        window.api.mobile.isWebSocketReady().catch(() => ({ ready: true }))
      ]).then(([status, cliStatus, webSocketStatus]) => {
        if (cancelled) {
          return
        }
        setPreflightIssues(
          getPreflightIssues(status, {
            webClientDisconnected: isWebClientPreflightFallback({
              cliStatus,
              webSocketReady: webSocketStatus.ready
            })
          })
        )
      })
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [preflightIssues.length])

  const createWorktreeKeys = useShortcutKeys('workspace.create')
  const previousWorktreeKeys = useShortcutKeys('worktree.navigateUp')
  const nextWorktreeKeys = useShortcutKeys('worktree.navigateDown')
  const shortcuts = useMemo<ShortcutItem[]>(() => {
    return [
      {
        id: 'create',
        keys: createWorktreeKeys,
        action: `Create ${createTargetLabel.toLowerCase()}`
      },
      { id: 'up', keys: previousWorktreeKeys, action: 'Move up workspace' },
      { id: 'down', keys: nextWorktreeKeys, action: 'Move down workspace' }
    ]
  }, [createTargetLabel, createWorktreeKeys, nextWorktreeKeys, previousWorktreeKeys])

  return (
    <div className="scrollbar-sleek absolute inset-0 overflow-y-auto bg-background">
      <div className="flex min-h-full items-start justify-center px-6 py-6 sm:items-center">
        <div className="flex w-full flex-col items-center gap-4 pb-4 pt-2">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <img
              src={logo}
              alt={translate('auto.components.Landing.520304a067', 'Janus Code logo')}
              className="size-24 scale-125 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {translate('auto.components.Landing.6ca6ff404e', 'Janus Code')}
          </h1>

          <div
            className={cn(
              'grid w-full gap-4',
              preflightIssues.length > 0 ? 'max-w-4xl lg:grid-cols-2 lg:items-start' : 'max-w-lg'
            )}
          >
            {preflightIssues.length > 0 && <PreflightBanner issues={preflightIssues} />}

            <FirstRunSetupPath
              canCreateWorktree={canCreateWorktree}
              hasRequiredIssues={requiredPreflightIssueCount > 0}
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {canCreateWorktree
              ? translate(
                  'auto.components.Landing.9c00bd4adf',
                  'Select a workspace from the sidebar to begin.'
                )
              : translate('auto.components.Landing.cd21242762', 'Add a project to get started.')}
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button
              className="inline-flex items-center gap-1.5 bg-secondary/70 border border-border/80 text-foreground font-medium text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
              onClick={() => openModal('add-repo')}
            >
              <FolderPlus className="size-3.5" />
              {translate('auto.components.Landing.f9eaa9e12d', 'Add Project')}
            </button>

            <button
              className="inline-flex items-center gap-1.5 bg-secondary/70 border border-border/80 text-foreground font-medium text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-accent"
              disabled={!canCreateWorktree}
              title={
                !canCreateWorktree
                  ? translate(
                      'auto.components.Landing.f05d237049',
                      'Add a project before creating a workspace.'
                    )
                  : undefined
              }
              onClick={() => openModal('new-workspace-composer', { telemetrySource: 'unknown' })}
            >
              <GitBranchPlus className="size-3.5" />
              {translate('auto.components.Landing.76a95f7f47', 'Create')} {createTargetLabel}
            </button>
          </div>

          {!canCreateWorktree ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Plug className="size-3.5 shrink-0" />
              {translate(
                'auto.components.Landing.createWorkspaceBlocked',
                'Add a project before creating a workspace.'
              )}
            </div>
          ) : null}

          {canCreateWorktree ? (
            <div className="mt-6 w-full max-w-xs space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <ShortcutKeyCombo
                    keys={shortcut.keys}
                    separatorClassName="mx-0.5 text-[10px] text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <GitHubStarButton hasRepos={repos.length > 0} />
        </div>
      </div>
    </div>
  )
}
