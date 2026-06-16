import { Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { translate } from '@/i18n/i18n'
import { detectLanguage } from '@/lib/language-detect'
import { joinPath } from '@/lib/path'
import { useAppStore } from '@/store'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspacePlan,
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread,
  AgentWorkspaceTimelineEntry
} from './agent-workspace-types'
import { AgentComposer } from './AgentComposer'
import { AgentWorkspaceChrome } from './AgentWorkspaceChrome'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'
import { AgentWorkspaceSidebar } from './AgentWorkspaceSidebar'
import { AgentTimeline } from './AgentTimeline'
import {
  getDefaultAgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelState,
  type AgentWorkspaceRightPanelStateInput,
  type AgentWorkspaceRightPanelTab
} from './agent-workspace-right-panel-state'
import { selectAgentWorkspacePlanForThread } from './orca-agent-plan-selectors'

function getSelectedProject(snapshot: AgentWorkspaceSnapshot): AgentWorkspaceProject | null {
  return (
    snapshot.projects.find((project) => project.id === snapshot.activeWorktreeId) ??
    snapshot.projects[0] ??
    null
  )
}

function getSelectedThread(
  snapshot: AgentWorkspaceSnapshot,
  project: AgentWorkspaceProject | null,
  selectedThreadId?: string | null
): AgentWorkspaceThread | null {
  const projectThreads = project
    ? snapshot.threads.filter((thread) => thread.worktreeId === project.id)
    : snapshot.threads
  return (
    (selectedThreadId ? projectThreads.find((thread) => thread.id === selectedThreadId) : null) ??
    projectThreads[0] ??
    null
  )
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

function getRightPanelStateInput(
  thread: AgentWorkspaceThread | null,
  diffs: readonly AgentWorkspaceDiffSummary[],
  plan: AgentWorkspacePlan | null
): AgentWorkspaceRightPanelStateInput {
  return {
    thread,
    diffs,
    hasStructuredPlan: plan !== null
  }
}

function getRightPanelStateInputKey({
  thread,
  diffs,
  hasStructuredPlan
}: AgentWorkspaceRightPanelStateInput): string {
  return [
    thread?.id ?? 'no-thread',
    thread?.phase ?? 'no-phase',
    hasStructuredPlan ? 'plan' : 'no-plan',
    diffs.map((diff) => diff.id).join(',')
  ].join(':')
}

function TerminalDrawerAffordance({
  terminalAvailable
}: {
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <div className="border-t border-border bg-muted/20 px-3 py-1.5">
      <div className="mx-auto flex h-8 w-full max-w-3xl items-center justify-between gap-3 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <Terminal className="size-3.5 shrink-0" aria-hidden="true" />
          {translate('auto.components.agentWorkspace.layout.terminal', 'Terminal')}
        </span>
        <span className="min-w-0 truncate">
          {terminalAvailable
            ? translate(
                'auto.components.agentWorkspace.layout.terminalSessionAvailable',
                'Terminal session is available as a debug panel.'
              )
            : translate(
                'auto.components.agentWorkspace.layout.noTerminalSessionAttached',
                'No terminal session is attached to this workspace.'
              )}
        </span>
      </div>
    </div>
  )
}

function AgentWorkspaceCenter({
  activeWorktreeId,
  thread,
  timeline,
  terminalAvailable
}: {
  activeWorktreeId: string | null
  thread: AgentWorkspaceThread | null
  timeline: readonly AgentWorkspaceTimelineEntry[]
  terminalAvailable: boolean
}): React.JSX.Element {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <AgentTimeline thread={thread} timeline={timeline} />
      <TerminalDrawerAffordance terminalAvailable={terminalAvailable} />
      <AgentComposer activeWorktreeId={activeWorktreeId} selectedThread={thread} />
    </main>
  )
}

export function AgentWorkspaceLayout({
  snapshot
}: {
  snapshot: AgentWorkspaceSnapshot
}): React.JSX.Element {
  const defaultProject = getSelectedProject(snapshot)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => defaultProject?.id ?? null
  )
  const selectedProjectFromState =
    snapshot.projects.find((project) => project.id === selectedProjectId) ?? null
  const selectedProject = selectedProjectFromState ?? defaultProject
  const defaultThread = getSelectedThread(snapshot, selectedProject)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    () => defaultThread?.id ?? null
  )
  const [selectedRightPanelState, setSelectedRightPanelState] = useState(() =>
    getDefaultAgentWorkspaceRightPanelState(
      getRightPanelStateInput(
        defaultThread,
        getThreadDiffs(snapshot, defaultThread),
        selectAgentWorkspacePlanForThread(snapshot, defaultThread)
      )
    )
  )
  const selectedThread = getSelectedThread(snapshot, selectedProject, selectedThreadId)
  const openDiff = useAppStore((state) => state.openDiff)
  const previousActiveWorktreeIdRef = useRef(snapshot.activeWorktreeId)
  const timeline = getThreadTimeline(snapshot, selectedThread)
  const diffs = getThreadDiffs(snapshot, selectedThread)
  const selectedPlan = selectAgentWorkspacePlanForThread(snapshot, selectedThread)
  const rightPanelStateInput = getRightPanelStateInput(selectedThread, diffs, selectedPlan)
  const rightPanelStateInputKey = getRightPanelStateInputKey(rightPanelStateInput)
  const previousRightPanelStateInputKeyRef = useRef(rightPanelStateInputKey)

  useEffect(() => {
    if (previousActiveWorktreeIdRef.current !== snapshot.activeWorktreeId) {
      previousActiveWorktreeIdRef.current = snapshot.activeWorktreeId
      const nextProject = getSelectedProject(snapshot)
      setSelectedProjectId(nextProject?.id ?? null)
      setSelectedThreadId(getSelectedThread(snapshot, nextProject)?.id ?? null)
      return
    }

    if (selectedProjectId !== (selectedProject?.id ?? null)) {
      setSelectedProjectId(selectedProject?.id ?? null)
    }
  }, [selectedProject, selectedProjectId, snapshot])

  useEffect(() => {
    if (selectedThreadId !== (selectedThread?.id ?? null)) {
      setSelectedThreadId(selectedThread?.id ?? null)
    }
  }, [selectedThread, selectedThreadId])

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
      sidebar={
        <AgentWorkspaceSidebar
          projects={snapshot.projects}
          threads={snapshot.threads}
          selectedProjectId={selectedProject?.id ?? null}
          selectedThreadId={selectedThread?.id ?? null}
          activeWorktreeId={snapshot.activeWorktreeId}
          onSelectProject={(projectId) => {
            setSelectedProjectId(projectId)
            const nextProject =
              snapshot.projects.find((project) => project.id === projectId) ?? null
            setSelectedThreadId(getSelectedThread(snapshot, nextProject)?.id ?? null)
          }}
          onSelectThread={(projectId, threadId) => {
            setSelectedProjectId(projectId)
            setSelectedThreadId(threadId)
          }}
        />
      }
      header={<AgentWorkspaceHeader project={selectedProject} thread={selectedThread} />}
      rightPanel={
        selectedRightPanelState.collapsed ? null : (
          <AgentWorkspaceRightPanel
            thread={selectedThread}
            plan={selectedPlan}
            diffs={diffs}
            terminalAvailable={snapshot.terminalAvailable}
            selectedTab={selectedRightPanelState.selectedTab}
            onSelectedTabChange={handleRightPanelTabChange}
            onOpenDiff={selectedThread?.cwd ? handleOpenDiff : undefined}
          />
        )
      }
    >
      <AgentWorkspaceCenter
        activeWorktreeId={snapshot.activeWorktreeId}
        thread={selectedThread}
        timeline={timeline}
        terminalAvailable={snapshot.terminalAvailable}
      />
    </AgentWorkspaceChrome>
  )
}
