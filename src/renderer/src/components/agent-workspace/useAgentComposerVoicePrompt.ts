import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store'
import {
  DICTATION_FINAL_INSERTED_EVENT,
  DICTATION_SESSION_FAILED_EVENT,
  requestDictationToggle,
  type DictationFinalInsertedDetail,
  type DictationSessionFailedDetail
} from '../dictation/dictation-session-events'
import type { AgentComposerVoicePromptState } from './AgentComposerVoiceButton'

export function useAgentComposerVoicePrompt({
  composerDisabled,
  textareaRef,
  voiceEnabled,
  voiceModelId
}: {
  composerDisabled: boolean
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>
  voiceEnabled: boolean
  voiceModelId: string
}): {
  voicePromptVisible: boolean
  voicePromptState: AgentComposerVoicePromptState
  voicePromptDisabled: boolean
  handleToggleVoicePrompt: () => void
} {
  const [voicePromptFeedback, setVoicePromptFeedback] =
    useState<Extract<AgentComposerVoicePromptState, 'idle' | 'inserted' | 'failed'>>('idle')
  const dictationState = useAppStore((state) => state.dictationState) ?? 'idle'
  const voicePromptVisible = voiceEnabled || voiceModelId.length > 0 || dictationState !== 'idle'
  const voicePromptConfigured = voiceEnabled && voiceModelId.length > 0
  const voicePromptState = useMemo<AgentComposerVoicePromptState>(() => {
    if (!voicePromptConfigured) {
      return 'disabled'
    }
    if (dictationState === 'starting' || dictationState === 'listening') {
      return 'recording'
    }
    if (dictationState === 'stopping') {
      return 'transcribing'
    }
    if (dictationState === 'error') {
      return 'failed'
    }
    return voicePromptFeedback
  }, [dictationState, voicePromptConfigured, voicePromptFeedback])
  const voicePromptDisabled =
    composerDisabled || !voicePromptConfigured || voicePromptState === 'transcribing'

  useEffect(() => {
    if (dictationState !== 'idle') {
      setVoicePromptFeedback('idle')
    }
  }, [dictationState])

  useEffect(() => {
    if (voicePromptFeedback === 'idle') {
      return
    }
    const timeoutId = window.setTimeout(() => setVoicePromptFeedback('idle'), 2500)
    return () => window.clearTimeout(timeoutId)
  }, [voicePromptFeedback])

  useEffect(() => {
    const handleFinalInserted = (event: Event): void => {
      const detail = (event as CustomEvent<DictationFinalInsertedDetail>).detail
      if (!detail || detail.targetElement !== textareaRef.current) {
        return
      }
      setVoicePromptFeedback('inserted')
    }

    const handleSessionFailed = (event: Event): void => {
      const detail = (event as CustomEvent<DictationSessionFailedDetail>).detail
      if (!detail || detail.targetElement !== textareaRef.current) {
        return
      }
      setVoicePromptFeedback('failed')
    }

    window.addEventListener(DICTATION_FINAL_INSERTED_EVENT, handleFinalInserted)
    window.addEventListener(DICTATION_SESSION_FAILED_EVENT, handleSessionFailed)
    return () => {
      window.removeEventListener(DICTATION_FINAL_INSERTED_EVENT, handleFinalInserted)
      window.removeEventListener(DICTATION_SESSION_FAILED_EVENT, handleSessionFailed)
    }
  }, [textareaRef])

  const handleToggleVoicePrompt = useCallback((): void => {
    if (voicePromptDisabled) {
      return
    }
    setVoicePromptFeedback('idle')
    // Why: dictation inserts into the focused DOM target, so the composer
    // must claim focus before handing control to the shared voice controller.
    textareaRef.current?.focus()
    requestDictationToggle()
  }, [textareaRef, voicePromptDisabled])

  return {
    voicePromptVisible,
    voicePromptState,
    voicePromptDisabled,
    handleToggleVoicePrompt
  }
}
