import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function useCompletedThreadRecoveryCleanup({
  recoverablePrompt,
  pendingTranscriptPrompt,
  restoredRecoverablePrompt,
  timeline,
  setPrompt,
  setPendingTranscriptPrompt,
  setRestoredRecoverablePrompt,
  setRecoverablePrompt,
  setSubmitResult
}: {
  recoverablePrompt: string | null
  pendingTranscriptPrompt: string | null
  restoredRecoverablePrompt: string | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  setPrompt: Dispatch<SetStateAction<string>>
  setPendingTranscriptPrompt: Dispatch<SetStateAction<string | null>>
  setRestoredRecoverablePrompt: Dispatch<SetStateAction<string | null>>
  setRecoverablePrompt: Dispatch<SetStateAction<string | null>>
  setSubmitResult: Dispatch<SetStateAction<AgentComposerFeedback | null>>
}): void {
  useEffect(() => {
    const promptToMatch = recoverablePrompt ?? restoredRecoverablePrompt
    if (!promptToMatch) {
      return
    }
    const userEntryIndex = timeline.findLastIndex(
      (entry) => entry.kind === 'user' && entry.text.trim() === promptToMatch.trim()
    )
    const hasAgentReply =
      userEntryIndex >= 0 &&
      timeline.slice(userEntryIndex + 1).some((entry) => entry.kind === 'agent')
    if (hasAgentReply) {
      // Why: if a restored recovery draft is now represented in the transcript,
      // leaving the unchanged text armed for resend makes the completed turn feel broken.
      setPrompt((currentPrompt) =>
        currentPrompt.trim() === promptToMatch.trim() ? '' : currentPrompt
      )
      setRestoredRecoverablePrompt(null)
      setRecoverablePrompt(null)
      setSubmitResult(null)
    }
  }, [
    recoverablePrompt,
    restoredRecoverablePrompt,
    setPrompt,
    setRestoredRecoverablePrompt,
    setRecoverablePrompt,
    setSubmitResult,
    timeline
  ])

  useEffect(() => {
    if (!pendingTranscriptPrompt) {
      return
    }
    const hasVisibleUserEntry = timeline.some(
      (entry) =>
        entry.kind === 'user' &&
        entry.status !== 'failed' &&
        entry.text.trim() === pendingTranscriptPrompt.trim()
    )
    if (!hasVisibleUserEntry) {
      return
    }
    // Why: transcript evidence can arrive before launch delivery callbacks in
    // recovered threads; clear only if the user has not edited the draft.
    setPrompt((currentPrompt) =>
      currentPrompt.trim() === pendingTranscriptPrompt.trim() ? '' : currentPrompt
    )
    setPendingTranscriptPrompt(null)
  }, [pendingTranscriptPrompt, setPendingTranscriptPrompt, setPrompt, timeline])
}
