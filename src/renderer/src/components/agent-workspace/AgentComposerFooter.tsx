import { ArrowUp, Brain, Loader2, PanelBottom, PanelRightOpen, ShieldCheck } from 'lucide-react'
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
  onOpenRightPanel,
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
  onOpenRightPanel?: () => void
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
    <div className="px-4 pb-3">
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
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <PermissionModeSelect value={permissionMode} onChange={onPermissionModeChange} />
          <ThinkingModeSelect value={thinkingMode} onChange={onThinkingModeChange} />
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={typeof onOpenRightPanel !== 'function'}
            aria-label={translate(
              'auto.components.agentWorkspace.composer.openPanes',
              'Open panes'
            )}
            onClick={() => onOpenRightPanel?.()}
          >
            <PanelRightOpen className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.composer.panes', 'Panes')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canOpenTerminalDrawer}
            aria-label={translate(
              'auto.components.agentWorkspace.composer.openTerminalDrawer',
              'Open terminal drawer'
            )}
            onClick={() => onOpenTerminalDrawer?.('debug-button')}
          >
            <PanelBottom className="size-4" aria-hidden="true" />
          </Button>
          {canSendToSelectedThread ? (
            <div className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground">
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
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
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
          label: translate('auto.components.agentWorkspace.composer.permissionYolo', 'Full access')
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
    <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 text-muted-foreground/90">
        {icon}
        {label}
      </span>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 min-w-24 border-0 bg-transparent px-1 text-xs font-medium text-foreground outline-none transition-[color,box-shadow] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
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
    <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground">
      <span>{translate('auto.components.agentWorkspace.composer.provider', 'Provider')}</span>
      <select
        aria-label={translate(
          'auto.components.agentWorkspace.composer.agentProvider',
          'Agent provider'
        )}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? (event.target.value as TuiAgent) : null)}
        className="h-7 max-w-44 border-0 bg-transparent px-1 text-xs font-medium text-foreground outline-none transition-[color,box-shadow] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
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
