import {
  ArrowUp,
  ChevronDown,
  ListChecks,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Terminal
} from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import type { AgentPermissionMode } from '../../../../shared/tui-agent-permissions'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgentModelOption } from '../../../../shared/tui-agent-models'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import type { AgentComposerContextManifest } from './agent-composer-context-manifest'
import {
  ChatDropdownContent,
  ChatDropdownOption,
  ChatDropdownSection
} from './AgentComposerChatDropdown'
import { AgentComposerAgentSettingsPopover } from './AgentComposerAgentSettingsPopover'
import { AgentComposerContextTray } from './AgentComposerContextTray'
import { AgentComposerToolCluster } from './AgentComposerToolCluster'
import type { AgentComposerVoicePromptState } from './AgentComposerVoiceButton'

type AgentComposerFooterProps = {
  statusMessage: string | null
  statusTone: string | null
  voicePromptVisible: boolean
  voicePromptState: AgentComposerVoicePromptState
  voicePromptDisabled: boolean
  onToggleVoicePrompt: () => void
  permissionMode: AgentPermissionMode
  onPermissionModeChange: (mode: AgentPermissionMode) => void
  thinkingMode: TuiAgentThinkingMode
  onThinkingModeChange: (mode: TuiAgentThinkingMode) => void
  canOpenTerminalDrawer: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
  canOpenBrowserWorkbench: boolean
  onOpenBrowserWorkbench?: () => void
  canAttachBrowserContext: boolean
  browserAnnotationCount: number
  onAttachBrowserContext?: () => void
  canSendToSelectedThread: boolean
  selectedThread: AgentWorkspaceThread | null
  availableAgents: readonly { id: TuiAgent; label: string }[]
  selectedAgent: TuiAgent | null
  taskFitHintsEnabled: boolean
  providerRateLimits: RateLimitState
  modelOptions: readonly TuiAgentModelOption[]
  selectedModel: string
  modelDiscoveryLoading: boolean
  modelDiscoveryError: string | null
  detectingAgents: boolean
  onSelectedAgentChange: (agent: TuiAgent | null) => void
  onSelectedModelChange: (modelId: string) => void
  submitting: boolean
  canSubmit: boolean
  promptContextManifest: AgentComposerContextManifest
  onRemoveBrowserContext?: () => void
  onRemoveVerificationCommand?: () => void
  onRemoveAgentMemoryContext?: () => void
  verificationCommand: string
  onVerificationCommandChange: (value: string) => void
  recoverablePrompt: string | null
  onRestoreRecoverablePrompt: () => void
  onRetryRecoverablePrompt: () => void
}

export const AgentComposerFooter = memo(function AgentComposerFooter({
  statusMessage,
  statusTone,
  voicePromptVisible,
  voicePromptState,
  voicePromptDisabled,
  onToggleVoicePrompt,
  permissionMode,
  onPermissionModeChange,
  thinkingMode,
  onThinkingModeChange,
  canOpenTerminalDrawer,
  onOpenTerminalDrawer,
  canOpenBrowserWorkbench,
  onOpenBrowserWorkbench,
  canAttachBrowserContext,
  browserAnnotationCount,
  onAttachBrowserContext,
  canSendToSelectedThread,
  selectedThread,
  availableAgents,
  selectedAgent,
  taskFitHintsEnabled,
  providerRateLimits,
  modelOptions,
  selectedModel,
  modelDiscoveryLoading,
  modelDiscoveryError,
  detectingAgents,
  onSelectedAgentChange,
  onSelectedModelChange,
  submitting,
  canSubmit,
  promptContextManifest,
  onRemoveBrowserContext,
  onRemoveVerificationCommand,
  onRemoveAgentMemoryContext,
  verificationCommand,
  onVerificationCommandChange,
  recoverablePrompt,
  onRestoreRecoverablePrompt,
  onRetryRecoverablePrompt
}: AgentComposerFooterProps): React.JSX.Element {
  const showTerminalRecovery =
    (statusTone === 'error' || recoverablePrompt) && canOpenTerminalDrawer

  return (
    <div className="agent-composer-footer px-4 pb-3">
      <p
        id="agent-workspace-composer-status"
        className={cn(
          'min-h-3 pb-1 text-[11px]',
          statusTone === 'error' ? 'text-destructive' : 'text-muted-foreground'
        )}
        aria-live="polite"
      >
        {statusMessage ?? ''}
        {recoverablePrompt ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="ml-2 h-5 px-1.5 text-[11px]"
              onClick={onRestoreRecoverablePrompt}
            >
              {translate(
                'auto.components.agentWorkspace.composer.restoreMessage',
                'Restore message'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="ml-1 h-5 px-1.5 text-[11px]"
              disabled={submitting}
              onClick={onRetryRecoverablePrompt}
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              {translate('auto.components.agentWorkspace.composer.sendAgain', 'Send again')}
            </Button>
          </>
        ) : null}
        {showTerminalRecovery ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="ml-1 h-5 px-1.5 text-[11px]"
            onClick={() => onOpenTerminalDrawer?.('debug-button')}
          >
            <Terminal className="size-3" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.composer.openTerminal', 'Open terminal')}
          </Button>
        ) : null}
      </p>
      <AgentComposerContextTray
        manifest={promptContextManifest}
        onRemoveBrowserContext={onRemoveBrowserContext}
        onRemoveVerificationCommand={onRemoveVerificationCommand}
        onRemoveAgentMemoryContext={onRemoveAgentMemoryContext}
      />
      <div className="agent-composer-footer-actions flex min-h-10 flex-wrap items-center gap-2">
        <div className="agent-composer-footer-tools min-w-0 shrink-0">
          <AgentComposerToolCluster
            voicePromptVisible={voicePromptVisible}
            voicePromptState={voicePromptState}
            voicePromptDisabled={voicePromptDisabled}
            onToggleVoicePrompt={onToggleVoicePrompt}
            canOpenTerminalDrawer={canOpenTerminalDrawer}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            canOpenBrowserWorkbench={canOpenBrowserWorkbench}
            onOpenBrowserWorkbench={onOpenBrowserWorkbench}
            canAttachBrowserContext={canAttachBrowserContext}
            browserAnnotationCount={browserAnnotationCount}
            onAttachBrowserContext={onAttachBrowserContext}
          />
        </div>
        <div className="agent-composer-verification min-w-[13rem] flex-1">
          <label className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-2 py-1">
            <ListChecks className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              value={verificationCommand}
              aria-label={translate(
                'auto.components.agentWorkspace.composer.verificationCommand',
                'Verification command'
              )}
              disabled={canSendToSelectedThread || submitting}
              className="h-7 border-0 bg-transparent px-0 py-0 text-xs shadow-none focus-visible:ring-0"
              placeholder={translate(
                'auto.components.agentWorkspace.composer.verificationPlaceholder',
                'Verify: pnpm test'
              )}
              onChange={(event) => onVerificationCommandChange(event.target.value)}
            />
          </label>
        </div>
        <div className="agent-composer-settings flex min-w-0 flex-wrap items-center justify-end gap-2">
          {canSendToSelectedThread ? null : (
            <PermissionModeSelect value={permissionMode} onChange={onPermissionModeChange} />
          )}
          {canSendToSelectedThread ? (
            <div className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground">
              {selectedThread?.phase === 'completed'
                ? translate(
                    'auto.components.agentWorkspace.composer.completedThread',
                    'Completed thread'
                  )
                : translate('auto.components.agentWorkspace.composer.sendingTo', 'Sending to')}
              <span className="font-medium text-foreground">
                {formatAgentTypeLabel(selectedThread?.agentKind)}
              </span>
            </div>
          ) : (
            <AgentComposerAgentSettingsPopover
              thinkingMode={thinkingMode}
              onThinkingModeChange={onThinkingModeChange}
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
            />
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          className="agent-composer-submit size-9 shrink-0 rounded-full transition-transform active:scale-[0.96]"
          disabled={!canSubmit}
          aria-label={translate('auto.components.agentWorkspace.layout.send', 'Send')}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  )
})

function PermissionModeSelect({
  value,
  onChange
}: {
  value: AgentPermissionMode
  onChange: (mode: AgentPermissionMode) => void
}): React.JSX.Element {
  const options: readonly {
    value: AgentPermissionMode
    label: string
    disabled?: boolean
  }[] = [
    {
      value: 'manual',
      label: translate('auto.components.agentWorkspace.composer.permissionManual', 'Ask first')
    },
    {
      value: 'yolo',
      label: translate('auto.components.agentWorkspace.composer.permissionYolo', 'Full access')
    },
    {
      value: 'mixed',
      label: translate('auto.components.agentWorkspace.composer.permissionMixed', 'Mixed defaults'),
      disabled: true
    }
  ] as const
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0].label

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="agent-composer-permission-trigger h-9 justify-start gap-2 rounded-lg px-3 text-xs"
          aria-label={translate(
            'auto.components.agentWorkspace.composer.permissionMode',
            'Permission mode'
          )}
          title={`${translate(
            'auto.components.agentWorkspace.composer.permissionMode',
            'Permission mode'
          )}: ${selectedLabel}`}
        >
          <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="agent-composer-permission-label text-muted-foreground">
            {translate('auto.components.agentWorkspace.composer.permissions', 'Permissions')}
          </span>
          <span className="agent-composer-permission-value font-medium text-foreground">
            {selectedLabel}
          </span>
          <ChevronDown
            className="agent-composer-permission-chevron ml-1 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <ChatDropdownContent align="center" side="top" sideOffset={10}>
        <ChatDropdownSection
          title={translate('auto.components.agentWorkspace.composer.permissions', 'Permissions')}
        >
          {options.map((option) => (
            <ChatDropdownOption
              key={option.value}
              label={option.label}
              selected={option.value === value}
              disabled={option.disabled}
              ariaLabel={translate(
                'auto.components.agentWorkspace.composer.setPermissionMode',
                'Set permission mode: {{label}}',
                { label: option.label }
              )}
              onSelect={() => onChange(option.value)}
            />
          ))}
        </ChatDropdownSection>
      </ChatDropdownContent>
    </Popover>
  )
}
