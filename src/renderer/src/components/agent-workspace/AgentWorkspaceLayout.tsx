import { useEffect, useRef, useState } from 'react'
import { translate } from '@/i18n/i18n'
import { detectLanguage } from '@/lib/language-detect'
import { joinPath } from '@/lib/path'
import { useAppStore } from '@/store'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceSnapshot,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspacePane } from './AgentWorkspacePane'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import {
  getDefaultAgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { selectAgentWorkspacePlanForThread } from './orca-agent-plan-selectors'
import { useAgentWorkspaceSourceControlActions } from './useAgentWorkspaceSourceControlActions'
import { pruneStaleAgentBrowserTabs } from './agent-browser-workbench-tabs'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'
import { useTabGroupWorkspaceModel } from '@/components/tab-group/useTabGroupWorkspaceModel'
import { getRuntimeEnvironmentIdForWorktree } from '@/lib/worktree-runtime-owner'
import { isWebRuntimeSessionActive } from '@/runtime/web-runtime-session'
import { getActiveAgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import { useAgentWorkspacePanes } from './useAgentWorkspacePanes'
import { useAgentWorkspaceActionBridgeRegistration } from './useAgentWorkspaceActionBridgeRegistration'
import type { AgentComposerMessageSentHandler } from './agent-composer-message-sent'
import { compareAgentTimelineEntries } from './agent-timeline-order'
import { upsertLocalUserTimelineEntry } from './agent-workspace-local-user-timeline'
import {
  getRightPanelStateInput,
  getRightPanelStateInputKey
} from './agent-workspace-right-panel-input'
import { openAgentMarkdownArtifact } from './open-agent-markdown-artifact'
import {
  getProjectThreads,
  getSelectedProject,
  getThreadApproval,
  getThreadDiffs,
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
  const [localUserTimeline, setLocalUserTimeline] = useState<AgentWorkspaceTimelineEntry[]>([])
  const localUserTimelineSequenceRef = useRef(0)
  const sourceControlActions = useAgentWorkspaceSourceControlActions(selectedProject)
  const projectThreads = getProjectThreads(snapshot, selectedProject)
  const defaultThread = projectThreads[0] ?? null
  const [selectedRightPanelState, setSelectedRightPanelState] = useState(() =>
    getDefaultAgentWorkspaceRightPanelState(
      getRightPanelStateInput({
        thread: defaultThread,
        diffs: getThreadDiffs(snapshot, defaultThread),
        plan: selectAgentWorkspacePlanForThread(snapshot, defaultThread),
        review: getThreadReview(snapshot, defaultThread)
      })
    )
  )
  const projectThreadIdsKey = projectThreads.map((thread) => thread.id).join('\u0000')
  const {
    panes,
    activePaneId,
    activePane,
    splitDirection,
    setActivePaneId,
    handlePaneThreadSelect,
    handleNewSession,
    handleBeginDraftAgentSession,
    handlePendingAgentLaunch,
    handleUpdateDraftSessionAgent,
    handleSelectDraftSession,
    handleCloseDraftSession,
    handleCloseThread,
    handleSplitPane,
    handleClosePane
  } = useAgentWorkspacePanes({
    defaultThreadId: defaultThread?.id ?? null,
    projectThreads,
    projectThreadIdsKey,
    onOpenTerminalDrawer
  })
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
  const diffs = getThreadDiffs(snapshot, selectedThread)
  const selectedPlan = selectAgentWorkspacePlanForThread(snapshot, selectedThread)
  const selectedApproval = getThreadApproval(snapshot, selectedThread)
  const selectedReview = getThreadReview(snapshot, selectedThread)
  const rightPanelStateInput = getRightPanelStateInput({
    thread: selectedThread,
    diffs,
    plan: selectedPlan,
    review: selectedReview
  })
  const rightPanelStateInputKey = getRightPanelStateInputKey(rightPanelStateInput)
  const previousRightPanelStateInputKeyRef = useRef(rightPanelStateInputKey)
  const lastPrunedAgentBrowserWorktreeRef = useRef<string | null>(null)

  const closeBrowserTab = useAppStore((state) => state.closeBrowserTab)
  const guiAgentWorkspaceEnabled = useAppStore(
    (state) => state.settings?.guiAgentWorkspaceEnabled === true
  )
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

  useEffect(() => {
    // Why: persisted UI can restore explorer open; agent workspace should start
    // distraction-free until the user clicks Files or uses the explorer shortcut.
    setRightSidebarOpen(false)
  }, [snapshot.activeWorktreeId, setRightSidebarOpen])

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

  const handleMessageSent: AgentComposerMessageSentHandler = (message) => {
    localUserTimelineSequenceRef.current += 1
    const sequence = localUserTimelineSequenceRef.current
    setLocalUserTimeline((current) => upsertLocalUserTimelineEntry({ current, message, sequence }))
  }

  return (
    <AgentWorkspaceChrome
      header={
        <AgentWorkspaceHeader
          project={selectedProject}
          thread={selectedThread}
          rightPanelCollapsed={selectedRightPanelState.collapsed}
          terminalAvailable={snapshot.terminalAvailable}
          browserAvailable={browserWorkbench.browserAvailable}
          onNewSession={() => handleNewSession(activePaneId)}
          onOpenBrowserWorkbench={() => browserWorkbench.openBrowserWorkbench()}
          onOpenTerminalDrawer={() => onOpenTerminalDrawer?.('debug-button')}
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
            project={selectedProject}
            thread={selectedThread}
            threads={projectThreads}
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
          const activeDraftSession = getActiveAgentWorkspaceDraftSession(pane)
          const paneApproval = getThreadApproval(snapshot, paneThread)
          const paneDiffs = getThreadDiffs(snapshot, paneThread)
          const backendTimeline = getThreadTimeline(snapshot, paneThread)
          const backendUserPromptKeys = new Set(
            backendTimeline
              .filter((entry) => entry.kind === 'user')
              .map((entry) => `${entry.threadId}:${entry.text}`)
          )
          const paneTimeline = [
            ...backendTimeline,
            ...localUserTimeline.filter(
              (entry) =>
                entry.threadId === paneThread?.id &&
                !backendUserPromptKeys.has(`${entry.threadId}:${entry.text}`)
            )
          ].sort((a, b) => {
            // Why: chat transcripts read oldest-to-newest; backend and local
            // optimistic entries arrive from different sources and need one order.
            return compareAgentTimelineEntries(a, b)
          })
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
                draftSessions={pane.draftSessions}
                selectedDraftSessionId={pane.selectedDraftSessionId}
                activeDraftSession={activeDraftSession}
                approval={paneApproval}
                timeline={paneTimeline}
                diffs={paneDiffs}
                terminalAvailable={snapshot.terminalAvailable}
                browserWorkbenchActive={terminalDrawerReason === 'browser'}
                tabGroupWorkbenchActive={terminalDrawerReason === 'workbench'}
                onFocusPane={() => setActivePaneId(pane.id)}
                onSelectThread={(threadId) => handlePaneThreadSelect(pane.id, threadId)}
                onCloseThread={(threadId) => handleCloseThread(pane.id, threadId)}
                onNewSession={() => handleNewSession(pane.id)}
                onSelectDraftSession={(draftSessionId) =>
                  handleSelectDraftSession(pane.id, draftSessionId)
                }
                onCloseDraftSession={(draftSessionId) =>
                  handleCloseDraftSession(pane.id, draftSessionId)
                }
                onUpdateDraftSessionAgent={(draftSessionId, agent) =>
                  handleUpdateDraftSessionAgent(pane.id, draftSessionId, agent)
                }
                onBeginDraftAgentSession={(agent) => handleBeginDraftAgentSession(agent, pane.id)}
                onPendingAgentLaunch={() => handlePendingAgentLaunch(pane.id)}
                onMessageSent={handleMessageSent}
                onOpenMarkdownArtifact={(artifact) =>
                  openAgentMarkdownArtifact({ thread: paneThread, artifact, openFile })
                }
                onReviewDiffs={() => (setActivePaneId(pane.id), handleRightPanelTabChange('diff'))}
                onSplitPane={(direction) => {
                  const splitDirection =
                    direction === 'right' || direction === 'left' ? 'horizontal' : 'vertical'
                  handleSplitPane(pane.id, splitDirection)
                }}
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
