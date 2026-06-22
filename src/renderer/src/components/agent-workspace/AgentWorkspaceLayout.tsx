import { useEffect, useRef, useState } from 'react'
import { activateAndRevealWorktree } from '@/lib/worktree-activation'
import { useAppStore } from '@/store'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspacePaneStack } from './AgentWorkspacePaneStack'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import { AgentWorkspaceAttemptCompare } from './AgentWorkspaceAttemptCompare'
import { AgentWorkspaceRunBoard } from './AgentWorkspaceRunBoard'
import {
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import { getDefaultRightPanelStateForViewport } from './agent-workspace-right-panel-default-state'
import {
  getRightPanelStateInput,
  getRightPanelStateInputKey
} from './agent-workspace-right-panel-state-input'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { selectAgentWorkspacePlanForThread } from './orca-agent-plan-selectors'
import { useAgentWorkspaceSourceControlActions } from './useAgentWorkspaceSourceControlActions'
import { pruneStaleAgentBrowserTabs } from './agent-browser-workbench-tabs'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'
import { useTabGroupWorkspaceModel } from '@/components/tab-group/useTabGroupWorkspaceModel'
import { getRuntimeEnvironmentIdForWorktree } from '@/lib/worktree-runtime-owner'
import { isWebRuntimeSessionActive } from '@/runtime/web-runtime-session'
import { useAgentWorkspacePanes } from './useAgentWorkspacePanes'
import { useAgentWorkspaceActionBridgeRegistration } from './useAgentWorkspaceActionBridgeRegistration'
import { useAgentWorkspaceLocalTimeline } from './useAgentWorkspaceLocalTimeline'
import { useAgentWorkspaceCompactLayout } from './useAgentWorkspaceCompactLayout'
import { useAgentWorkspaceCompactViewport } from './useAgentWorkspaceCompactViewport'
import { openAgentWorkspaceDiff } from './open-agent-workspace-diff'
import { selectAgentRunBoardGroups, type AgentRunBoardRow } from './agent-run-board-selectors'
import {
  selectAgentWorktreeCompareGroups,
  type AgentWorktreeCompareAttempt
} from './agent-worktree-compare-selectors'
import {
  getAgentReviewOnlyLaunchProfile,
  getAgentReviewOnlyPreferredAgent,
  launchAgentReviewOnly,
  type AgentReviewOnlyLaunchSurface
} from './agent-review-only-launch'
import { selectAgentReviewFindingsFromTimeline } from './agent-review-findings'
import {
  getProjectThreads,
  getSelectedProject,
  getThreadChromeSummary,
  getThreadApproval,
  getThreadDiffs,
  getThreadRunEvents,
  getThreadReview,
  getThreadTimeline
} from './agent-workspace-layout-selectors'

export function AgentWorkspaceLayout({
  snapshot,
  terminalDrawerReason = null,
  onOpenTerminalDrawer
}: {
  snapshot: AgentWorkspaceSnapshot
  terminalDrawerReason?: AgentTerminalRevealReason | null
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): React.JSX.Element {
  const selectedProject = getSelectedProject(snapshot)
  const { localUserTimeline, handleMessageSent } = useAgentWorkspaceLocalTimeline()
  const compactViewport = useAgentWorkspaceCompactViewport()
  const pendingRunBoardSelectionRef = useRef<{
    worktreeId: string
    threadId: string
  } | null>(null)
  const sourceControlActions = useAgentWorkspaceSourceControlActions(selectedProject)
  const projectThreads = getProjectThreads(snapshot, selectedProject)
  const defaultThread = projectThreads[0] ?? null
  const [selectedRightPanelState, setSelectedRightPanelState] = useState(() =>
    getDefaultRightPanelStateForViewport({
      input: getRightPanelStateInput({
        thread: defaultThread,
        diffs: getThreadDiffs(snapshot, defaultThread),
        plan: selectAgentWorkspacePlanForThread(snapshot, defaultThread),
        review: getThreadReview(snapshot, defaultThread)
      }),
      compactRightPanelViewport: compactViewport
    })
  )
  const projectThreadIdsKey = projectThreads.map((thread) => thread.id).join('\u0000')
  const panesController = useAgentWorkspacePanes({
    defaultThreadId: defaultThread?.id ?? null,
    projectThreads,
    projectThreadIdsKey,
    onOpenTerminalDrawer
  })
  const {
    activePaneId,
    activePane,
    setActivePaneId,
    handlePaneThreadSelect,
    handleNewSession,
    handleBeginDraftAgentSession
  } = panesController
  const selectedThread = activePane?.selectedThreadId
    ? (projectThreads.find((thread) => thread.id === activePane.selectedThreadId) ?? null)
    : null
  const openDiff = useAppStore((state) => state.openDiff)
  const openFile = useAppStore((state) => state.openFile)
  const setAgentWorkspaceRightPanelExpanded = useAppStore(
    (state) => state.setAgentWorkspaceRightPanelExpanded
  )
  const setRightSidebarOpen = useAppStore((state) => state.setRightSidebarOpen)
  const showRightSidebarFiles = useAppStore((state) => state.showRightSidebarFiles)
  const settings = useAppStore((state) => state.settings)
  const memorySnapshot = useAppStore((state) => state.memorySnapshot ?? null)
  const memorySnapshotError = useAppStore((state) => state.memorySnapshotError ?? null)
  const diffs = getThreadDiffs(snapshot, selectedThread)
  const selectedPlan = selectAgentWorkspacePlanForThread(snapshot, selectedThread)
  const selectedApproval = getThreadApproval(snapshot, selectedThread)
  const selectedRunEvents = getThreadRunEvents(snapshot, selectedThread)
  const selectedTimeline = getThreadTimeline(snapshot, selectedThread)
  const selectedRunReplayContext = selectedThread
    ? (snapshot.runReplayContexts?.find((context) => context.threadId === selectedThread.id) ??
      null)
    : null
  const selectedThreadChromeSummary = getThreadChromeSummary(
    selectedThread,
    selectedRunEvents,
    diffs
  )
  const selectedReview = getThreadReview(snapshot, selectedThread)
  const selectedReviewFindings = selectAgentReviewFindingsFromTimeline({
    thread: selectedThread,
    timeline: selectedTimeline
  })
  const runBoardGroups = selectAgentRunBoardGroups(snapshot)
  const worktreeCompareGroups = selectAgentWorktreeCompareGroups(snapshot)
  const rightPanelStateInput = getRightPanelStateInput({
    thread: selectedThread,
    diffs,
    plan: selectedPlan,
    review: selectedReview,
    reviewFindingCount: selectedReviewFindings.length
  })
  const rightPanelStateInputKey = getRightPanelStateInputKey(rightPanelStateInput)
  const previousRightPanelStateInputKeyRef = useRef(rightPanelStateInputKey)
  const previousActiveWorktreeIdForSidebarRef = useRef(snapshot.activeWorktreeId)
  const lastPrunedAgentBrowserWorktreeRef = useRef<string | null>(null)

  const closeBrowserTab = useAppStore((state) => state.closeBrowserTab)
  const guiAgentWorkspaceEnabled = settings?.guiAgentWorkspaceEnabled === true
  const focusedGroupId = useAppStore((state) =>
    snapshot.activeWorktreeId
      ? (state.activeGroupIdByWorktree?.[snapshot.activeWorktreeId] ??
        state.groupsByWorktree?.[snapshot.activeWorktreeId]?.[0]?.id ??
        null)
      : null
  )
  const tabGroupModel = useTabGroupWorkspaceModel({
    worktreeId: snapshot.activeWorktreeId ?? '',
    groupId: focusedGroupId ?? ''
  })
  const browserWorkbench = useAgentBrowserWorkbench({
    activeWorktreeId: snapshot.activeWorktreeId,
    browserWorkbenchActive: terminalDrawerReason === 'browser',
    onOpenTerminalDrawer
  })
  const reviewOnlyAgent = getAgentReviewOnlyPreferredAgent(settings)
  const reviewOnlyProfile = reviewOnlyAgent
    ? getAgentReviewOnlyLaunchProfile({ agent: reviewOnlyAgent, settings })
    : null

  useAgentWorkspaceActionBridgeRegistration({
    activePaneId,
    activeWorktreeId: snapshot.activeWorktreeId,
    browserWorkbench,
    focusedGroupId,
    guiAgentWorkspaceEnabled,
    onBeginDraftAgentSession: handleBeginDraftAgentSession,
    onOpenTerminalDrawer,
    tabGroupCommands: tabGroupModel.commands,
    terminalDrawerReason
  })

  useAgentWorkspaceCompactLayout({
    activeWorktreeId: snapshot.activeWorktreeId,
    compactViewport,
    focusedGroupId,
    setSelectedRightPanelState
  })

  if (previousRightPanelStateInputKeyRef.current !== rightPanelStateInputKey) {
    previousRightPanelStateInputKeyRef.current = rightPanelStateInputKey
    setSelectedRightPanelState(
      getDefaultRightPanelStateForViewport({
        input: rightPanelStateInput,
        compactRightPanelViewport: compactViewport
      })
    )
  }

  if (previousActiveWorktreeIdForSidebarRef.current !== snapshot.activeWorktreeId) {
    previousActiveWorktreeIdForSidebarRef.current = snapshot.activeWorktreeId
    // Why: persisted UI can restore explorer open; agent workspace should start
    // distraction-free until the user clicks Files or uses the explorer shortcut.
    setRightSidebarOpen(false)
  }

  useEffect(() => {
    const expanded = !selectedRightPanelState.collapsed
    setAgentWorkspaceRightPanelExpanded(expanded)
    if (expanded) {
      setRightSidebarOpen(false)
    }
  }, [selectedRightPanelState.collapsed, setAgentWorkspaceRightPanelExpanded, setRightSidebarOpen])

  useEffect(() => {
    const pending = pendingRunBoardSelectionRef.current
    if (!pending || pending.worktreeId !== snapshot.activeWorktreeId) {
      return
    }
    if (!projectThreads.some((thread) => thread.id === pending.threadId)) {
      return
    }
    pendingRunBoardSelectionRef.current = null
    handlePaneThreadSelect(activePaneId, pending.threadId)
  }, [
    activePaneId,
    handlePaneThreadSelect,
    projectThreadIdsKey,
    projectThreads,
    snapshot.activeWorktreeId
  ])

  useEffect(() => {
    if (terminalDrawerReason === 'browser') {
      setRightSidebarOpen(false)
    }
  }, [terminalDrawerReason, setRightSidebarOpen])

  useEffect(() => {
    if (!snapshot.activeWorktreeId) {
      lastPrunedAgentBrowserWorktreeRef.current = null
      return
    }
    if (terminalDrawerReason === 'browser') {
      return
    }
    const worktreeId = snapshot.activeWorktreeId
    if (lastPrunedAgentBrowserWorktreeRef.current === worktreeId) {
      return
    }
    lastPrunedAgentBrowserWorktreeRef.current = worktreeId
    const state = useAppStore.getState()
    const runtimeEnvironmentId = getRuntimeEnvironmentIdForWorktree(state, worktreeId)
    pruneStaleAgentBrowserTabs({
      state,
      worktreeId,
      webRuntimeActive: isWebRuntimeSessionActive(runtimeEnvironmentId),
      closeBrowserTab
    })
  }, [closeBrowserTab, snapshot.activeWorktreeId, terminalDrawerReason])

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

  function handleOpenDiff(diff: AgentWorkspaceDiffSummary): void {
    openAgentWorkspaceDiff({ diff, openDiff, thread: selectedThread })
  }

  function handleOpenWorkspaceThread({
    worktreeId,
    threadId
  }: {
    worktreeId: string
    threadId: string
  }): void {
    pendingRunBoardSelectionRef.current = {
      worktreeId,
      threadId
    }
    if (worktreeId !== snapshot.activeWorktreeId) {
      const activated = activateAndRevealWorktree(worktreeId)
      if (!activated) {
        pendingRunBoardSelectionRef.current = null
      }
      return
    }
    pendingRunBoardSelectionRef.current = null
    handlePaneThreadSelect(activePaneId, threadId)
  }

  function handleOpenRunBoardRow(row: AgentRunBoardRow): void {
    handleOpenWorkspaceThread(row)
  }

  function handleOpenCompareAttempt(attempt: AgentWorktreeCompareAttempt): void {
    handleOpenWorkspaceThread(attempt)
  }

  function handleLaunchReviewOnly(_source: AgentReviewOnlyLaunchSurface): void {
    if (!snapshot.activeWorktreeId || !reviewOnlyAgent) {
      return
    }
    launchAgentReviewOnly({
      agent: reviewOnlyAgent,
      worktreeId: snapshot.activeWorktreeId,
      groupId: focusedGroupId,
      diffs,
      review: selectedReview,
      settings
    })
  }

  return (
    <AgentWorkspaceChrome
      header={
        <AgentWorkspaceHeader
          project={selectedProject}
          thread={selectedThread}
          runSummary={selectedThreadChromeSummary}
          rightPanelCollapsed={selectedRightPanelState.collapsed}
          terminalAvailable={snapshot.terminalAvailable}
          browserAvailable={browserWorkbench.browserAvailable}
          onNewSession={() => handleNewSession(activePaneId)}
          onOpenBrowserWorkbench={() => browserWorkbench.openBrowserWorkbench()}
          onOpenTerminalDrawer={() => onOpenTerminalDrawer?.('debug-button')}
          onOpenWorkbench={() => onOpenTerminalDrawer?.('workbench')}
          onExpandRightPanel={handleExpandRightPanel}
          onOpenProjectFiles={() => {
            setSelectedRightPanelState((current) => ({ ...current, collapsed: true }))
            showRightSidebarFiles()
          }}
        />
      }
      runBoard={
        <>
          <AgentWorkspaceAttemptCompare
            groups={worktreeCompareGroups}
            onOpenAttempt={handleOpenCompareAttempt}
          />
          <AgentWorkspaceRunBoard
            groups={runBoardGroups}
            activeWorktreeId={snapshot.activeWorktreeId}
            onOpenRun={handleOpenRunBoardRow}
          />
        </>
      }
      rightPanel={
        selectedRightPanelState.collapsed ? null : (
          <AgentWorkspaceRightPanel
            project={selectedProject}
            thread={selectedThread}
            threads={projectThreads}
            plan={selectedPlan}
            approval={selectedApproval}
            diffs={diffs}
            runEvents={selectedRunEvents}
            timeline={selectedTimeline}
            runReplayContext={selectedRunReplayContext}
            review={selectedReview}
            reviewFindings={selectedReviewFindings}
            sourceControlBusy={sourceControlActions.sourceControlBusy}
            sourceControlError={sourceControlActions.sourceControlError}
            memorySnapshot={memorySnapshot}
            memorySnapshotError={memorySnapshotError}
            terminalAvailable={snapshot.terminalAvailable}
            selectedTab={selectedRightPanelState.selectedTab}
            onSelectedTabChange={handleRightPanelTabChange}
            onOpenDiff={selectedThread?.cwd ? handleOpenDiff : undefined}
            onStageDiff={sourceControlActions.onStageDiff}
            onUnstageDiff={sourceControlActions.onUnstageDiff}
            onDiscardDiff={sourceControlActions.onDiscardDiff}
            onCommitStaged={sourceControlActions.onCommitStaged}
            reviewOnlyWarning={reviewOnlyProfile?.warning ?? null}
            onLaunchReviewOnly={reviewOnlyAgent ? handleLaunchReviewOnly : undefined}
            onOpenTerminalDrawer={onOpenTerminalDrawer}
          />
        )
      }
    >
      <AgentWorkspacePaneStack
        snapshot={snapshot}
        selectedProject={selectedProject}
        projectThreads={projectThreads}
        panesController={panesController}
        localUserTimeline={localUserTimeline}
        terminalDrawerReason={terminalDrawerReason}
        openFile={openFile}
        onReviewDiffs={(paneId) => {
          setActivePaneId(paneId)
          handleRightPanelTabChange('diff')
        }}
        onMessageSent={handleMessageSent}
        onOpenTerminalDrawer={onOpenTerminalDrawer}
      />
    </AgentWorkspaceChrome>
  )
}
