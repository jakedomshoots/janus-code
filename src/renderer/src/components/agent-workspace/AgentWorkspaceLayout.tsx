import { useEffect, useRef, useState } from 'react'
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
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspacePane } from './AgentWorkspacePane'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import {
  getDefaultAgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelStateInput,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { selectAgentWorkspacePlanForThread } from './orca-agent-plan-selectors'
import { useAgentWorkspaceSourceControlActions } from './useAgentWorkspaceSourceControlActions'
import { closeAgentWorkspaceThread } from './agent-workspace-thread-close'
import { pickAgentWorkspaceApprovalThreadId } from './agent-workspace-approval-focus'

type AgentWorkspacePaneState = {
  id: string
  selectedThreadId: string | null
}

type AgentWorkspaceSplitDirection = 'horizontal' | 'vertical'

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

export function AgentWorkspaceLayout({
  snapshot,
  terminalDrawerReason = null,
  onOpenTerminalDrawer
}: {
  snapshot: AgentWorkspaceSnapshot
  terminalDrawerReason?: AgentTerminalRevealReason | null
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): React.JSX.Element {
  const selectedProject = getSelectedProject(snapshot)
  const sourceControlActions = useAgentWorkspaceSourceControlActions(selectedProject)
  const projectThreads = getProjectThreads(snapshot, selectedProject)
  const defaultThread = projectThreads[0] ?? null
  const [panes, setPanes] = useState<AgentWorkspacePaneState[]>(() => [
    { id: 'pane-1', selectedThreadId: defaultThread?.id ?? null }
  ])
  const [activePaneId, setActivePaneId] = useState('pane-1')
  const [splitDirection, setSplitDirection] = useState<AgentWorkspaceSplitDirection>('horizontal')
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
  const activePane = panes.find((pane) => pane.id === activePaneId) ?? panes[0] ?? null
  const selectedThread = activePane?.selectedThreadId
    ? (projectThreads.find((thread) => thread.id === activePane.selectedThreadId) ?? null)
    : null
  const openDiff = useAppStore((state) => state.openDiff)
  const setAgentWorkspaceRightPanelExpanded = useAppStore(
    (state) => state.setAgentWorkspaceRightPanelExpanded
  )
  const setRightSidebarOpen = useAppStore((state) => state.setRightSidebarOpen)
  const showRightSidebarFiles = useAppStore((state) => state.showRightSidebarFiles)
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
  const nextPaneSequenceRef = useRef(2)

  useEffect(() => {
    setPanes((currentPanes) => {
      let changed = false
      const nextPanes = currentPanes.map((pane) => {
        if (!pane.selectedThreadId) {
          return pane
        }
        if (projectThreads.some((thread) => thread.id === pane.selectedThreadId)) {
          return pane
        }
        changed = true
        return { ...pane, selectedThreadId: defaultThread?.id ?? null }
      })
      return changed ? nextPanes : currentPanes
    })
  }, [defaultThread?.id, projectThreadIdsKey, projectThreads])

  useEffect(() => {
    if (!panes.some((pane) => pane.id === activePaneId)) {
      setActivePaneId(panes[0]?.id ?? 'pane-1')
    }
  }, [activePaneId, panes])

  useEffect(() => {
    if (previousRightPanelStateInputKeyRef.current !== rightPanelStateInputKey) {
      previousRightPanelStateInputKeyRef.current = rightPanelStateInputKey
      setSelectedRightPanelState(getDefaultAgentWorkspaceRightPanelState(rightPanelStateInput))
    }
  }, [rightPanelStateInput, rightPanelStateInputKey])

  useEffect(() => {
    const expanded = !selectedRightPanelState.collapsed
    setAgentWorkspaceRightPanelExpanded(expanded)
    if (expanded) {
      setRightSidebarOpen(false)
    }
  }, [selectedRightPanelState.collapsed, setAgentWorkspaceRightPanelExpanded, setRightSidebarOpen])

  useEffect(
    () => () => {
      setAgentWorkspaceRightPanelExpanded(false)
    },
    [setAgentWorkspaceRightPanelExpanded]
  )

  function handleRightPanelTabChange(tab: AgentWorkspaceRightPanelTab): void {
    setSelectedRightPanelState({
      selectedTab: tab,
      collapsed: false
    } satisfies AgentWorkspaceRightPanelState)
  }

  function handleExpandRightPanel(): void {
    setSelectedRightPanelState((current) => ({
      ...current,
      collapsed: false
    }))
  }

  function handlePaneThreadSelect(paneId: string, threadId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) =>
        pane.id === paneId ? { ...pane, selectedThreadId: threadId } : pane
      )
    )
  }

  useEffect(() => {
    if (!activePane) {
      return
    }
    const approvalThreadId = pickAgentWorkspaceApprovalThreadId(
      projectThreads,
      activePane.selectedThreadId
    )
    if (!approvalThreadId) {
      return
    }
    handlePaneThreadSelect(activePane.id, approvalThreadId)
  }, [activePane, projectThreadIdsKey, projectThreads])

  function handleNewSession(paneId: string): void {
    setActivePaneId(paneId)
    setPanes((currentPanes) =>
      currentPanes.map((pane) => (pane.id === paneId ? { ...pane, selectedThreadId: null } : pane))
    )
  }

  function handleCloseThread(paneId: string, threadId: string): void {
    const remainingThreads = projectThreads.filter((thread) => thread.id !== threadId)
    const fallbackThreadId = remainingThreads[0]?.id ?? null
    setPanes((currentPanes) =>
      currentPanes.map((pane) => {
        if (pane.selectedThreadId !== threadId) {
          return pane
        }
        return { ...pane, selectedThreadId: fallbackThreadId }
      })
    )
    if (activePane?.selectedThreadId === threadId) {
      setActivePaneId(paneId)
    }
    closeAgentWorkspaceThread(threadId)
  }

  function handleSplitPane(paneId: string, direction: AgentWorkspaceSplitDirection): void {
    setSplitDirection(direction)
    const nextPaneId = `pane-${nextPaneSequenceRef.current}`
    nextPaneSequenceRef.current += 1
    const sourcePane = panes.find((pane) => pane.id === paneId)
    setPanes((currentPanes) => {
      const insertIndex = currentPanes.findIndex((pane) => pane.id === paneId)
      const nextPane = {
        id: nextPaneId,
        selectedThreadId: sourcePane?.selectedThreadId ?? defaultThread?.id ?? null
      }
      if (insertIndex === -1) {
        return [...currentPanes, nextPane]
      }
      return [
        ...currentPanes.slice(0, insertIndex + 1),
        nextPane,
        ...currentPanes.slice(insertIndex + 1)
      ]
    })
    setActivePaneId(nextPaneId)
  }

  function handleClosePane(paneId: string): void {
    setPanes((currentPanes) => {
      if (currentPanes.length <= 1) {
        return currentPanes
      }
      const closingIndex = currentPanes.findIndex((pane) => pane.id === paneId)
      const nextPanes = currentPanes.filter((pane) => pane.id !== paneId)
      if (activePaneId === paneId) {
        setActivePaneId(
          nextPanes[Math.max(0, closingIndex - 1)]?.id ?? nextPanes[0]?.id ?? 'pane-1'
        )
      }
      return nextPanes
    })
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
      header={
        <AgentWorkspaceHeader
          project={selectedProject}
          thread={selectedThread}
          rightPanelCollapsed={selectedRightPanelState.collapsed}
          onExpandRightPanel={handleExpandRightPanel}
          onOpenProjectFiles={() => {
            setSelectedRightPanelState((current) => ({ ...current, collapsed: true }))
            showRightSidebarFiles()
          }}
        />
      }
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
      <div
        className="flex min-w-0 flex-1 overflow-hidden"
        style={{ flexDirection: splitDirection === 'horizontal' ? 'row' : 'column' }}
      >
        {panes.map((pane, index) => {
          const paneThread = pane.selectedThreadId
            ? (projectThreads.find((thread) => thread.id === pane.selectedThreadId) ?? null)
            : null
          const paneApproval = getThreadApproval(snapshot, paneThread)
          const paneTimeline = getThreadTimeline(snapshot, paneThread)
          return (
            <div
              key={pane.id}
              className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${
                index > 0
                  ? splitDirection === 'horizontal'
                    ? 'border-l border-border'
                    : 'border-t border-border'
                  : ''
              }`}
            >
              <AgentWorkspacePane
                activeWorktreeId={snapshot.activeWorktreeId}
                project={selectedProject}
                paneLabel={translate(
                  'auto.components.agentWorkspace.layout.paneLabel',
                  'Pane {{index}}',
                  {
                    index: String(index + 1)
                  }
                )}
                active={pane.id === activePaneId}
                hasSplitPanes={panes.length > 1}
                threads={projectThreads}
                thread={paneThread}
                approval={paneApproval}
                timeline={paneTimeline}
                terminalAvailable={snapshot.terminalAvailable}
                browserWorkbenchActive={terminalDrawerReason === 'browser'}
                onFocusPane={() => setActivePaneId(pane.id)}
                onSelectThread={(threadId) => handlePaneThreadSelect(pane.id, threadId)}
                onCloseThread={(threadId) => handleCloseThread(pane.id, threadId)}
                onNewSession={() => handleNewSession(pane.id)}
                onSplitRight={() => handleSplitPane(pane.id, 'horizontal')}
                onSplitDown={() => handleSplitPane(pane.id, 'vertical')}
                onClosePane={() => handleClosePane(pane.id)}
                onOpenTerminalDrawer={onOpenTerminalDrawer}
              />
            </div>
          )
        })}
      </div>
    </AgentWorkspaceChrome>
  )
}
