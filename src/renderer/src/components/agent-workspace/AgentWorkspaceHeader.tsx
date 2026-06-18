import { FolderOpen, PanelRightOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'

export function AgentWorkspaceHeader({
  thread,
  rightPanelCollapsed = false,
  onExpandRightPanel,
  onOpenProjectFiles
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
  rightPanelCollapsed?: boolean
  onExpandRightPanel?: () => void
  onOpenProjectFiles?: () => void
}): React.JSX.Element | null {
  const hasThread = thread !== null
  const canExpandRightPanel =
    hasThread && rightPanelCollapsed && typeof onExpandRightPanel === 'function'
  const canOpenProjectFiles =
    hasThread && !rightPanelCollapsed && typeof onOpenProjectFiles === 'function'

  if (!canOpenProjectFiles && !canExpandRightPanel) {
    return null
  }

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-end gap-3 border-b border-border/60 bg-background px-4">
      <div className="flex shrink-0 items-center gap-2">
        {canOpenProjectFiles ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onOpenProjectFiles}
            aria-label={translate(
              'auto.components.agentWorkspace.header.openProjectFiles',
              'Open project files'
            )}
          >
            <FolderOpen className="size-3.5" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.header.files', 'Files')}
          </Button>
        ) : null}
        {canExpandRightPanel ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onExpandRightPanel}
            aria-label={translate(
              'auto.components.agentWorkspace.header.showRightPanel',
              'Show right panel'
            )}
          >
            <PanelRightOpen className="size-3.5" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.header.panel', 'Panel')}
          </Button>
        ) : null}
      </div>
    </header>
  )
}
