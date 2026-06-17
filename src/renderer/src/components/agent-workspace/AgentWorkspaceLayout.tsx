import { AlertTriangle, Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { detectLanguage } from '@/lib/language-detect'
import { joinPath } from '@/lib/path'
import { useAppStore } from '@/store'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceApproval,
  AgentWorkspaceReviewSummary,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import { AgentWorkspaceThreadTabs } from './AgentWorkspaceThreadTabs'
import { AgentTimeline } from './AgentTimeline'
import {
  getDefaultAgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelStateInput,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { selectAgentWorkspacePlanForThread } from './orca-agent-plan-selectors'
import { useAgentWorkspaceSourceControlActions } from './useAgentWorkspaceSourceControlActions'

function getSelectedProject(snapshot: AgentWorkspaceSnapshot): AgentWorkspaceProject | null {
  return (
    snapshot.projects.find((project) => project.id === snapshot.activeWorktreeId) ??
    snapshot.projects[0] ??
    null
  )
}

function getProjectThreads(
  snapshot: AgentWorkspaceSnapshot,
  project: AgentWorkspaceProject | null
): readonly AgentWorkspaceThread[] {
  return project
    ? snapshot.threads.filter((thread) => thread.worktreeId === project.id)
    : snapshot.threads
}

function getThreadTimeline(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceTimelineEntry[] {
  return thread ? snapshot.timeline.filter((entry) => entry.threadId === thread.id) : []
}

function getThreadDiffs(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): readonly AgentWorkspaceDiffSummary[] {
  return thread ? snapshot.diffs.filter((diff) => diff.threadId === thread.id) : []
}

function getThreadApproval(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): AgentWorkspaceApproval | null {
  return thread
    ? (snapshot.approvals.find((approval) => approval.threadId === thread.id) ?? null)
    : null
}

function getThreadReview(
  snapshot: AgentWorkspaceSnapshot,
  thread: AgentWorkspaceThread | null
): AgentWorkspaceReviewSummary | null {
  return thread
    ? ((snapshot.reviews ?? []).find((review) => review.worktreeId === thread.worktreeId) ?? null)
    : null
}

function getRightPanelStateInput(
  thread: AgentWorkspaceThread | null,
  diffs: readonly AgentWorkspaceDiffSummary[],
  plan: AgentWorkspacePlan | null,
  review: AgentWorkspaceReviewSummary | null
): AgentWorkspaceRightPanelStateInput {
  return {
    thread,
    diffs,
    review,
    hasStructuredPlan: plan !== null
  }
}

function getRightPanelStateInputKey({
  thread,
  diffs,
  review,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): string {
  return [
    thread?.id ?? 'no-thread',
    thread?.phase ?? 'no-phase',
    hasStructuredPlan ? 'plan' : 'no-plan',
    review?.id ?? 'no-review',
    diffs.map((diff) => diff.id).join(',')
  ].join(':')
}

function AgentFailureTerminalBanner({
  thread,
  terminalAvailable,
  onOpenTerminalDrawer
}: {
  thread: AgentWorkspaceThread | null
  terminalAvailable: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element | null {
  if (thread?.phase !== 'failed') {
    return null
  }

  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-destructive/25 bg-destructive/10 px-4 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2 text-destructive">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">
          {translate(
            'auto.components.agentWorkspace.layout.threadFailedOpenTerminal',
            'Thread failed. Open the terminal drawer to inspect raw output.'
          )}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="xs"
        disabled={!terminalAvailable || typeof onOpenTerminalDrawer !== 'function'}
        onClick={() => onOpenTerminalDrawer?.('failure')}
      >
        <Terminal className="size-3" aria-hidden="true" />
        {translate('auto.components.agentWorkspace.layout.openTerminalDrawer', 'Open drawer')}
      </Button>
    </div>
  )
}

function AgentWorkspaceCenter({
  activeWorktreeId,
  project,
  threads,
  thread,
  timeline,
  terminalAvailable,
  onSelectThread,
  onNewSession,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  project: AgentWorkspaceProject | null
  threads: readonly AgentWorkspaceThread[]
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
  onSelectThread: (threadId: string) => void
  onNewSession: () => void
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <AgentFailureTerminalBanner
        thread={thread}
        terminalAvailable={terminalAvailable}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
      <AgentWorkspaceThreadTabs
        threads={threads}
        selectedThreadId={thread?.id ?? null}
        onSelectThread={onSelectThread}
        onNewSession={onNewSession}
      />
      <AgentTimeline thread={thread} timeline={timeline} />
      <AgentComposer
        activeWorktreeId={activeWorktreeId}
        selectedProject={project}
        selectedThread={thread}
        terminalAvailable={terminalAvailable}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
    </main>
  )
}

export function AgentWorkspaceLayout({
  snapshot,
  onOpenTerminalDrawer
}: {
  snapshot: AgentWorkspaceSnapshot
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const selectedProject = getSelectedProject(snapshot)
  const sourceControlActions = useAgentWorkspaceSourceControlActions(selectedProject)
  const projectThreads = getProjectThreads(snapshot, selectedProject)
  const defaultThread = projectThreads[0] ?? null
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    () => defaultThread?.id ?? null
  )
  const [selectedRightPanelState, setSelectedRightPanelState] = useState(() =>
    getDefaultAgentWorkspaceRightPanelState(
      getRightPanelStateInput(
        defaultThread,
        getThreadDiffs(snapshot, defaultThread),
        selectAgentWorkspacePlanForThread(snapshot, defaultThread),
        getThreadReview(snapshot, defaultThread)
      )
    )
  )
  const projectThreadIdsKey = projectThreads.map((thread) => thread.id).join('\u0000')
  const selectedThread = selectedThreadId
    ? (projectThreads.find((thread) => thread.id === selectedThreadId) ?? null)
    : null
  const openDiff = useAppStore((state) => state.openDiff)
  const timeline = getThreadTimeline(snapshot, selectedThread)
  const diffs = getThreadDiffs(snapshot, selectedThread)
  const selectedPlan = selectAgentWorkspacePlanForThread(snapshot, selectedThread)
  const selectedApproval = getThreadApproval(snapshot, selectedThread)
  const selectedReview = getThreadReview(snapshot, selectedThread)
  const rightPanelStateInput = getRightPanelStateInput(
    selectedThread,
    diffs,
    selectedPlan,
    selectedReview
  )
  const rightPanelStateInputKey = getRightPanelStateInputKey(rightPanelStateInput)
  const previousRightPanelStateInputKeyRef = useRef(rightPanelStateInputKey)

  useEffect(() => {
    if (!selectedThreadId) {
      return
    }
    if (!projectThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(defaultThread?.id ?? null)
    }
  }, [defaultThread?.id, projectThreadIdsKey, projectThreads, selectedThreadId])

  useEffect(() => {
    if (previousRightPanelStateInputKeyRef.current !== rightPanelStateInputKey) {
      previousRightPanelStateInputKeyRef.current = rightPanelStateInputKey
      setSelectedRightPanelState(getDefaultAgentWorkspaceRightPanelState(rightPanelStateInput))
    }
  }, [rightPanelStateInput, rightPanelStateInputKey])

  function handleRightPanelTabChange(tab: AgentWorkspaceRightPanelTab): void {
    setSelectedRightPanelState({
      selectedTab: tab,
      collapsed: false
    } satisfies AgentWorkspaceRightPanelState)
  }

  function handleOpenDiff(diff: AgentWorkspaceDiffSummary): void {
    if (!selectedThread?.cwd || typeof openDiff !== 'function') {
      return
    }
    openDiff(
      selectedThread.worktreeId,
      joinPath(selectedThread.cwd, diff.filePath),
      diff.filePath,
      detectLanguage(diff.filePath),
      diff.area === 'staged'
    )
  }

  return (
    <AgentWorkspaceChrome
      header={<AgentWorkspaceHeader project={selectedProject} thread={selectedThread} />}
      rightPanel={
        selectedRightPanelState.collapsed ? null : (
          <AgentWorkspaceRightPanel
            thread={selectedThread}
            plan={selectedPlan}
            approval={selectedApproval}
            diffs={diffs}
            review={selectedReview}
            sourceControlBusy={sourceControlActions.sourceControlBusy}
            sourceControlError={sourceControlActions.sourceControlError}
            terminalAvailable={snapshot.terminalAvailable}
            selectedTab={selectedRightPanelState.selectedTab}
            onSelectedTabChange={handleRightPanelTabChange}
            onOpenDiff={selectedThread?.cwd ? handleOpenDiff : undefined}
            onStageDiff={sourceControlActions.onStageDiff}
            onUnstageDiff={sourceControlActions.onUnstageDiff}
            onDiscardDiff={sourceControlActions.onDiscardDiff}
            onCommitStaged={sourceControlActions.onCommitStaged}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
          />
        )
      }
    >
      <AgentWorkspaceCenter
        activeWorktreeId={snapshot.activeWorktreeId}
        project={selectedProject}
        threads={projectThreads}
        thread={selectedThread}
        timeline={timeline}
        terminalAvailable={snapshot.terminalAvailable}
        onSelectThread={setSelectedThreadId}
        onNewSession={() => setSelectedThreadId(null)}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
    </AgentWorkspaceChrome>
  )
}
