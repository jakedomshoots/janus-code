import { AgentComposerFooter } from './AgentComposerFooter'
import { AgentComposerTextarea } from './AgentComposerTextarea'
import type { AgentPermissionMode } from '../../../../shared/tui-agent-permissions'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgentModelOption } from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentComposerSubmitResult } from './agent-composer-submit'

export function AgentComposerForm({
  prompt,
  activeWorktreeId,
  selectedThread,
  composerDisabled,
  statusMessage,
  statusTone,
  permissionMode,
  thinkingMode,
  canOpenTerminalDrawer,
  onOpenTerminalDrawer,
  canOpenBrowserWorkbench,
  onOpenBrowserWorkbench,
  canAttachBrowserContext,
  browserAnnotationCount,
  onAttachBrowserContext,
  canSendToSelectedThread,
  availableAgents,
  selectedAgent,
  modelOptions,
  selectedModel,
  modelDiscoveryLoading,
  modelDiscoveryError,
  detectingAgents,
  submitting,
  canSubmit,
  onSubmit,
  onPromptChange,
  onPaste,
  onKeyDown,
  onPermissionModeChange,
  onThinkingModeChange,
  onSelectedAgentChange,
  onSelectedModelChange
}: {
  prompt: string
  activeWorktreeId: string | null
  selectedThread: AgentWorkspaceThread | null
  composerDisabled: boolean
  statusMessage: string | null
  statusTone: AgentComposerSubmitResult['status'] | 'launching' | 'blocked' | null
  permissionMode: AgentPermissionMode | 'mixed'
  thinkingMode: TuiAgentThinkingMode
  canOpenTerminalDrawer: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  canOpenBrowserWorkbench: boolean
  onOpenBrowserWorkbench: () => void
  canAttachBrowserContext: boolean
  browserAnnotationCount: number
  onAttachBrowserContext: () => void
  canSendToSelectedThread: boolean
  availableAgents: readonly { id: TuiAgent; label: string }[]
  selectedAgent: TuiAgent | null
  modelOptions: readonly TuiAgentModelOption[]
  selectedModel: string
  modelDiscoveryLoading: boolean
  modelDiscoveryError: string | null
  detectingAgents: boolean
  submitting: boolean
  canSubmit: boolean
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
  onPromptChange: (value: string) => void
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onPermissionModeChange: (mode: AgentPermissionMode) => void
  onThinkingModeChange: (mode: TuiAgentThinkingMode) => void
  onSelectedAgentChange: (agent: TuiAgent | null) => void
  onSelectedModelChange: (modelId: string) => void
}): React.JSX.Element {
  return (
    <form className="bg-transparent px-6 pb-6 pt-3" onSubmit={(event) => void onSubmit(event)}>
      <div className="mx-auto w-full max-w-[860px]">
        <div className="agent-composer-shell rounded-none border border-border/80 bg-card/95 shadow-xs transition-colors focus-within:border-ring/45 focus-within:ring-2 focus-within:ring-ring/10">
          <AgentComposerTextarea
            value={prompt}
            activeWorktreeId={activeWorktreeId}
            selectedThread={selectedThread}
            disabled={composerDisabled}
            statusMessage={statusMessage}
            onChange={onPromptChange}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
          />
          <AgentComposerFooter
            statusMessage={statusMessage}
            statusTone={statusTone}
            permissionMode={permissionMode}
            onPermissionModeChange={onPermissionModeChange}
            thinkingMode={thinkingMode}
            onThinkingModeChange={onThinkingModeChange}
            canOpenTerminalDrawer={canOpenTerminalDrawer}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            canOpenBrowserWorkbench={canOpenBrowserWorkbench}
            onOpenBrowserWorkbench={onOpenBrowserWorkbench}
            canAttachBrowserContext={canAttachBrowserContext}
            browserAnnotationCount={browserAnnotationCount}
            onAttachBrowserContext={onAttachBrowserContext}
            canSendToSelectedThread={canSendToSelectedThread}
            selectedThread={selectedThread}
            availableAgents={availableAgents}
            selectedAgent={selectedAgent}
            modelOptions={modelOptions}
            selectedModel={selectedModel}
            modelDiscoveryLoading={modelDiscoveryLoading}
            modelDiscoveryError={modelDiscoveryError}
            detectingAgents={detectingAgents}
            onSelectedAgentChange={onSelectedAgentChange}
            onSelectedModelChange={onSelectedModelChange}
            submitting={submitting}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </form>
  )
}
