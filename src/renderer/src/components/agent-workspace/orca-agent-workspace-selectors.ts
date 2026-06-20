import type { AppState } from '@/store'
import type { PendingAgentLaunch } from '@/store/slices/terminals'
import { branchName } from '@/lib/git-utils'
import { getRuntimePathBasename } from '../../../../shared/cross-platform-path'
import { parsePaneKey } from '../../../../shared/stable-pane-id'
import { folderWorkspaceKey } from '../../../../shared/workspace-scope'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import type { TerminalTab, Worktree } from '../../../../shared/types'
import { formatAgentTypeLabel } from '@/lib/agent-status'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'
import {
  getAgentDetectionTargetFromHostId,
  getFolderExecutionHostId,
  getFolderHostKind,
  getWorktreeExecutionHostId,
  getWorktreeHostKind
} from './orca-agent-workspace-host-selectors'
import { selectAgentWorkspaceApprovals } from './orca-agent-approval-selectors'
import { selectAgentWorkspaceDiffs } from './orca-agent-diff-selectors'
import { getPhaseForAgentState } from './orca-agent-phase-selectors'
import { selectAgentWorkspacePlans } from './orca-agent-plan-snapshot-selectors'
import { selectAgentWorkspaceReviews } from './orca-agent-review-selectors'
import { selectAgentWorkspaceTimeline } from './orca-agent-timeline-selectors'

type WorkspaceThreadMeta = {
  path: string
  branchName: string | null
}

type TabMatch = {
  worktreeId: string
  tab: TerminalTab
}

type SnapshotCache = {
  worktreesByRepo: AppState['worktreesByRepo']
  folderWorkspaces: AppState['folderWorkspaces']
  projectGroups: AppState['projectGroups']
  repos: AppState['repos']
  settings: AppState['settings']
  tabsByWorktree: AppState['tabsByWorktree']
  agentStatusByPaneKey: AppState['agentStatusByPaneKey']
  retainedAgentsByPaneKey: AppState['retainedAgentsByPaneKey']
  pendingAgentLaunchesByPaneKey: AppState['pendingAgentLaunchesByPaneKey']
  gitStatusByWorktree: AppState['gitStatusByWorktree']
  hostedReviewCache: AppState['hostedReviewCache']
  activeWorktreeId: AppState['activeWorktreeId']
  snapshot: AgentWorkspaceSnapshot
}

let snapshotCache: SnapshotCache | null = null

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function pathFallback(path: string): string {
  return getRuntimePathBasename(path) || path
}

function getWorktreeLabel(worktree: Worktree): string {
  return (
    nonEmpty(worktree.displayName) ??
    nonEmpty(branchName(worktree.branch)) ??
    pathFallback(worktree.path)
  )
}

function getWorkspaceThreadMeta(state: AppState): Map<string, WorkspaceThreadMeta> {
  const meta = new Map<string, WorkspaceThreadMeta>()
  for (const worktrees of Object.values(state.worktreesByRepo)) {
    for (const worktree of worktrees) {
      if (!worktree.isArchived) {
        meta.set(worktree.id, {
          path: worktree.path,
          branchName: branchName(worktree.branch)
        })
      }
    }
  }
  for (const folderWorkspace of state.folderWorkspaces) {
    if (!folderWorkspace.isArchived) {
      meta.set(folderWorkspaceKey(folderWorkspace.id), {
        path: folderWorkspace.folderPath,
        branchName: null
      })
    }
  }
  return meta
}

function getTabMatchesById(tabsByWorktree: AppState['tabsByWorktree']): Map<string, TabMatch> {
  const matches = new Map<string, TabMatch>()
  for (const [worktreeId, tabs] of Object.entries(tabsByWorktree)) {
    for (const tab of tabs) {
      matches.set(tab.id, { worktreeId, tab })
    }
  }
  return matches
}

function getThreadTitle(entry: AgentStatusEntry, tab: TerminalTab | undefined): string {
  return (
    nonEmpty(entry.terminalTitle) ??
    nonEmpty(tab?.customTitle) ??
    nonEmpty(tab?.generatedTitle) ??
    nonEmpty(tab?.title) ??
    nonEmpty(entry.prompt) ??
    entry.agentType ??
    'unknown'
  )
}

function getIsoTimestamp(value: number): string | null {
  return Number.isFinite(value) ? new Date(value).toISOString() : null
}

function getSortTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY
}

function hasTerminalTabsForProjects(
  state: AppState,
  projects: readonly AgentWorkspaceProject[]
): boolean {
  return projects.some((project) => (state.tabsByWorktree[project.id] ?? []).length > 0)
}

function toAgentWorkspaceThread(
  paneKey: string,
  entry: AgentStatusEntry,
  worktreeId: string,
  tab: TerminalTab | undefined,
  workspaceMeta: Map<string, WorkspaceThreadMeta>
): AgentWorkspaceThread {
  const meta = workspaceMeta.get(worktreeId)
  return {
    id: paneKey,
    worktreeId,
    title: getThreadTitle(entry, tab),
    agentKind: entry.agentType ?? 'unknown',
    phase: getPhaseForAgentState(
      entry.state,
      entry.approval !== undefined,
      entry.failure !== undefined
    ),
    updatedAt: getIsoTimestamp(entry.updatedAt),
    cwd: meta?.path ?? null,
    branchName: meta?.branchName ?? null
  }
}

function toPendingAgentWorkspaceThread(
  paneKey: string,
  launch: PendingAgentLaunch,
  workspaceMeta: Map<string, WorkspaceThreadMeta>
): AgentWorkspaceThread {
  const meta = workspaceMeta.get(launch.worktreeId)
  return {
    id: paneKey,
    worktreeId: launch.worktreeId,
    title: nonEmpty(launch.prompt) ?? formatAgentTypeLabel(launch.agent),
    agentKind: launch.agent,
    phase: 'starting',
    updatedAt: getIsoTimestamp(launch.startedAt),
    cwd: meta?.path ?? null,
    branchName: meta?.branchName ?? null
  }
}

export function selectAgentWorkspaceProjects(state: AppState): readonly AgentWorkspaceProject[] {
  const projects: AgentWorkspaceProject[] = []
  for (const worktrees of Object.values(state.worktreesByRepo)) {
    for (const worktree of worktrees) {
      if (worktree.isArchived) {
        continue
      }
      projects.push({
        id: worktree.id,
        label: getWorktreeLabel(worktree),
        path: worktree.path,
        hostKind: getWorktreeHostKind(state, worktree),
        branchName: branchName(worktree.branch),
        repoId: worktree.repoId,
        canCreateWorktree: true,
        canDeleteWorktree: !worktree.isMainWorktree,
        pushTarget: worktree.pushTarget,
        agentDetectionTarget: getAgentDetectionTargetFromHostId(
          getWorktreeExecutionHostId(state, worktree)
        )
      })
    }
  }
  for (const folderWorkspace of state.folderWorkspaces) {
    if (folderWorkspace.isArchived) {
      continue
    }
    projects.push({
      id: folderWorkspaceKey(folderWorkspace.id),
      label: nonEmpty(folderWorkspace.name) ?? pathFallback(folderWorkspace.folderPath),
      path: folderWorkspace.folderPath,
      hostKind: getFolderHostKind(state, folderWorkspace),
      branchName: null,
      repoId: null,
      canCreateWorktree: false,
      canDeleteWorktree: false,
      agentDetectionTarget: getAgentDetectionTargetFromHostId(
        getFolderExecutionHostId(state, folderWorkspace)
      )
    })
  }
  return projects
}

export function selectAgentWorkspaceThreads(state: AppState): readonly AgentWorkspaceThread[] {
  const tabMatchesById = getTabMatchesById(state.tabsByWorktree)
  const workspaceMeta = getWorkspaceThreadMeta(state)
  const threads: AgentWorkspaceThread[] = []

  for (const [paneKey, entry] of Object.entries(state.agentStatusByPaneKey)) {
    const parsed = parsePaneKey(paneKey)
    const tabMatch = parsed ? tabMatchesById.get(parsed.tabId) : undefined
    const worktreeId = tabMatch?.worktreeId ?? entry.worktreeId
    if (!worktreeId) {
      continue
    }
    threads.push(toAgentWorkspaceThread(paneKey, entry, worktreeId, tabMatch?.tab, workspaceMeta))
  }

  for (const [paneKey, launch] of Object.entries(state.pendingAgentLaunchesByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    threads.push(toPendingAgentWorkspaceThread(paneKey, launch, workspaceMeta))
  }

  for (const [paneKey, retained] of Object.entries(state.retainedAgentsByPaneKey)) {
    if (paneKey in state.agentStatusByPaneKey) {
      continue
    }
    threads.push(
      toAgentWorkspaceThread(
        paneKey,
        retained.entry,
        retained.worktreeId,
        retained.tab,
        workspaceMeta
      )
    )
  }

  return threads.sort((a, b) => {
    const updatedDiff = getSortTimestamp(b.updatedAt) - getSortTimestamp(a.updatedAt)
    return updatedDiff === 0 ? a.id.localeCompare(b.id) : updatedDiff
  })
}

export function selectAgentWorkspaceTerminalAvailable(state: AppState): boolean {
  const projects = selectAgentWorkspaceProjects(state)
  if (hasTerminalTabsForProjects(state, projects)) {
    return true
  }
  return selectAgentWorkspaceThreads(state).length > 0
}

export function selectAgentWorkspaceSnapshot(state: AppState): AgentWorkspaceSnapshot {
  if (
    snapshotCache?.worktreesByRepo === state.worktreesByRepo &&
    snapshotCache.folderWorkspaces === state.folderWorkspaces &&
    snapshotCache.projectGroups === state.projectGroups &&
    snapshotCache.repos === state.repos &&
    snapshotCache.settings === state.settings &&
    snapshotCache.tabsByWorktree === state.tabsByWorktree &&
    snapshotCache.agentStatusByPaneKey === state.agentStatusByPaneKey &&
    snapshotCache.retainedAgentsByPaneKey === state.retainedAgentsByPaneKey &&
    snapshotCache.pendingAgentLaunchesByPaneKey === state.pendingAgentLaunchesByPaneKey &&
    snapshotCache.gitStatusByWorktree === state.gitStatusByWorktree &&
    snapshotCache.hostedReviewCache === state.hostedReviewCache &&
    snapshotCache.activeWorktreeId === state.activeWorktreeId
  ) {
    return snapshotCache.snapshot
  }

  const projects = selectAgentWorkspaceProjects(state)
  const threads = selectAgentWorkspaceThreads(state)
  const plans = selectAgentWorkspacePlans(state, threads)
  const timeline = selectAgentWorkspaceTimeline(state, threads)
  const approvals = selectAgentWorkspaceApprovals(state, threads)
  const diffs = selectAgentWorkspaceDiffs(state, threads)
  const reviews = selectAgentWorkspaceReviews(state)
  const snapshot = {
    activeWorktreeId: state.activeWorktreeId ?? null,
    projects,
    threads,
    plans,
    timeline,
    approvals,
    diffs,
    reviews,
    terminalAvailable: threads.length > 0 || hasTerminalTabsForProjects(state, projects)
  }
  snapshotCache = {
    worktreesByRepo: state.worktreesByRepo,
    folderWorkspaces: state.folderWorkspaces,
    projectGroups: state.projectGroups,
    repos: state.repos,
    settings: state.settings,
    tabsByWorktree: state.tabsByWorktree,
    agentStatusByPaneKey: state.agentStatusByPaneKey,
    retainedAgentsByPaneKey: state.retainedAgentsByPaneKey,
    pendingAgentLaunchesByPaneKey: state.pendingAgentLaunchesByPaneKey,
    gitStatusByWorktree: state.gitStatusByWorktree,
    hostedReviewCache: state.hostedReviewCache,
    activeWorktreeId: state.activeWorktreeId,
    snapshot
  }
  return snapshot
}
