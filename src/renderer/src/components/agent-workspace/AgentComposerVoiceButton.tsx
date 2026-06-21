import { AlertCircle, CheckCircle2, Loader2, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'

export type AgentComposerVoicePromptState =
  | 'idle'
  | 'disabled'
  | 'recording'
  | 'transcribing'
  | 'inserted'
  | 'failed'

export function AgentComposerVoiceButton({
  visible,
  state,
  disabled,
  onToggle
}: {
  visible: boolean
  state: AgentComposerVoicePromptState
  disabled: boolean
  onToggle: () => void
}): React.JSX.Element | null {
  if (!visible) {
    return null
  }

  const label = getVoicePromptStateLabel(state)
  const Icon = getVoicePromptStateIcon(state)
  const spinning = state === 'transcribing'
  const pulsing = state === 'recording'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="transition-transform active:scale-[0.94]"
      disabled={disabled}
      aria-label={label}
      title={label}
      data-state={state}
      onClick={onToggle}
    >
      <Icon
        className={`size-4 ${spinning ? 'animate-spin' : ''} ${pulsing ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
    </Button>
  )
}

function getVoicePromptStateLabel(state: AgentComposerVoicePromptState): string {
  switch (state) {
    case 'idle':
      return translate('auto.components.agentWorkspace.composer.dictatePrompt', 'Dictate prompt')
    case 'disabled':
      return translate(
        'auto.components.agentWorkspace.composer.configureDictation',
        'Configure dictation in Settings > Voice'
      )
    case 'recording':
      return translate(
        'auto.components.agentWorkspace.composer.recordingVoicePrompt',
        'Recording voice prompt'
      )
    case 'transcribing':
      return translate(
        'auto.components.agentWorkspace.composer.transcribingVoicePrompt',
        'Transcribing voice prompt'
      )
    case 'inserted':
      return translate(
        'auto.components.agentWorkspace.composer.transcriptInserted',
        'Transcript inserted'
      )
    case 'failed':
      return translate(
        'auto.components.agentWorkspace.composer.dictationFailed',
        'Dictation failed'
      )
  }
}

function getVoicePromptStateIcon(state: AgentComposerVoicePromptState): typeof Mic {
  switch (state) {
    case 'transcribing':
      return Loader2
    case 'inserted':
      return CheckCircle2
    case 'failed':
      return AlertCircle
    case 'idle':
    case 'disabled':
    case 'recording':
      return Mic
  }
}
