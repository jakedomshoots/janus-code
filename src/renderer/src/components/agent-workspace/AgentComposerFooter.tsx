import { ArrowUp, ChevronDown, Loader2, RotateCcw, ShieldCheck, Terminal } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import type { AgentPermissionMode } from '../../../../shared/tui-agent-permissions'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgentModelOption } from '../../../../shared/tui-agent-models'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'
import {
  ChatDropdownContent,
  ChatDropdownOption,
  ChatDropdownSection
} from './AgentComposerChatDropdown'
import { AgentComposerAgentSettingsPopover } from './AgentComposerAgentSettingsPopover'
import { AgentComposerToolCluster } from './AgentComposerToolCluster'
import {
  resolveAgentComposerDeliveryFeedback,
  type AgentComposerDeliveryFeedback
} from './agent-composer-delivery-feedback'
import { useAgentWorkspaceInstantAction } from './useAgentWorkspaceInstantAction'

type AgentComposerFooterProps = {
  statusMessage: string | null
  statusTone: string | null
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
  modelOptions: readonly TuiAgentModelOption[]
  selectedModel: string
  modelDiscoveryLoading: boolean
  modelDiscoveryError: string | null
  detectingAgents: boolean
  onSelectedAgentChange: (agent: TuiAgent | null) => void
  onSelectedModelChange: (modelId: string) => void
  submitting: boolean
  canSubmit: boolean
  recoverablePrompt: string | null
  onRestoreRecoverablePrompt: () => void
  onRetryRecoverablePrompt: () => void
}

export const AgentComposerFooter = memo(function AgentComposerFooter({
  statusMessage,
  statusTone,
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
  modelOptions,
  selectedModel,
  modelDiscoveryLoading,
  modelDiscoveryError,
  detectingAgents,
  onSelectedAgentChange,
  onSelectedModelChange,
  submitting,
  canSubmit,
  recoverablePrompt,
  onRestoreRecoverablePrompt,
  onRetryRecoverablePrompt
}: AgentComposerFooterProps): React.JSX.Element {
  const showTerminalRecovery =
    (statusTone === 'error' || recoverablePrompt) && canOpenTerminalDrawer
  const deliveryFeedback = resolveAgentComposerDeliveryFeedback({
    submitting,
    statusTone,
    statusMessage,
    selectedThread,
    recoverablePrompt
  })
  const restorePromptAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(
    onRestoreRecoverablePrompt
  )
  const retryPromptAction =
    useAgentWorkspaceInstantAction<HTMLButtonElement>(onRetryRecoverablePrompt)
  const openTerminalRecoveryAction = useAgentWorkspaceInstantAction<HTMLButtonElement>(
    onOpenTerminalDrawer ? () => onOpenTerminalDrawer('debug-button') : undefined
  )

  return (
    <div className="px-4 pb-4">
      <p
        id="agent-workspace-composer-status"
        className={cn(
          'min-h-3.5 pb-1.5 text-[11px]',
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
              {...restorePromptAction}
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
              {...retryPromptAction}
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
            {...openTerminalRecoveryAction}
          >
            <Terminal className="size-3" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.composer.openTerminal', 'Open terminal')}
          </Button>
        ) : null}
      </p>
      <DeliveryStateStrip feedback={deliveryFeedback} />
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        <div className="min-w-0 shrink-0">
          <AgentComposerToolCluster
            canOpenTerminalDrawer={canOpenTerminalDrawer}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            canOpenBrowserWorkbench={canOpenBrowserWorkbench}
            onOpenBrowserWorkbench={onOpenBrowserWorkbench}
            canAttachBrowserContext={canAttachBrowserContext}
            browserAnnotationCount={browserAnnotationCount}
            onAttachBrowserContext={onAttachBrowserContext}
          />
        </div>
        <div className="min-w-0 flex-1" />
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
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
          className="size-9 shrink-0 rounded-full transition-transform active:scale-[0.96]"
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

function DeliveryStateStrip({
  feedback
}: {
  feedback: AgentComposerDeliveryFeedback
}): React.JSX.Element | null {
  if (feedback.state === 'idle' || feedback.state === 'blocked') {
    return null
  }

  return (
    <div
      className={cn(
        'mb-3 rounded-lg border bg-background/65 p-2',
        feedback.state === 'failed' ? 'border-destructive/35' : 'border-border/80'
      )}
      data-agent-composer-delivery-state={feedback.state}
      aria-live="polite"
    >
      <div className="flex min-w-0 items-center gap-2">
        <DeliveryStateIcon state={feedback.state} />
        <span className="text-xs font-medium text-foreground">{feedback.label}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
          {feedback.detail}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden="true">
        {feedback.steps.map((step) => (
          <span
            key={step.id}
            className={cn(
              'h-1.5 rounded-full',
              step.state === 'complete'
                ? 'bg-primary/65'
                : step.state === 'current'
                  ? feedback.state === 'failed'
                    ? 'bg-destructive'
                    : 'bg-primary'
                  : 'bg-muted'
            )}
            title={step.label}
          />
        ))}
      </div>
    </div>
  )
}

function DeliveryStateIcon({
  state
}: {
  state: AgentComposerDeliveryFeedback['state']
}): React.JSX.Element {
  if (state === 'queued') {
    return <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
  }
  if (state === 'failed') {
    return <RotateCcw className="size-3.5 shrink-0 text-destructive" />
  }
  return <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
}

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
          className="h-9 justify-start gap-2 rounded-lg px-3 text-xs"
          aria-label={translate(
            'auto.components.agentWorkspace.composer.permissionMode',
            'Permission mode'
          )}
        >
          <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {translate('auto.components.agentWorkspace.composer.permissions', 'Permissions')}
          </span>
          <span className="font-medium text-foreground">{selectedLabel}</span>
          <ChevronDown className="ml-1 size-3.5 text-muted-foreground" aria-hidden="true" />
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
