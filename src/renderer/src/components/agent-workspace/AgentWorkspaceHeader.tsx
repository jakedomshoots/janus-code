import { GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { agentTypeToIconAgent, formatAgentTypeLabel } from '@/lib/agent-status'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'

export function AgentWorkspaceHeader({
  project,
  thread
}: {
  project: AgentWorkspaceProject | null
  thread: AgentWorkspaceThread | null
}): React.JSX.Element {
  const branchName = thread?.branchName ?? null

  return (
    <header className="flex h-[52px] shrink-0 items-center border-b border-border/60 bg-background px-4">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {project?.label ??
              translate('auto.components.agentWorkspace.header.agentWorkspace', 'Agent workspace')}
          </h1>
          {thread ? (
            <Badge variant="outline">
              <AgentIcon agent={agentTypeToIconAgent(thread.agentKind)} size={12} />
              {formatAgentTypeLabel(thread.agentKind)}
            </Badge>
          ) : null}
          <Badge variant="outline">{formatAgentWorkspacePhase(thread?.phase ?? null)}</Badge>
        </div>
        {branchName ? (
          <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{branchName}</span>
          </div>
        ) : null}
      </div>
    </header>
  )
}
