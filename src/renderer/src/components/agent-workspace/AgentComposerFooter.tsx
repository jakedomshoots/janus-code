import { Brain, Loader2, PanelBottom, SendHorizontal, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { cn } from '@/lib/utils'
import type { AgentPermissionMode } from '../../../../shared/tui-agent-permissions'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import type { AgentWorkspaceThread } from './agent-workspace-types'

export function AgentComposerFooter({
  statusMessage,
  statusTone,
  permissionMode,
  onPermissionModeChange,
  thinkingMode,
  onThinkingModeChange,
  canOpenTerminalDrawer,
  onOpenTerminalDrawer,
  canSendToSelectedThread,
  selectedThread,
  availableAgents,
  selectedAgent,
  detectingAgents,
  onSelectedAgentChange,
  submitting,
  canSubmit
}: {
  statusMessage: string | null
  statusTone: string | null
  permissionMode: AgentPermissionMode
  onPermissionModeChange: (mode: AgentPermissionMode) => void
  thinkingMode: TuiAgentThinkingMode
  onThinkingModeChange: (mode: TuiAgentThinkingMode) => void
  canOpenTerminalDrawer: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
  canSendToSelectedThread: boolean
  selectedThread: AgentWorkspaceThread | null
  availableAgents: readonly { id: TuiAgent; label: string }[]
  selectedAgent: TuiAgent | null
  detectingAgents: boolean
  onSelectedAgentChange: (agent: TuiAgent | null) => void
  submitting: boolean
  canSubmit: boolean
}): React.JSX.Element {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-t border-border/65 px-2.5 py-2">
      <p
        id="agent-workspace-composer-status"
        className={cn(
          'min-w-44 flex-1 text-xs',
          statusTone === 'error' ? 'text-destructive' : 'text-muted-foreground'
        )}
        aria-live="polite"
      >
        {statusMessage ?? ''}
      </p>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <PermissionModeSelect value={permissionMode} onChange={onPermissionModeChange} />
        <ThinkingModeSelect value={thinkingMode} onChange={onThinkingModeChange} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canOpenTerminalDrawer}
          aria-label={translate(
            'auto.components.agentWorkspace.composer.openTerminalDrawer',
            'Open terminal drawer'
          )}
          onClick={() => onOpenTerminalDrawer?.('debug-button')}
        >
          <PanelBottom className="size-4" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
        </Button>
        {canSendToSelectedThread ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            {translate('auto.components.agentWorkspace.composer.sendingTo', 'Sending to')}
            <span className="font-medium text-foreground">
              {formatAgentTypeLabel(selectedThread?.agentKind)}
            </span>
          </div>
        ) : (
          <AgentProviderSelect
            agents={availableAgents}
            value={selectedAgent}
            detecting={detectingAgents}
            onChange={onSelectedAgentChange}
          />
        )}
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal className="size-4" aria-hidden="true" />
          )}
          {translate('auto.components.agentWorkspace.layout.send', 'Send')}
        </Button>
      </div>
    </div>
  )
}

function PermissionModeSelect({
  value,
  onChange
}: {
  value: AgentPermissionMode
  onChange: (mode: AgentPermissionMode) => void
}): React.JSX.Element {
  return (
    <ComposerToolbarSelect
      label={translate('auto.components.agentWorkspace.composer.permissions', 'Permissions')}
      ariaLabel={translate(
        'auto.components.agentWorkspace.composer.permissionMode',
        'Permission mode'
      )}
      icon={<ShieldCheck className="size-3.5" aria-hidden="true" />}
      value={value}
      onChange={(nextValue) => onChange(nextValue as AgentPermissionMode)}
      options={[
        {
          value: 'manual',
          label: translate('auto.components.agentWorkspace.composer.permissionManual', 'Ask first')
        },
        {
          value: 'yolo',
          label: translate('auto.components.agentWorkspace.composer.permissionYolo', 'Auto approve')
        },
        {
          value: 'mixed',
          label: translate(
            'auto.components.agentWorkspace.composer.permissionMixed',
            'Mixed defaults'
          ),
          disabled: true
        }
      ]}
    />
  )
}

function ThinkingModeSelect({
  value,
  onChange
}: {
  value: TuiAgentThinkingMode
  onChange: (mode: TuiAgentThinkingMode) => void
}): React.JSX.Element {
  return (
    <ComposerToolbarSelect
      label={translate('auto.components.agentWorkspace.composer.thinking', 'Thinking')}
      ariaLabel={translate('auto.components.agentWorkspace.composer.thinkingMode', 'Thinking mode')}
      icon={<Brain className="size-3.5" aria-hidden="true" />}
      value={value}
      onChange={(nextValue) => onChange(nextValue as TuiAgentThinkingMode)}
      options={[
        {
          value: 'quick',
          label: translate('auto.components.agentWorkspace.composer.thinkingQuick', 'Quick')
        },
        {
          value: 'standard',
          label: translate('auto.components.agentWorkspace.composer.thinkingStandard', 'Standard')
        },
        {
          value: 'deep',
          label: translate('auto.components.agentWorkspace.composer.thinkingDeep', 'Deep')
        }
      ]}
    />
  )
}

function ComposerToolbarSelect({
  label,
  ariaLabel,
  icon,
  value,
  options,
  onChange
}: {
  label: string
  ariaLabel: string
  icon: ReactNode
  value: string
  options: readonly { value: string; label: string; disabled?: boolean }[]
  onChange: (value: string) => void
}): React.JSX.Element {
  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 text-muted-foreground">
        {icon}
        {label}
      </span>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-28 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function AgentProviderSelect({
  agents,
  value,
  detecting,
  onChange
}: {
  agents: readonly { id: TuiAgent; label: string }[]
  value: TuiAgent | null
  detecting: boolean
  onChange: (agent: TuiAgent | null) => void
}): React.JSX.Element {
  const disabled = detecting || agents.length === 0
  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span>{translate('auto.components.agentWorkspace.composer.provider', 'Provider')}</span>
      <select
        aria-label={translate(
          'auto.components.agentWorkspace.composer.agentProvider',
          'Agent provider'
        )}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? (event.target.value as TuiAgent) : null)}
        className="h-8 max-w-44 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? (
          <option value="">
            {detecting
              ? translate(
                  'auto.components.agentWorkspace.composer.detectingAgents',
                  'Detecting agents'
                )
              : translate(
                  'auto.components.agentWorkspace.composer.noAgentsDetected',
                  'No agents detected'
                )}
          </option>
        ) : null}
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.label}
          </option>
        ))}
      </select>
      {value ? <AgentIcon agent={value} size={14} /> : null}
    </label>
  )
}
