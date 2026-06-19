import type { TuiAgent } from '../../../../shared/types'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import type { AgentBrowserWorkbenchState } from './useAgentBrowserWorkbench'

export type AgentComposerProps = {
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  timeline?: readonly AgentWorkspaceTimelineEntry[]
  selectedProject?: AgentWorkspaceProject | null
  draftSessionId?: string | null
  terminalAvailable?: boolean
  browserWorkbench?: AgentBrowserWorkbenchState
  pendingDraftAgent?: TuiAgent | null
  onPendingDraftAgentConsumed?: () => void
  onDraftSessionAgentChange?: (agent: TuiAgent) => void
  onPendingAgentLaunch?: () => void
  onMessageSent?: AgentComposerMessageSentHandler
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}
