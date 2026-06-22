import { ChevronDown, Loader2, Search, Settings2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { translate } from '@/i18n/i18n'
import { AgentIcon } from '@/lib/agent-catalog'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import {
  TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
  type TuiAgentModelOption
} from '../../../../shared/tui-agent-models'
import type { RateLimitState } from '../../../../shared/rate-limit-types'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import type { TuiAgent } from '../../../../shared/types'
import {
  ChatDropdownBranch,
  ChatDropdownContent,
  ChatDropdownOption,
  ChatDropdownSection,
  ChatDropdownSeparator
} from './AgentComposerChatDropdown'
import { AgentComposerThinkingModeOptions } from './AgentComposerThinkingModeOptions'
import {
  agentModelOptionMatchesQuery,
  groupAgentModelOptionsByProvider
} from './agent-model-option-groups'
import { getAgentProviderTaskFitDescription } from './agent-provider-task-fit-labels'
import { getAgentProviderUsageWarning } from './agent-provider-usage-warning'

type AgentSettingsMenuView = 'main' | 'provider' | 'model'

export function AgentComposerAgentSettingsPopover({
  thinkingMode,
  onThinkingModeChange,
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
  onSelectedModelChange
}: {
  thinkingMode: TuiAgentThinkingMode
  onThinkingModeChange: (mode: TuiAgentThinkingMode) => void
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
}): React.JSX.Element {
  const [view, setView] = useState<AgentSettingsMenuView>('main')
  const providerLabel = selectedAgent ? formatAgentTypeLabel(selectedAgent) : 'Agent'
  const settingsBusy = detectingAgents || modelDiscoveryLoading
  const modelLabel =
    modelOptions.find((option) => option.id === selectedModel)?.label ??
    (selectedModel !== 'provider-default' ? selectedModel : null) ??
    translate('auto.components.agentWorkspace.composer.providerDefault', 'Provider default')

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          setView('main')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="agent-composer-agent-settings-trigger h-9 max-w-56 justify-start gap-2 rounded-none px-3 text-xs"
          aria-label={translate(
            'auto.components.agentWorkspace.composer.agentSettings',
            'Agent settings'
          )}
          title={translate(
            'auto.components.agentWorkspace.composer.agentSettings',
            'Agent settings'
          )}
        >
          {selectedAgent ? (
            <AgentIcon agent={selectedAgent} size={14} />
          ) : (
            <Settings2 className="size-3.5" aria-hidden="true" />
          )}
          <span className="agent-composer-agent-settings-label truncate">{providerLabel}</span>
          {settingsBusy ? (
            <Loader2
              className="ml-1 size-3.5 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          ) : null}
          <ChevronDown
            className="agent-composer-agent-settings-chevron ml-1 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <ChatDropdownContent
        align="end"
        side="top"
        sideOffset={10}
        className={view === 'model' ? 'w-[min(92vw,520px)]' : undefined}
      >
        {view === 'provider' ? (
          <ChatDropdownSection
            title={translate('auto.components.agentWorkspace.composer.provider', 'Provider')}
          >
            <AgentProviderOptions
              agents={availableAgents}
              value={selectedAgent}
              taskFitHintsEnabled={taskFitHintsEnabled}
              providerRateLimits={providerRateLimits}
              detecting={detectingAgents}
              onChange={(agent) => {
                onSelectedAgentChange(agent)
                setView('main')
              }}
            />
          </ChatDropdownSection>
        ) : null}
        {view === 'model' ? (
          <ChatDropdownSection
            title={translate('auto.components.agentWorkspace.composer.model', 'Model')}
          >
            <AgentModelOptions
              options={modelOptions}
              value={selectedModel}
              disabled={!selectedAgent}
              loading={modelDiscoveryLoading}
              error={modelDiscoveryError}
              onChange={(model) => {
                onSelectedModelChange(model)
                setView('main')
              }}
            />
          </ChatDropdownSection>
        ) : null}
        {view === 'main' ? (
          <>
            <ChatDropdownSection
              title={translate('auto.components.agentWorkspace.composer.reasoning', 'Reasoning')}
            >
              <AgentComposerThinkingModeOptions
                value={thinkingMode}
                onChange={onThinkingModeChange}
              />
            </ChatDropdownSection>
            <ChatDropdownSeparator />
            <ChatDropdownBranch
              label={translate('auto.components.agentWorkspace.composer.model', 'Model')}
              value={modelLabel}
              ariaLabel={translate(
                'auto.components.agentWorkspace.composer.openModelMenu',
                'Open model menu'
              )}
              onOpen={() => setView('model')}
            />
            <ChatDropdownBranch
              label={translate('auto.components.agentWorkspace.composer.provider', 'Provider')}
              value={providerLabel}
              ariaLabel={translate(
                'auto.components.agentWorkspace.composer.openProviderMenu',
                'Open provider menu'
              )}
              onOpen={() => setView('provider')}
            />
          </>
        ) : null}
      </ChatDropdownContent>
    </Popover>
  )
}

function AgentModelOptions({
  options,
  value,
  disabled,
  loading,
  error,
  onChange
}: {
  options: readonly TuiAgentModelOption[]
  value: string
  disabled: boolean
  loading: boolean
  error: string | null
  onChange: (modelId: string) => void
}): React.JSX.Element {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions = useMemo<readonly TuiAgentModelOption[]>(
    () =>
      options.length > 0
        ? options
        : [
            {
              id: TUI_AGENT_PROVIDER_DEFAULT_MODEL_ID,
              label: translate(
                'auto.components.agentWorkspace.composer.providerDefault',
                'Provider default'
              )
            }
          ],
    [options]
  )
  const filteredOptions = useMemo(
    () =>
      normalizedQuery
        ? visibleOptions.filter((option) => agentModelOptionMatchesQuery(option, normalizedQuery))
        : visibleOptions,
    [normalizedQuery, visibleOptions]
  )
  const groupedOptions = useMemo(
    () => groupAgentModelOptionsByProvider(filteredOptions),
    [filteredOptions]
  )

  if (disabled) {
    return (
      <ChatDropdownOption
        label={translate(
          'auto.components.agentWorkspace.composer.providerDefault',
          'Provider default'
        )}
        selected
        disabled
      />
    )
  }

  return (
    <div className="grid gap-1">
      <div className="relative px-1 pb-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          className="h-9 rounded-xl bg-background pl-8 text-sm"
          placeholder={translate('auto.components.agentWorkspace.composer.searchModels', 'Search')}
          aria-label={translate(
            'auto.components.agentWorkspace.composer.searchModelsLabel',
            'Search models'
          )}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex h-8 items-center gap-2 px-2.5 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.composer.loadingModels', 'Loading models...')}
        </div>
      ) : null}
      {error ? <div className="px-2.5 py-1 text-xs text-muted-foreground">{error}</div> : null}
      <div className="scrollbar-sleek max-h-[360px] overflow-y-auto pr-1" role="listbox">
        {groupedOptions.length > 0 ? (
          groupedOptions.map((group) => (
            <div key={group.category.id} className="grid gap-1 py-1 first:pt-0">
              <div className="flex items-center justify-between gap-2 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <span className="truncate">{group.category.label}</span>
                <span className="shrink-0 tabular-nums">{group.options.length}</span>
              </div>
              {group.options.map((option) => (
                <ChatDropdownOption
                  key={option.id}
                  label={option.label}
                  description={
                    option.id === option.label || option.id === 'provider-default'
                      ? undefined
                      : option.id
                  }
                  selected={option.id === value}
                  ariaLabel={translate(
                    'auto.components.agentWorkspace.composer.setModel',
                    'Set model: {{label}}',
                    { label: option.label }
                  )}
                  onSelect={() => onChange(option.id)}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="px-2.5 py-3 text-sm text-muted-foreground">
            {translate('auto.components.agentWorkspace.composer.noModelsFound', 'No models found.')}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentProviderOptions({
  agents,
  value,
  taskFitHintsEnabled,
  providerRateLimits,
  detecting,
  onChange
}: {
  agents: readonly { id: TuiAgent; label: string }[]
  value: TuiAgent | null
  taskFitHintsEnabled: boolean
  providerRateLimits: RateLimitState
  detecting: boolean
  onChange: (agent: TuiAgent | null) => void
}): React.JSX.Element {
  const disabled = detecting || agents.length === 0
  if (disabled) {
    return (
      <ChatDropdownOption
        label={
          detecting
            ? translate(
                'auto.components.agentWorkspace.composer.detectingAgents',
                'Detecting agents'
              )
            : translate(
                'auto.components.agentWorkspace.composer.noAgentsDetected',
                'No agents detected'
              )
        }
        selected
        disabled
      />
    )
  }

  return (
    <>
      {agents.map((agent) => (
        <ChatDropdownOption
          key={agent.id}
          label={agent.label}
          description={getAgentProviderDescription({
            agent: agent.id,
            taskFitHintsEnabled,
            providerRateLimits
          })}
          selected={agent.id === value}
          leading={<AgentIcon agent={agent.id} size={16} />}
          ariaLabel={translate(
            'auto.components.agentWorkspace.composer.setAgentProvider',
            'Set agent provider: {{label}}',
            { label: agent.label }
          )}
          onSelect={() => onChange(agent.id)}
        />
      ))}
    </>
  )
}

function getAgentProviderDescription({
  agent,
  taskFitHintsEnabled,
  providerRateLimits
}: {
  agent: TuiAgent
  taskFitHintsEnabled: boolean
  providerRateLimits: RateLimitState
}): string | undefined {
  const descriptions = [
    taskFitHintsEnabled ? getAgentProviderTaskFitDescription(agent) : undefined,
    getAgentProviderUsageWarning(agent, providerRateLimits)
  ].filter(Boolean)

  return descriptions.length > 0 ? descriptions.join(' · ') : undefined
}
