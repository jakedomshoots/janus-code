import { useCallback } from 'react'
import { stripInjectedBrowserGrabDump } from '../browser-pane/strip-browser-grab-dump'
import { handleAgentComposerPaste } from './agent-composer-paste'
import type { AgentComposerFeedback } from './agent-composer-state'

export function useAgentComposerTextInput({
  prompt,
  canSubmit,
  submitResult,
  handleSubmit,
  setPrompt,
  setRecoverablePrompt,
  setSubmitResult
}: {
  prompt: string
  canSubmit: boolean
  submitResult: AgentComposerFeedback | null
  handleSubmit: () => Promise<void>
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  setRecoverablePrompt: React.Dispatch<React.SetStateAction<string | null>>
  setSubmitResult: React.Dispatch<React.SetStateAction<AgentComposerFeedback | null>>
}): {
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  handlePaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void
  handlePromptChange: (value: string) => void
} {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
        return
      }
      event.preventDefault()
      if (canSubmit) {
        void handleSubmit()
      }
    },
    [canSubmit, handleSubmit]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      handleAgentComposerPaste({ event, prompt, setPrompt })
    },
    [prompt, setPrompt]
  )

  const handlePromptChange = useCallback(
    (value: string): void => {
      setPrompt(stripInjectedBrowserGrabDump(value))
      setRecoverablePrompt(null)
      if (submitResult?.status === 'sent' || submitResult?.reason === 'empty') {
        setSubmitResult(null)
      }
    },
    [setPrompt, setRecoverablePrompt, setSubmitResult, submitResult?.reason, submitResult?.status]
  )

  return {
    handleKeyDown,
    handlePaste,
    handlePromptChange
  }
}
