import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceProject,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { getTuiAgentSlashCommands } from '../../../../shared/tui-agent-slash-commands'
import type { TuiAgent } from '../../../../shared/types'

export type AgentComposerContextManifestItem =
  | {
      readonly id: 'workspace-context'
      readonly kind: 'workspace'
      readonly label: string
      readonly path: string
      readonly hostKind: AgentWorkspaceProject['hostKind']
      readonly branchName?: string | null
      readonly stale: boolean
    }
  | {
      readonly id: 'selected-thread-context'
      readonly kind: 'thread'
      readonly title: string
      readonly agentKind: AgentWorkspaceThread['agentKind']
      readonly phase: AgentWorkspaceThread['phase']
      readonly stale: boolean
    }
  | {
      readonly id: 'browser-context'
      readonly kind: 'browser'
      readonly annotationCount: number
      readonly stale: boolean
    }
  | {
      readonly id: 'changes-context'
      readonly kind: 'changes'
      readonly fileCount: number
      readonly additions: number
      readonly deletions: number
      readonly stale: boolean
    }
  | {
      readonly id: 'review-context'
      readonly kind: 'review'
      readonly providerLabel: string
      readonly number: number
      readonly title: string
      readonly stale: boolean
    }
  | {
      readonly id: 'verification-command'
      readonly kind: 'verification'
      readonly command: string
    }
  | {
      readonly id: 'agent-memory-context'
      readonly kind: 'memory'
      readonly command: '/memory'
    }

export type AgentComposerContextManifest = {
  readonly items: readonly AgentComposerContextManifestItem[]
}

export type AgentComposerBrowserContextSnapshot = {
  readonly markdown: string
  readonly annotationCount: number
  readonly sourceId?: string | null
}

function getTrimmedValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isAttachedBrowserContextStale({
  attachedBrowserContext,
  browserAnnotationMarkdown,
  browserAnnotationCount,
  browserContextSourceId
}: {
  attachedBrowserContext: AgentComposerBrowserContextSnapshot
  browserAnnotationMarkdown: string
  browserAnnotationCount: number
  browserContextSourceId?: string | null
}): boolean {
  const attachedMarkdown = getTrimmedValue(attachedBrowserContext.markdown)
  const currentMarkdown = getTrimmedValue(browserAnnotationMarkdown)
  if (attachedMarkdown !== currentMarkdown) {
    return true
  }
  if (attachedBrowserContext.annotationCount !== browserAnnotationCount) {
    return true
  }
  if (
    attachedBrowserContext.sourceId &&
    attachedBrowserContext.sourceId !== browserContextSourceId
  ) {
    return true
  }
  return false
}

export function buildAgentComposerContextManifest({
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
  selectedAgent,
  canSendToSelectedThread
}: {
  prompt: string
  selectedProject?: AgentWorkspaceProject | null
  selectedThread?: AgentWorkspaceThread | null
  diffs?: readonly AgentWorkspaceDiffSummary[]
  review?: AgentWorkspaceReviewSummary | null
  browserAnnotationMarkdown: string
  browserAnnotationCount: number
  browserContextSourceId?: string | null
  attachedBrowserContext?: AgentComposerBrowserContextSnapshot | null
  verificationCommand: string
  selectedAgent?: TuiAgent | null
  canSendToSelectedThread: boolean
}): AgentComposerContextManifest {
  const items: AgentComposerContextManifestItem[] = []
  if (selectedProject) {
    items.push({
      id: 'workspace-context',
      kind: 'workspace',
      label: selectedProject.label,
      path: selectedProject.path,
      hostKind: selectedProject.hostKind,
      branchName: selectedProject.branchName,
      stale:
        selectedThread?.branchName && selectedProject.branchName
          ? selectedThread.branchName !== selectedProject.branchName
          : false
    })
  }

  if (selectedThread) {
    items.push({
      id: 'selected-thread-context',
      kind: 'thread',
      title: selectedThread.title,
      agentKind: selectedThread.agentKind,
      phase: selectedThread.phase,
      stale: selectedProject ? selectedProject.id !== selectedThread.worktreeId : false
    })
  }

  if (diffs && diffs.length > 0) {
    items.push({
      id: 'changes-context',
      kind: 'changes',
      fileCount: diffs.length,
      additions: diffs.reduce((sum, diff) => sum + diff.additions, 0),
      deletions: diffs.reduce((sum, diff) => sum + diff.deletions, 0),
      stale: selectedThread ? diffs.some((diff) => diff.threadId !== selectedThread.id) : false
    })
  }

  if (review) {
    const selectedWorktreeId = selectedThread?.worktreeId ?? selectedProject?.id ?? null
    items.push({
      id: 'review-context',
      kind: 'review',
      providerLabel: review.providerLabel,
      number: review.number,
      title: review.title,
      stale: selectedWorktreeId ? review.worktreeId !== selectedWorktreeId : false
    })
  }

  const browserContext = getTrimmedValue(
    attachedBrowserContext?.markdown ?? browserAnnotationMarkdown
  )
  if (browserContext && prompt.includes(browserContext)) {
    items.push({
      id: 'browser-context',
      kind: 'browser',
      annotationCount: attachedBrowserContext?.annotationCount ?? browserAnnotationCount,
      stale: attachedBrowserContext
        ? isAttachedBrowserContextStale({
            attachedBrowserContext,
            browserAnnotationMarkdown,
            browserAnnotationCount,
            browserContextSourceId
          })
        : false
    })
  }

  const trimmedVerificationCommand = getTrimmedValue(verificationCommand)
  if (!canSendToSelectedThread && trimmedVerificationCommand) {
    items.push({
      id: 'verification-command',
      kind: 'verification',
      command: trimmedVerificationCommand
    })
  }

  if (getTrimmedValue(prompt) && selectedAgent && agentSupportsMemoryCommand(selectedAgent)) {
    items.push({
      id: 'agent-memory-context',
      kind: 'memory',
      command: '/memory'
    })
  }

  return { items }
}

function agentSupportsMemoryCommand(agent: TuiAgent): boolean {
  return getTuiAgentSlashCommands(agent).some((command) => command.command === '/memory')
}

export function removeAgentComposerBrowserContextFromPrompt({
  prompt,
  browserAnnotationMarkdown
}: {
  prompt: string
  browserAnnotationMarkdown: string
}): string {
  const browserContext = getTrimmedValue(browserAnnotationMarkdown)
  if (!browserContext || !prompt.includes(browserContext)) {
    return prompt
  }
  return prompt
    .replace(browserContext, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
