import { useEffect, useMemo, useState } from 'react'
import { FolderPlus, GitBranchPlus, Plug } from 'lucide-react'
import { useAppStore } from '../store'
import { isGitRepoKind } from '../../../shared/repo-kind'
import { ShortcutKeyCombo } from './ShortcutKeyCombo'
import { useShortcutKeys } from '@/hooks/useShortcutLabel'
import logo from '../../../../resources/janus-logo.png'
import { translate } from '@/i18n/i18n'
import { GitHubStarButton } from './LandingGitHubStarButton'
import {
  FirstRunSetupPath,
  PreflightBanner,
  getPreflightIssues,
  type PreflightIssue
} from './LandingPreflightChecks'

type ShortcutItem = {
  id: string
  keys: string[]
  action: string
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
      void window.api.preflight.check(force ? { force: true } : undefined).then((status) => {
        if (cancelled) {
          return
        }
        setPreflightIssues(getPreflightIssues(status))
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
      void window.api.preflight.check({ force: true }).then((status) => {
        if (cancelled) {
          return
        }
        setPreflightIssues(getPreflightIssues(status))
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
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="w-full max-w-lg px-6">
        <div className="flex flex-col items-center gap-4 py-8">
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

          {preflightIssues.length > 0 && <PreflightBanner issues={preflightIssues} />}

          <p className="text-sm text-muted-foreground text-center">
            {canCreateWorktree
              ? translate(
                  'auto.components.Landing.9c00bd4adf',
                  'Select a workspace from the sidebar to begin.'
                )
              : translate('auto.components.Landing.cd21242762', 'Add a project to get started.')}
          </p>

          <FirstRunSetupPath
            canCreateWorktree={canCreateWorktree}
            hasRequiredIssues={requiredPreflightIssueCount > 0}
          />

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
              {translate('auto.components.Landing.76a95f7f47', 'Create')}
              {createTargetLabel}
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
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <GitHubStarButton hasRepos={repos.length > 0} />
      </div>
    </div>
  )
}
