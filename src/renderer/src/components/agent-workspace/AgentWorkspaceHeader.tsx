import { FolderOpen, Globe, MessageSquarePlus, PanelRightOpen, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'

export function AgentWorkspaceHeader({
  project,
  thread,
  rightPanelCollapsed = false,
  terminalAvailable = false,
  browserAvailable = false,
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  onExpandRightPanel,
  onOpenProjectFiles
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  rightPanelCollapsed?: boolean
  terminalAvailable?: boolean
  browserAvailable?: boolean
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
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

  if (
    !hasWorkspace &&
    !canStartSession &&
    !canOpenBrowser &&
    !canOpenTerminal &&
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
          <span className="truncate text-[11px] text-muted-foreground">
            {thread?.title ??
              translate('auto.components.agentWorkspace.header.ready', 'Ready for Janus Code')}
          </span>
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
