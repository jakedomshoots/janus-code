import { useCallback, useMemo } from 'react'
import {
  buildAgentComposerContextManifest,
  removeAgentComposerBrowserContextFromPrompt,
  type AgentComposerBrowserContextSnapshot,
  type AgentComposerContextManifest
} from './agent-composer-context-manifest'
import type { AgentComposerFeedback } from './agent-composer-state'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import type { TuiAgent } from '../../../../shared/types'

export function useAgentComposerContextManifest({
  prompt,
  selectedProject,
  selectedThread,
  diffs,
  review,
  browserAnnotationMarkdown,
  browserAnnotationCount,
  browserContextSourceId,
  attachedBrowserContext,
  verificationCommand,
  agentMemoryContextEnabled,
  contextHintAgent,
  canSendToSelectedThread,
  setPrompt,
  setAttachedBrowserContext,
  setSubmitResult,
  setVerificationCommand,
  setAgentMemoryContextEnabled
}: {
  prompt: string
  selectedProject: AgentWorkspaceProject | null
  selectedThread: AgentWorkspaceThread | null
  diffs: readonly AgentWorkspaceDiffSummary[]
  review: AgentWorkspaceReviewSummary | null
  browserAnnotationMarkdown: string
  browserAnnotationCount: number
  browserContextSourceId: string | null
  attachedBrowserContext: AgentComposerBrowserContextSnapshot | null
  verificationCommand: string
  agentMemoryContextEnabled: boolean
  contextHintAgent: TuiAgent | null
  canSendToSelectedThread: boolean
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  setAttachedBrowserContext: React.Dispatch<
    React.SetStateAction<AgentComposerBrowserContextSnapshot | null>
  >
  setSubmitResult: React.Dispatch<React.SetStateAction<AgentComposerFeedback | null>>
  setVerificationCommand: React.Dispatch<React.SetStateAction<string>>
  setAgentMemoryContextEnabled: React.Dispatch<React.SetStateAction<boolean>>
}): {
  promptContextManifest: AgentComposerContextManifest
  handleRemoveBrowserContext: () => void
  handleRemoveVerificationCommand: () => void
  handleRemoveAgentMemoryContext: () => void
} {
  const promptContextManifest = useMemo(
    () =>
      buildAgentComposerContextManifest({
        prompt,
        selectedProject,
        selectedThread,
        diffs,
        review,
        browserAnnotationMarkdown,
        browserAnnotationCount,
        browserContextSourceId,
        attachedBrowserContext,
        verificationCommand,
        selectedAgent: agentMemoryContextEnabled ? contextHintAgent : null,
        canSendToSelectedThread
      }),
    [
      agentMemoryContextEnabled,
      attachedBrowserContext,
      browserAnnotationCount,
      browserAnnotationMarkdown,
      browserContextSourceId,
      canSendToSelectedThread,
      contextHintAgent,
      diffs,
      prompt,
      review,
      selectedProject,
      selectedThread,
      verificationCommand
    ]
  )

  const handleRemoveBrowserContext = useCallback((): void => {
    const browserContextMarkdown = attachedBrowserContext?.markdown ?? browserAnnotationMarkdown
    setPrompt((currentPrompt) =>
      removeAgentComposerBrowserContextFromPrompt({
        prompt: currentPrompt,
        browserAnnotationMarkdown: browserContextMarkdown
      })
    )
    setAttachedBrowserContext(null)
    setSubmitResult(null)
  }, [
    attachedBrowserContext?.markdown,
    browserAnnotationMarkdown,
    setAttachedBrowserContext,
    setPrompt,
    setSubmitResult
  ])

  const handleRemoveVerificationCommand = useCallback((): void => {
    setVerificationCommand('')
  }, [setVerificationCommand])

  const handleRemoveAgentMemoryContext = useCallback((): void => {
    setAgentMemoryContextEnabled(false)
  }, [setAgentMemoryContextEnabled])

  return {
    promptContextManifest,
    handleRemoveBrowserContext,
    handleRemoveVerificationCommand,
    handleRemoveAgentMemoryContext
  }
}
