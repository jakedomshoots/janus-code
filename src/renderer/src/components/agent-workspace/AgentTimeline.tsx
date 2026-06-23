import { useEffect, useRef } from 'react'
import {
  Bot,
  CheckCircle2,
  Clock3,
  GitBranch,
  Globe,
  MessageSquareText,
  PanelBottom,
  Plus
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import { AgentTimelineEntry } from './AgentTimelineEntry'
import { AgentEditedFilesCard } from './AgentTimelineArtifactCards'
import { formatAgentWorkspacePhase } from './agent-workspace-labels'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import type { AgentTimelineMarkdownArtifact } from './agent-timeline-artifacts'

const EMPTY_DIFFS: readonly AgentWorkspaceDiffSummary[] = []

export function AgentTimeline({
  thread,
  timeline,
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  onOpenMarkdownArtifact,
  onReviewDiffs,
  diffs = EMPTY_DIFFS,
  browserAvailable = false,
  terminalAvailable = false
}: {
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
  onOpenMarkdownArtifact?: (artifact: AgentTimelineMarkdownArtifact) => void
  onReviewDiffs?: () => void
  diffs?: readonly AgentWorkspaceDiffSummary[]
  browserAvailable?: boolean
  terminalAvailable?: boolean
}): React.JSX.Element {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const editedFilesCard = getEditedFilesCardPlacement(timeline, diffs)
  const timelineScrollKey = getTimelineScrollKey(timeline)

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea || !thread) {
      return
    }
    scrollArea.scrollTop = scrollArea.scrollHeight
  }, [thread, timelineScrollKey])

  return (
    <div
      ref={scrollAreaRef}
      className="agent-workspace-timeline scrollbar-sleek flex min-h-0 flex-1 flex-col overflow-auto px-6 py-6"
      role="log"
      aria-label={translate(
        'auto.components.agentWorkspace.layout.agentConversationTimeline',
        'Agent conversation timeline'
      )}
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="agent-workspace-timeline-inner mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-5">
        {thread ? (
          <>
            <ThreadSummary thread={thread} />
            {timeline.length === 0 && diffs.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                {translate(
                  'auto.components.agentWorkspace.layout.timelineEventsWillAppear',
                  'Timeline events will appear here as the agent works.'
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-2">
                {timeline.length === 0 ? (
                  <AgentEditedFilesCard diffs={diffs} onReview={onReviewDiffs} />
                ) : null}
                {timeline.map((entry) => (
                  <div key={entry.id} className="contents">
                    <AgentTimelineEntry
                      entry={entry}
                      cwd={thread.cwd}
                      worktreeId={thread.worktreeId}
                      onOpenMarkdownArtifact={onOpenMarkdownArtifact}
                    />
                    {entry.id === editedFilesCard?.ownerId ? (
                      <AgentEditedFilesCard
                        diffs={editedFilesCard.diffs}
                        onReview={onReviewDiffs}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <WorkbenchEmptyState
            onNewSession={onNewSession}
            onOpenBrowserWorkbench={onOpenBrowserWorkbench}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
            browserAvailable={browserAvailable}
            terminalAvailable={terminalAvailable}
          />
        )}
      </div>
    </div>
  )
}

function getTimelineScrollKey(timeline: readonly AgentWorkspaceTimelineEntry[]): string {
  const latestEntry = timeline.at(-1)
  if (!latestEntry) {
    return '0'
  }

  // Streamed assistant previews grow in place, so row count alone misses new text.
  return [
    timeline.length,
    latestEntry.id,
    latestEntry.status ?? '',
    latestEntry.text.length,
    latestEntry.text.slice(-120)
  ].join('|')
}

function getEditedFilesCardPlacement(
  timeline: readonly AgentWorkspaceTimelineEntry[],
  diffs: readonly AgentWorkspaceDiffSummary[]
): { readonly ownerId: string; readonly diffs: readonly AgentWorkspaceDiffSummary[] } | null {
  if (diffs.length === 0) {
    return null
  }

  const matchingAgent = findLastTimelineEntryIndex(
    timeline,
    (entry) => entry.kind === 'agent' && doesAgentTextMentionAnyDiff(entry.text, diffs)
  )

  const owner = matchingAgent === -1 ? null : timeline[matchingAgent]
  if (!owner) {
    return null
  }

  const matchingDiffs = getDiffsMentionedByAgentText(owner.text, diffs)
  return matchingDiffs.length > 0 ? { ownerId: owner.id, diffs: matchingDiffs } : null
}

function findLastTimelineEntryIndex(
  timeline: readonly AgentWorkspaceTimelineEntry[],
  predicate: (entry: AgentWorkspaceTimelineEntry) => boolean
): number {
  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    const entry = timeline[index]
    if (entry && predicate(entry)) {
      return index
    }
  }
  return -1
}

function doesAgentTextMentionAnyDiff(
  text: string,
  diffs: readonly AgentWorkspaceDiffSummary[]
): boolean {
  return getDiffsMentionedByAgentText(text, diffs).length > 0
}

function getDiffsMentionedByAgentText(
  text: string,
  diffs: readonly AgentWorkspaceDiffSummary[]
): readonly AgentWorkspaceDiffSummary[] {
  const normalizedText = text.replaceAll('\\', '/')
  return diffs.filter((diff) => {
    const filePath = diff.filePath.replaceAll('\\', '/')
    const fileName = filePath.split('/').filter(Boolean).at(-1)
    return (
      normalizedText.includes(filePath) || (fileName ? normalizedText.includes(fileName) : false)
    )
  })
}

function WorkbenchEmptyState({
  onNewSession,
  onOpenBrowserWorkbench,
  onOpenTerminalDrawer,
  browserAvailable,
  terminalAvailable
}: {
  onNewSession?: () => void
  onOpenBrowserWorkbench?: () => void
  onOpenTerminalDrawer?: () => void
  browserAvailable: boolean
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
      <h2 className="text-2xl font-semibold text-foreground">
        {translate('auto.components.agentWorkspace.layout.janusCode', 'Janus Code')}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {typeof onNewSession === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onNewSession}
          >
            <Plus className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.newSession', 'New session')}
          </Button>
        ) : null}
        {browserAvailable && typeof onOpenBrowserWorkbench === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onOpenBrowserWorkbench}
          >
            <Globe className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.openBrowser', 'Browser')}
          </Button>
        ) : null}
        {terminalAvailable && typeof onOpenTerminalDrawer === 'function' ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-xl px-4 transition-transform active:scale-[0.98]"
            onClick={onOpenTerminalDrawer}
          >
            <PanelBottom className="size-4" aria-hidden="true" />
            {translate('auto.components.agentWorkspace.layout.openTerminal', 'Terminal')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function ThreadSummary({ thread }: { thread: AgentWorkspaceThread }): React.JSX.Element {
  const isFollowUpReady = thread.phase === 'completed'

  return (
    <div className="rounded-xl border border-border bg-card/80 px-4 py-3 shadow-xs">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MessageSquareText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 className="truncate text-sm font-semibold text-foreground">{thread.title}</h2>
        </div>
        <Badge variant="outline" className="h-6 gap-1.5 px-2 text-[11px] font-medium">
          {isFollowUpReady ? <CheckCircle2 className="size-3" aria-hidden="true" /> : null}
          {formatAgentWorkspacePhase(thread.phase)}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Bot className="size-3" aria-hidden="true" />
          {formatAgentTypeLabel(thread.agentKind)}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="size-3" aria-hidden="true" />
          {thread.branchName ??
            translate('auto.components.agentWorkspace.layout.noBranch', 'No branch')}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 className="size-3" aria-hidden="true" />
          {thread.updatedAt ??
            translate('auto.components.agentWorkspace.layout.noUpdatesYet', 'No updates yet')}
        </span>
      </div>
      {isFollowUpReady ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {translate(
            'auto.components.agentWorkspace.layout.completedThreadFollowUp',
            'This conversation is complete, but you can keep chatting in the same thread.'
          )}
        </p>
      ) : null}
    </div>
  )
}
