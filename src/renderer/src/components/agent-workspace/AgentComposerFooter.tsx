import { ArrowUp, ChevronDown, Loader2, ShieldCheck } from 'lucide-react'
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
  canSubmit
}: AgentComposerFooterProps): React.JSX.Element {
  return (
    <div className="px-5 pb-5">
      <p
        id="agent-workspace-composer-status"
        className={cn(
          'min-h-4 pb-2 text-xs',
          statusTone === 'error' ? 'text-destructive' : 'text-muted-foreground'
        )}
        aria-live="polite"
      >
        {statusMessage ?? ''}
      </p>
      <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-3">
        <div className="justify-self-start">
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
        {canSendToSelectedThread ? (
          <div />
        ) : (
          <PermissionModeSelect value={permissionMode} onChange={onPermissionModeChange} />
        )}
        <div className="min-w-0 justify-self-end">
          {canSendToSelectedThread ? (
            <div className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground">
              {translate('auto.components.agentWorkspace.composer.sendingTo', 'Sending to')}
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
          className="size-11 rounded-full"
          disabled={!canSubmit}
          aria-label={translate('auto.components.agentWorkspace.layout.send', 'Send')}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="size-5" aria-hidden="true" />
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
          className="h-10 justify-start gap-2 rounded-full px-4 text-xs"
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
