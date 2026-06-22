import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import type { AgentWorkspaceDiffSummary, AgentWorkspaceSnapshot } from './agent-workspace-types'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspacePaneStack } from './AgentWorkspacePaneStack'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
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
  const setRightSidebarTab = useAppStore((state) => state.setRightSidebarTab)
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
    // Why: the environment card is overlay chrome, not the old project-right
    // side panel, so it should not suppress the normal Files sidebar.
    setAgentWorkspaceRightPanelExpanded(false)
  }, [setAgentWorkspaceRightPanelExpanded])

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

  function handleOpenDiff(diff: AgentWorkspaceDiffSummary): void {
    openAgentWorkspaceDiff({ diff, openDiff, thread: selectedThread })
  }

  function handleOpenSourceControl(): void {
    setRightSidebarTab('source-control')
    setRightSidebarOpen(true)
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
          terminalAvailable={snapshot.terminalAvailable}
          browserAvailable={browserWorkbench.browserAvailable}
          onNewSession={() => handleNewSession(activePaneId)}
          onOpenBrowserWorkbench={() => browserWorkbench.openBrowserWorkbench()}
          onOpenTerminalDrawer={() => onOpenTerminalDrawer?.('debug-button')}
          onOpenWorkbench={() => onOpenTerminalDrawer?.('workbench')}
          onOpenProjectFiles={() => {
            showRightSidebarFiles()
          }}
        />
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
            onOpenBrowserWorkbench={
              browserWorkbench.browserAvailable ? browserWorkbench.openBrowserWorkbench : undefined
            }
            onOpenProjectFiles={showRightSidebarFiles}
            onOpenSourceControl={handleOpenSourceControl}
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
