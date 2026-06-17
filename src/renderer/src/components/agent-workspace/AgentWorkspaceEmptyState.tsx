import { MessageSquareText } from 'lucide-react'
import { translate } from '@/i18n/i18n'

export function AgentWorkspaceEmptyState(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
          <MessageSquareText className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            {translate(
              'auto.components.agentWorkspace.empty.noAgentWorkspacesYet',
              'No agent workspaces yet'
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate(
              'auto.components.agentWorkspace.empty.addProjectOrOpenWorktree',
              'Add a project or open a worktree to start tracking agent threads here.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
