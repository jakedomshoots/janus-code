import { GitBranch, PanelRight, Play, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'

export function AgentWorkspaceHeader({
  project,
  thread
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
}): React.JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {project?.label ??
              translate('auto.components.agentWorkspace.header.agentWorkspace', 'Agent workspace')}
          </h1>
          <Badge variant="outline">{formatAgentWorkspacePhase(thread?.phase ?? null)}</Badge>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {thread?.branchName ??
              translate(
                'auto.components.agentWorkspace.header.noBranchSelected',
                'No branch selected'
              )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          <RefreshCw className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.header.refresh', 'Refresh')}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          <PanelRight className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.header.panels', 'Panels')}
        </Button>
        <Button type="button" size="sm" disabled>
          <Play className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.header.run', 'Run')}
        </Button>
      </div>
    </header>
  )
}
