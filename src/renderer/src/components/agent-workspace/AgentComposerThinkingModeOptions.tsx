import { translate } from '@/i18n/i18n'
import type { TuiAgentThinkingMode } from '../../../../shared/tui-agent-thinking'
import { ChatDropdownOption } from './AgentComposerChatDropdown'

export function AgentComposerThinkingModeOptions({
  value,
  onChange
}: {
  value: TuiAgentThinkingMode
  onChange: (mode: TuiAgentThinkingMode) => void
}): React.JSX.Element {
  const options: readonly { value: TuiAgentThinkingMode; label: string }[] = [
    {
      value: 'quick',
      label: translate('auto.components.agentWorkspace.composer.reasoningLow', 'Low')
    },
    {
      value: 'standard',
      label: translate('auto.components.agentWorkspace.composer.reasoningMedium', 'Medium')
    },
    {
      value: 'deep',
      label: translate('auto.components.agentWorkspace.composer.reasoningHigh', 'High')
    }
  ]

  return (
    <>
      {options.map((option) => (
        <ChatDropdownOption
          key={option.value}
          label={option.label}
          selected={option.value === value}
          ariaLabel={translate(
            'auto.components.agentWorkspace.composer.setReasoning',
            'Set reasoning: {{label}}',
            { label: option.label }
          )}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </>
  )
}
