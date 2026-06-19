import { useCallback } from 'react'
import { translate } from '@/i18n/i18n'
import { stripInjectedBrowserGrabDump } from '../browser-pane/strip-browser-grab-dump'
import type { AgentComposerFeedback } from './agent-composer-state'

export function useAgentComposerBrowserContextAttachment({
  browserAnnotationMarkdown,
  setPrompt,
  setSubmitResult
}: {
  browserAnnotationMarkdown: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  setSubmitResult: React.Dispatch<React.SetStateAction<AgentComposerFeedback | null>>
}): () => void {
  return useCallback((): void => {
    if (!browserAnnotationMarkdown) {
      return
    }
    setPrompt((currentPrompt) => {
      const cleanedCurrent = stripInjectedBrowserGrabDump(currentPrompt)
      return cleanedCurrent
        ? `${cleanedCurrent}\n\n${browserAnnotationMarkdown}`
        : browserAnnotationMarkdown
    })
    setSubmitResult({
      status: 'sent',
      message: translate(
        'auto.components.agentWorkspace.composer.browserContextAttached',
        'Browser context attached.'
      )
    })
  }, [browserAnnotationMarkdown, setPrompt, setSubmitResult])
}
