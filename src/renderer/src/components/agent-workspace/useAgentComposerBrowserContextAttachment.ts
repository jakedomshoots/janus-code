import { useCallback } from 'react'
import { translate } from '@/i18n/i18n'
import { stripInjectedBrowserGrabDump } from '../browser-pane/strip-browser-grab-dump'
import type { AgentComposerBrowserContextSnapshot } from './agent-composer-context-manifest'
import type { AgentComposerFeedback } from './agent-composer-state'

export function useAgentComposerBrowserContextAttachment({
  browserAnnotationMarkdown,
  browserAnnotationCount,
  browserContextSourceId,
  onBrowserContextAttached,
  setPrompt,
  setSubmitResult
}: {
  browserAnnotationMarkdown: string
  browserAnnotationCount: number
  browserContextSourceId?: string | null
  onBrowserContextAttached?: (context: AgentComposerBrowserContextSnapshot) => void
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
    onBrowserContextAttached?.({
      markdown: browserAnnotationMarkdown,
      annotationCount: browserAnnotationCount,
      sourceId: browserContextSourceId ?? null
    })
    setSubmitResult({
      status: 'sent',
      message: translate(
        'auto.components.agentWorkspace.composer.browserContextAttached',
        'Browser context attached.'
      )
    })
  }, [
    browserAnnotationCount,
    browserAnnotationMarkdown,
    browserContextSourceId,
    onBrowserContextAttached,
    setPrompt,
    setSubmitResult
  ])
}
