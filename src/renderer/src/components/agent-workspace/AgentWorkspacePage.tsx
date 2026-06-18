import { useAppStore } from '@/store'
import { translate } from '@/i18n/i18n'
import { AgentWorkspaceEmptyState } from './AgentWorkspaceEmptyState'
import { AgentWorkspaceLayout } from './AgentWorkspaceLayout'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { selectAgentWorkspaceSnapshot } from './orca-agent-workspace-selectors'

export function AgentWorkspacePage({
  terminalDrawerReason = null,
  onOpenTerminalDrawer
}: {
  terminalDrawerReason?: AgentTerminalRevealReason | null
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
} = {}): React.JSX.Element {
  const snapshot = useAppStore(selectAgentWorkspaceSnapshot)

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-background"
      aria-label={translate(
        'auto.components.agentWorkspace.page.agentWorkspace',
        'Agent workspace'
      )}
    >
      {snapshot.projects.length === 0 ? (
        <>
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <h1 className="text-sm font-semibold text-foreground">
              {translate('auto.components.agentWorkspace.page.agentWorkspace', 'Agent workspace')}
            </h1>
          </div>
          <AgentWorkspaceEmptyState />
        </>
      ) : (
        <AgentWorkspaceLayout
          snapshot={snapshot}
          terminalDrawerReason={terminalDrawerReason}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )}
    </section>
  )
}
