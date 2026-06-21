import {
  FolderOpen,
  Globe,
  LayoutDashboard,
  MessageSquarePlus,
  PanelRightOpen,
  Terminal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceThreadChromeAttentionState,
  AgentWorkspaceThreadChromeSummary
} from './agent-workspace-types'

function formatChangedFileCount(count: number): string {
  return count === 1
    ? translate('auto.components.agentWorkspace.header.oneFileChanged', '1 file')
    : translate('auto.components.agentWorkspace.header.changedFileCount', '{{count}} files', {
        count
      })
}

function formatAttentionState(state: AgentWorkspaceThreadChromeAttentionState): string {
  switch (state) {
    case 'idle':
      return translate('auto.components.agentWorkspace.header.attentionIdle', 'Idle')
    case 'running':
      return translate('auto.components.agentWorkspace.header.attentionRunning', 'Running')
    case 'needs-attention':
      return translate(
        'auto.components.agentWorkspace.header.attentionNeedsAttention',
        'Needs attention'
      )
    case 'failed':
      return translate('auto.components.agentWorkspace.header.attentionFailed', 'Failed')
    case 'done':
      return translate('auto.components.agentWorkspace.header.attentionDone', 'Done')
  }
}

export function AgentWorkspaceHeader({
  project,
  thread,
  runSummary = null,
  rightPanelCollapsed = false,
  terminalAvailable = false,
  browserAvailable = false,
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  onOpenWorkbench,
  onExpandRightPanel,
  onOpenProjectFiles
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  runSummary?: AgentWorkspaceThreadChromeSummary | null
  rightPanelCollapsed?: boolean
  terminalAvailable?: boolean
  browserAvailable?: boolean
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
  onOpenWorkbench?: () => void
  onExpandRightPanel?: () => void
  onOpenProjectFiles?: () => void
}): React.JSX.Element | null {
  const hasThread = thread !== null
  const hasWorkspace = project !== null
  const canExpandRightPanel =
    hasThread && rightPanelCollapsed && typeof onExpandRightPanel === 'function'
  const canOpenProjectFiles =
    hasThread && !rightPanelCollapsed && typeof onOpenProjectFiles === 'function'
  const canStartSession = hasWorkspace && typeof onNewSession === 'function'
  const canOpenBrowser =
    hasWorkspace && browserAvailable && typeof onOpenBrowserWorkbench === 'function'
  const canOpenTerminal =
    hasWorkspace && terminalAvailable && typeof onOpenTerminalDrawer === 'function'
  const canOpenWorkbench = hasWorkspace && typeof onOpenWorkbench === 'function'

  if (
    !hasWorkspace &&
    !canStartSession &&
    !canOpenBrowser &&
    !canOpenTerminal &&
    !canOpenWorkbench &&
    !canOpenProjectFiles &&
    !canExpandRightPanel
  ) {
    return null
  }

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/95 px-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-xs font-medium text-foreground">
            {project?.label ??
              translate('auto.components.agentWorkspace.header.workspace', 'Workspace')}
          </span>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">
              {thread?.title ??
                translate('auto.components.agentWorkspace.header.ready', 'Ready for Janus Code')}
            </span>
            {runSummary ? (
              <span
                className="hidden min-w-0 items-center gap-1.5 lg:flex"
                aria-label={translate(
                  'auto.components.agentWorkspace.header.runSummary',
                  'Run summary'
                )}
              >
                <span className="text-muted-foreground/70" aria-hidden="true">
                  ·
                </span>
                <span className="max-w-32 truncate" title={runSummary.currentStep}>
                  {runSummary.currentStep}
                </span>
                {runSummary.lastCommand ? (
                  <>
                    <span className="text-muted-foreground/70" aria-hidden="true">
                      ·
                    </span>
                    <span
                      className="max-w-40 truncate font-mono text-[10px]"
                      title={runSummary.lastCommand}
                    >
                      {runSummary.lastCommand}
                    </span>
                  </>
                ) : null}
                <span className="text-muted-foreground/70" aria-hidden="true">
                  ·
                </span>
                <span className="shrink-0">
                  {formatChangedFileCount(runSummary.changedFileCount)}
                </span>
                <span className="text-muted-foreground/70" aria-hidden="true">
                  ·
                </span>
                <span className="shrink-0">{formatAttentionState(runSummary.attentionState)}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div
        className="flex min-w-0 shrink items-center justify-end gap-1.5 overflow-x-auto [scrollbar-width:none]"
        aria-label={translate(
          'auto.components.agentWorkspace.header.workspaceCommands',
          'Workspace commands'
        )}
      >
        {canStartSession ? (
          <Button
            type="button"
            variant="default"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onNewSession}
            aria-label={translate(
              'auto.components.agentWorkspace.header.newSession',
              'New session'
            )}
            title={translate('auto.components.agentWorkspace.header.newSession', 'New session')}
          >
            <MessageSquarePlus className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {translate('auto.components.agentWorkspace.header.newSession', 'New session')}
            </span>
          </Button>
        ) : null}
        {canOpenBrowser ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onOpenBrowserWorkbench}
            aria-label={translate(
              'auto.components.agentWorkspace.header.openBrowser',
              'Open browser'
            )}
            title={translate('auto.components.agentWorkspace.header.openBrowser', 'Open browser')}
          >
            <Globe className="size-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">
              {translate('auto.components.agentWorkspace.header.browser', 'Browser')}
            </span>
          </Button>
        ) : null}
        {canOpenTerminal ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onOpenTerminalDrawer}
            aria-label={translate(
              'auto.components.agentWorkspace.header.openTerminal',
              'Open terminal'
            )}
            title={translate('auto.components.agentWorkspace.header.openTerminal', 'Open terminal')}
          >
            <Terminal className="size-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">
              {translate('auto.components.agentWorkspace.header.terminal', 'Terminal')}
            </span>
          </Button>
        ) : null}
        {canOpenWorkbench ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onOpenWorkbench}
            aria-label={translate(
              'auto.components.agentWorkspace.header.openWorkbench',
              'Open workbench'
            )}
            title={translate(
              'auto.components.agentWorkspace.header.openWorkbench',
              'Open workbench'
            )}
          >
            <LayoutDashboard className="size-3.5" aria-hidden="true" />
            <span className="hidden 2xl:inline">
              {translate('auto.components.agentWorkspace.header.workbench', 'Workbench')}
            </span>
          </Button>
        ) : null}
        {canOpenProjectFiles ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onOpenProjectFiles}
            aria-label={translate(
              'auto.components.agentWorkspace.header.openProjectFiles',
              'Open project files'
            )}
            title={translate(
              'auto.components.agentWorkspace.header.openProjectFiles',
              'Open project files'
            )}
          >
            <FolderOpen className="size-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">
              {translate('auto.components.agentWorkspace.header.files', 'Files')}
            </span>
          </Button>
        ) : null}
        {canExpandRightPanel ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98]"
            onClick={onExpandRightPanel}
            aria-label={translate(
              'auto.components.agentWorkspace.header.showRightPanel',
              'Show right panel'
            )}
            title={translate(
              'auto.components.agentWorkspace.header.showRightPanel',
              'Show right panel'
            )}
          >
            <PanelRightOpen className="size-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">
              {translate('auto.components.agentWorkspace.header.panel', 'Panel')}
            </span>
          </Button>
        ) : null}
      </div>
    </header>
  )
}
