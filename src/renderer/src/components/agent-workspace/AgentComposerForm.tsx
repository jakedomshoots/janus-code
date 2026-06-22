import { useCallback, useId, useMemo, useState } from 'react'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import { AgentComposerFooter } from './AgentComposerFooter'
import { AgentComposerSlashCommandMenu } from './AgentComposerSlashCommandMenu'
import { AgentComposerTextarea } from './AgentComposerTextarea'
import type { AgentPermissionMode } from '../../../../shared/tui-agent-permissions'
import { isTuiAgent } from '../../../../shared/tui-agent-config'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgentModelOption } from '../../../../shared/tui-agent-models'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'
import type { AgentWorkspaceProject } from './agent-workspace-types'
import type { AgentComposerSubmitResult } from './agent-composer-submit'
import type { AgentComposerContextManifest } from './agent-composer-context-manifest'
import type { AgentComposerQueuedFollowUp } from './agent-composer-queued-follow-up'
import { learnAgentComposerSlashCommandsFromTimeline } from './agent-composer-learned-slash-commands'
import { useAgentComposerSlashCommandDiscovery } from './agent-composer-slash-command-discovery'
import {
  completeAgentComposerSlashCommand,
  getAgentComposerSlashCommandMatches
} from './agent-composer-slash-command-model'
import { AgentComposerQueuedFollowUpRow } from './AgentComposerQueuedFollowUp'
import type { AgentComposerVoicePromptState } from './AgentComposerVoiceButton'

export function AgentComposerForm({
  prompt,
  textareaRef,
  activeWorktreeId,
  selectedProject,
  selectedThread,
  timeline,
  composerDisabled,
  statusMessage,
  statusTone,
  voicePromptVisible,
  voicePromptState,
  voicePromptDisabled,
  onToggleVoicePrompt,
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
  taskFitHintsEnabled,
  providerRateLimits,
  modelOptions,
  selectedModel,
  modelDiscoveryLoading,
  modelDiscoveryError,
  detectingAgents,
  submitting,
  canSubmit,
  onSubmit,
  onPromptChange,
  promptContextManifest,
  onRemoveBrowserContext,
  onRemoveVerificationCommand,
  onRemoveAgentMemoryContext,
  queuedFollowUp,
  onQueuedFollowUpChange,
  onDeleteQueuedFollowUp,
  verificationCommand,
  onVerificationCommandChange,
  onPaste,
  onKeyDown,
  onPermissionModeChange,
  onThinkingModeChange,
  onSelectedAgentChange,
  onSelectedModelChange,
  recoverablePrompt,
  onRestoreRecoverablePrompt,
  onRetryRecoverablePrompt
}: {
  prompt: string
  textareaRef?: React.Ref<HTMLTextAreaElement>
  activeWorktreeId: string | null
  selectedProject: AgentWorkspaceProject | null
  selectedThread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  composerDisabled: boolean
  statusMessage: string | null
  statusTone: AgentComposerSubmitResult['status'] | 'launching' | 'blocked' | null
  voicePromptVisible: boolean
  voicePromptState: AgentComposerVoicePromptState
  voicePromptDisabled: boolean
  onToggleVoicePrompt: () => void
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
  taskFitHintsEnabled: boolean
  providerRateLimits: RateLimitState
  modelOptions: readonly TuiAgentModelOption[]
  selectedModel: string
  modelDiscoveryLoading: boolean
  modelDiscoveryError: string | null
  detectingAgents: boolean
  submitting: boolean
  canSubmit: boolean
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
  onPromptChange: (value: string) => void
  promptContextManifest: AgentComposerContextManifest
  onRemoveBrowserContext?: () => void
  onRemoveVerificationCommand?: () => void
  onRemoveAgentMemoryContext?: () => void
  queuedFollowUp: AgentComposerQueuedFollowUp | null
  onQueuedFollowUpChange: (value: string) => void
  onDeleteQueuedFollowUp: () => void
  verificationCommand: string
  onVerificationCommandChange: (value: string) => void
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onPermissionModeChange: (mode: AgentPermissionMode) => void
  onThinkingModeChange: (mode: TuiAgentThinkingMode) => void
  onSelectedAgentChange: (agent: TuiAgent | null) => void
  onSelectedModelChange: (modelId: string) => void
  recoverablePrompt: string | null
  onRestoreRecoverablePrompt: () => void
  onRetryRecoverablePrompt: () => void
}): React.JSX.Element {
  const slashCommandsId = useId()
  const slashCommandsListId = `${slashCommandsId}-listbox`
  const slashCommandOptionIdPrefix = `${slashCommandsId}-option`
  const [activeSlashCommandIndex, setActiveSlashCommandIndex] = useState(0)
  const activeAgent = selectedThread
    ? isTuiAgent(selectedThread.agentKind)
      ? selectedThread.agentKind
      : null
    : selectedAgent
  const learnedSlashCommands = useMemo(
    () => learnAgentComposerSlashCommandsFromTimeline(timeline),
    [timeline]
  )
  const discoveredSlashCommands = useAgentComposerSlashCommandDiscovery(
    activeAgent,
    selectedProject
  )
  const availableSlashCommands = useMemo(
    () => [...discoveredSlashCommands.commands, ...learnedSlashCommands],
    [discoveredSlashCommands.commands, learnedSlashCommands]
  )
  const slashCommands = useMemo(
    () => getAgentComposerSlashCommandMatches(prompt, activeAgent, availableSlashCommands),
    [activeAgent, availableSlashCommands, prompt]
  )
  const slashMenuOpen = slashCommands.length > 0
  // Why: selected-thread composers sit below the floating Environment card;
  // keep the input rail out from under it without turning the card into a panel.
  const overlayGutterClass = selectedThread ? 'min-[800px]:pr-[clamp(18rem,27vw,21rem)]' : null
  const boundedActiveSlashCommandIndex =
    slashCommands.length > 0 ? Math.min(activeSlashCommandIndex, slashCommands.length - 1) : 0
  const activeSlashCommandOptionId = slashMenuOpen
    ? `${slashCommandOptionIdPrefix}-${boundedActiveSlashCommandIndex}`
    : undefined

  const handleSlashCommandSelect = useCallback(
    (command: { command: string }): void => {
      onPromptChange(completeAgentComposerSlashCommand(command.command))
      setActiveSlashCommandIndex(0)
    },
    [onPromptChange]
  )

  const handleTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (!slashMenuOpen) {
        onKeyDown(event)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveSlashCommandIndex((current) => (current + 1) % slashCommands.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveSlashCommandIndex(
          (current) => (current - 1 + slashCommands.length) % slashCommands.length
        )
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        const selectedCommand = slashCommands[boundedActiveSlashCommandIndex] ?? slashCommands[0]
        if (selectedCommand) {
          event.preventDefault()
          handleSlashCommandSelect(selectedCommand)
          return
        }
      }

      onKeyDown(event)
    },
    [
      boundedActiveSlashCommandIndex,
      handleSlashCommandSelect,
      onKeyDown,
      slashCommands,
      slashMenuOpen
    ]
  )

  return (
    <form
      className={cn(
        'agent-workspace-composer border-t border-border/70 bg-background/95 pb-3 pl-6 pr-6 pt-2 backdrop-blur',
        overlayGutterClass
      )}
      aria-label={translate(
        'auto.components.agentWorkspace.composer.agentChatComposer',
        'Agent chat composer'
      )}
      onSubmit={(event) => void onSubmit(event)}
    >
      <div className="mx-auto w-full max-w-[860px]">
        <div className="agent-composer-shell rounded-xl border border-border/80 bg-card shadow-xs transition-colors focus-within:border-ring/45 focus-within:ring-2 focus-within:ring-ring/10">
          <AgentComposerSlashCommandMenu
            id={slashCommandsListId}
            optionIdPrefix={slashCommandOptionIdPrefix}
            commands={slashCommands}
            activeIndex={boundedActiveSlashCommandIndex}
            onActiveIndexChange={setActiveSlashCommandIndex}
            onSelect={handleSlashCommandSelect}
          />
          <AgentComposerTextarea
            ref={textareaRef}
            value={prompt}
            activeWorktreeId={activeWorktreeId}
            selectedThread={selectedThread}
            disabled={composerDisabled}
            statusMessage={statusMessage}
            slashMenuOpen={slashMenuOpen}
            slashCommandsListId={slashCommandsListId}
            activeSlashCommandOptionId={activeSlashCommandOptionId}
            onChange={onPromptChange}
            onPaste={onPaste}
            onKeyDown={handleTextareaKeyDown}
          />
          {queuedFollowUp ? (
            <AgentComposerQueuedFollowUpRow
              queuedFollowUp={queuedFollowUp}
              disabled={composerDisabled}
              onChange={onQueuedFollowUpChange}
              onDelete={onDeleteQueuedFollowUp}
            />
          ) : null}
          <AgentComposerFooter
            statusMessage={statusMessage}
            statusTone={statusTone}
            voicePromptVisible={voicePromptVisible}
            voicePromptState={voicePromptState}
            voicePromptDisabled={voicePromptDisabled}
            onToggleVoicePrompt={onToggleVoicePrompt}
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
            taskFitHintsEnabled={taskFitHintsEnabled}
            providerRateLimits={providerRateLimits}
            modelOptions={modelOptions}
            selectedModel={selectedModel}
            modelDiscoveryLoading={modelDiscoveryLoading}
            modelDiscoveryError={modelDiscoveryError}
            detectingAgents={detectingAgents}
            onSelectedAgentChange={onSelectedAgentChange}
            onSelectedModelChange={onSelectedModelChange}
            submitting={submitting}
            canSubmit={canSubmit}
            promptContextManifest={promptContextManifest}
            onRemoveBrowserContext={onRemoveBrowserContext}
            onRemoveVerificationCommand={onRemoveVerificationCommand}
            onRemoveAgentMemoryContext={onRemoveAgentMemoryContext}
            verificationCommand={verificationCommand}
            onVerificationCommandChange={onVerificationCommandChange}
            recoverablePrompt={recoverablePrompt}
            onRestoreRecoverablePrompt={onRestoreRecoverablePrompt}
            onRetryRecoverablePrompt={onRetryRecoverablePrompt}
          />
        </div>
      </div>
    </form>
  )
}
