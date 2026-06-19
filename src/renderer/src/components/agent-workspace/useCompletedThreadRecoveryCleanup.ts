import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { AgentComposerFeedback } from './agent-composer-state'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

export function useCompletedThreadRecoveryCleanup({
  recoverablePrompt,
  timeline,
  setRecoverablePrompt,
  setSubmitResult
}: {
  recoverablePrompt: string | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  setRecoverablePrompt: Dispatch<SetStateAction<string | null>>
  setSubmitResult: Dispatch<SetStateAction<AgentComposerFeedback | null>>
}): void {
  useEffect(() => {
    if (!recoverablePrompt) {
      return
    }
    const userEntryIndex = timeline.findLastIndex(
      (entry) => entry.kind === 'user' && entry.text.trim() === recoverablePrompt.trim()
    )
    const hasAgentReply =
      userEntryIndex >= 0 &&
      timeline.slice(userEntryIndex + 1).some((entry) => entry.kind === 'agent')
    if (hasAgentReply) {
      setRecoverablePrompt(null)
      setSubmitResult(null)
    }
  }, [recoverablePrompt, setRecoverablePrompt, setSubmitResult, timeline])
}
