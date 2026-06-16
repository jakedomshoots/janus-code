import { describe, expect, it } from 'vitest'
import type { AppState } from '@/store'
import type { RetainedAgentEntry } from '@/store/slices/agent-status'
import {
  TEST_REPO,
  createTestStore,
  makeTab,
  makeWorktree
} from '@/store/slices/store-test-helpers'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import type { FolderWorkspace, ProjectGroup, TerminalTab, Worktree } from '../../../../shared/types'
import {
  selectAgentWorkspaceSnapshot,
  selectAgentWorkspaceTerminalAvailable
} from './orca-agent-workspace-selectors'

const repo = { ...TEST_REPO, id: 'repo-orca', path: '/repo/orca', displayName: 'Orca' }
const sshRepo = { ...TEST_REPO, id: 'repo-ssh', connectionId: 'ssh-target-1' }
const runtimeRepo = { ...TEST_REPO, id: 'repo-runtime', path: '/runtime/orca' }

const paneKey = makePaneKey('tab-agent', '11111111-1111-4111-8111-111111111111')
const waitingPaneKey = makePaneKey('tab-waiting', '22222222-2222-4222-8222-222222222222')
const blockedPaneKey = makePaneKey('tab-blocked', '33333333-3333-4333-8333-333333333333')
const donePaneKey = makePaneKey('tab-done', '44444444-4444-4444-8444-444444444444')
const retainedPaneKey = makePaneKey('tab-retained', '55555555-5555-4555-8555-555555555555')

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState(overrides as Partial<AppState>)
  return store.getState()
}

function worktree(id: string, overrides: Partial<Worktree> = {}): Worktree {
  return makeWorktree({ id, repoId: repo.id, path: `/repo/orca/${id}`, ...overrides })
}

function tab(id: string, worktreeId: string, overrides: Partial<TerminalTab> = {}): TerminalTab {
  return makeTab({ id, worktreeId, ...overrides })
}

function stateWithWorktree(worktreeEntry: Worktree, overrides: Partial<AppState> = {}): AppState {
  return getState({
    repos: [repo],
    worktreesByRepo: { [repo.id]: [worktreeEntry] },
    ...overrides
  })
}

function agentEntry(
  pane: string,
  overrides: Partial<AgentStatusEntry> & Pick<AgentStatusEntry, 'state' | 'updatedAt'>
): AgentStatusEntry {
  const { state, updatedAt, ...rest } = overrides
  return {
    state,
    prompt: 'Implement Task 1.2 from the Orca T3 Code GUI Fork plan',
    updatedAt,
    stateStartedAt: updatedAt,
    agentType: 'codex',
    paneKey: pane,
    stateHistory: [],
    ...rest
  }
}

function retainedAgentEntry(
  pane: string,
  worktreeId: string,
  retainedTab: TerminalTab,
  overrides: Partial<AgentStatusEntry> & Pick<AgentStatusEntry, 'state' | 'updatedAt'>
): RetainedAgentEntry {
  const entry = agentEntry(pane, overrides)
  return {
    entry,
    worktreeId,
    tab: retainedTab,
    agentType: entry.agentType ?? 'unknown',
    startedAt: entry.stateStartedAt
  }
}

function projectGroup(overrides: Partial<ProjectGroup> & { id: string }): ProjectGroup {
  const { id, ...rest } = overrides
  return {
    id,
    name: 'Folder Group',
    parentPath: '/workspace',
    connectionId: null,
    parentGroupId: null,
    createdFrom: 'manual',
    tabOrder: 0,
    isCollapsed: false,
    color: null,
    createdAt: 1,
    updatedAt: 1,
    ...rest
  }
}

function folderWorkspace(
  overrides: Partial<FolderWorkspace> & { id: string; projectGroupId: string }
): FolderWorkspace {
  const { id, projectGroupId, ...rest } = overrides
  return {
    id,
    projectGroupId,
    name: '',
    folderPath: '/workspace/folder-app',
    connectionId: null,
    linkedTask: null,
    comment: '',
    isArchived: false,
    isUnread: false,
    isPinned: false,
    sortOrder: 0,
    lastActivityAt: 1,
    createdAt: 1,
    updatedAt: 1,
    ...rest
  }
}

describe('orca agent workspace selectors', () => {
  it('returns an empty snapshot when there is no active worktree', () => {
    expect(selectAgentWorkspaceSnapshot(getState())).toEqual({
      activeWorktreeId: null,
      projects: [],
      threads: [],
      timeline: [],
      diffs: [],
      terminalAvailable: false
    })
  })

  it('shows an active worktree project without tabs or threads', () => {
    const active = worktree('wt-empty', {
      path: '/repo/orca/worktrees/task-1',
      displayName: '',
      branch: 'refs/heads/feature/t3code-gui-workspace'
    })

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(active, { activeWorktreeId: active.id })
    )

    expect(snapshot).toMatchObject({
      activeWorktreeId: active.id,
      threads: [],
      terminalAvailable: false
    })
    expect(
      snapshot.projects.map((project) => [
        project.id,
        project.label,
        project.path,
        project.hostKind
      ])
    ).toEqual([[active.id, 'feature/t3code-gui-workspace', active.path, 'local']])
  })

  it('returns a stable snapshot reference when the backing state slices have not changed', () => {
    const active = worktree('wt-stable', {
      path: '/repo/orca/worktrees/stable',
      branch: 'refs/heads/feature/stable'
    })
    const state = stateWithWorktree(active, { activeWorktreeId: active.id })

    expect(selectAgentWorkspaceSnapshot(state)).toBe(selectAgentWorkspaceSnapshot(state))
  })

  it('maps a running agent tab to a running thread', () => {
    const running = worktree('wt-running', {
      path: '/repo/orca/worktrees/running',
      branch: 'refs/heads/feature/running',
      displayName: 'Running Work'
    })
    const runningTab = tab('tab-agent', running.id, {
      title: 'Terminal 1',
      generatedTitle: 'Generated title'
    })

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(running, {
        activeWorktreeId: running.id,
        tabsByWorktree: { [running.id]: [runningTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'working',
            updatedAt: Date.UTC(2026, 5, 15, 14, 30),
            terminalTitle: 'Codex: implementing selectors'
          })
        }
      })
    )

    expect(snapshot.threads).toEqual([
      {
        id: paneKey,
        worktreeId: running.id,
        title: 'Codex: implementing selectors',
        agentKind: 'codex',
        phase: 'running',
        updatedAt: '2026-06-15T14:30:00.000Z',
        branchName: 'feature/running',
        cwd: running.path
      }
    ])
  })

  it('maps waiting and blocked statuses to user-action phases', () => {
    const action = worktree('wt-action', { path: '/repo/orca/worktrees/action' })

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(action, {
        tabsByWorktree: {
          [action.id]: [
            tab('tab-waiting', action.id, { customTitle: 'Waiting tab' }),
            tab('tab-blocked', action.id, {
              title: 'Blocked terminal',
              generatedTitle: 'Blocked generated'
            })
          ]
        },
        agentStatusByPaneKey: {
          [waitingPaneKey]: agentEntry(waitingPaneKey, {
            state: 'waiting',
            updatedAt: Date.UTC(2026, 5, 15, 14, 20)
          }),
          [blockedPaneKey]: agentEntry(blockedPaneKey, {
            state: 'blocked',
            updatedAt: Date.UTC(2026, 5, 15, 14, 25)
          })
        }
      })
    )

    expect(snapshot.threads.map((thread) => [thread.title, thread.phase])).toEqual([
      ['Blocked generated', 'needs-approval'],
      ['Waiting tab', 'waiting-for-user']
    ])
  })

  it('maps done status to completed', () => {
    const done = worktree('wt-done', { path: '/repo/orca/done' })

    expect(
      selectAgentWorkspaceSnapshot(
        stateWithWorktree(done, {
          tabsByWorktree: {
            [done.id]: [tab('tab-done', done.id)]
          },
          agentStatusByPaneKey: {
            [donePaneKey]: agentEntry(donePaneKey, {
              state: 'done',
              updatedAt: Number.POSITIVE_INFINITY
            })
          }
        })
      ).threads[0]
    ).toMatchObject({
      phase: 'completed',
      updatedAt: null
    })
  })

  it('maps unexpected agent statuses to disconnected', () => {
    const disconnected = worktree('wt-disconnected', { path: '/repo/orca/disconnected' })

    expect(
      selectAgentWorkspaceSnapshot(
        stateWithWorktree(disconnected, {
          agentStatusByPaneKey: {
            [paneKey]: agentEntry(paneKey, {
              state: 'runtime-lost' as never,
              updatedAt: Date.UTC(2026, 5, 15, 15, 10),
              worktreeId: disconnected.id
            })
          }
        })
      ).threads[0]
    ).toMatchObject({
      phase: 'disconnected'
    })
  })

  it('keeps retained completed agents visible when their tab is gone', () => {
    const retained = worktree('wt-retained', {
      path: '/repo/orca/retained',
      branch: 'refs/heads/feature/retained'
    })
    const retainedTab = tab('tab-retained', retained.id, {
      generatedTitle: 'Retained generated title'
    })

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(retained, {
        retainedAgentsByPaneKey: {
          [retainedPaneKey]: retainedAgentEntry(retainedPaneKey, retained.id, retainedTab, {
            state: 'done',
            updatedAt: Date.UTC(2026, 5, 15, 15, 20)
          })
        }
      })
    )

    expect(snapshot.threads).toEqual([
      {
        id: retainedPaneKey,
        worktreeId: retained.id,
        title: 'Retained generated title',
        agentKind: 'codex',
        phase: 'completed',
        updatedAt: '2026-06-15T15:20:00.000Z',
        branchName: 'feature/retained',
        cwd: retained.path
      }
    ])
  })

  it('preserves SSH and runtime-focused worktree host kinds', () => {
    const sshWorktree = makeWorktree({
      id: 'wt-ssh',
      repoId: sshRepo.id,
      path: '/srv/orca/ssh',
      displayName: 'SSH Work'
    })
    const runtimeWorktree = makeWorktree({
      id: 'wt-runtime',
      repoId: runtimeRepo.id,
      path: '/runtime/orca/work',
      displayName: 'Runtime Work'
    })

    expect(
      selectAgentWorkspaceSnapshot(
        getState({
          repos: [sshRepo, runtimeRepo],
          settings: { activeRuntimeEnvironmentId: 'runtime-env-1' } as never,
          worktreesByRepo: {
            [sshRepo.id]: [sshWorktree],
            [runtimeRepo.id]: [runtimeWorktree]
          }
        })
      ).projects.map((project) => [project.id, project.hostKind])
    ).toEqual([
      [sshWorktree.id, 'ssh'],
      [runtimeWorktree.id, 'runtime']
    ])
  })

  it('uses worktree host ownership before repo or focused host defaults', () => {
    const runtimeOwnedWorktree = worktree('wt-host-owned', {
      hostId: 'runtime:owned-runtime',
      path: '/runtime/orca/owned',
      displayName: 'Runtime Owned'
    })

    expect(
      selectAgentWorkspaceSnapshot(
        stateWithWorktree(runtimeOwnedWorktree, {
          settings: { activeRuntimeEnvironmentId: null } as never
        })
      ).projects.map((project) => [project.id, project.hostKind])
    ).toEqual([[runtimeOwnedWorktree.id, 'runtime']])
  })

  it('marks folder workspace host kind as ssh from folder or project group connection', () => {
    const localGroup = projectGroup({ id: 'group-local' })
    const sshGroup = projectGroup({ id: 'group-ssh', connectionId: 'group-connection' })
    const folderConnected = folderWorkspace({
      id: 'folder-connected',
      projectGroupId: localGroup.id,
      folderPath: '/workspace/service-a',
      connectionId: 'folder-connection'
    })
    const groupConnected = folderWorkspace({
      id: 'folder-group-connected',
      projectGroupId: sshGroup.id,
      folderPath: '/workspace/service-b'
    })

    expect(
      selectAgentWorkspaceSnapshot(
        getState({
          projectGroups: [localGroup, sshGroup],
          folderWorkspaces: [folderConnected, groupConnected]
        })
      ).projects.map((project) => [project.id, project.label, project.path, project.hostKind])
    ).toEqual([
      ['folder:folder-connected', 'service-a', folderConnected.folderPath, 'ssh'],
      ['folder:folder-group-connected', 'service-b', groupConnected.folderPath, 'ssh']
    ])
  })

  it('reports terminal availability for empty, tabbed, and live-thread states', () => {
    const terminal = worktree('wt-terminal', { path: '/repo/orca/term' })
    const terminalTab = tab('tab-terminal', terminal.id)

    expect(selectAgentWorkspaceTerminalAvailable(getState())).toBe(false)
    expect(
      selectAgentWorkspaceTerminalAvailable(
        stateWithWorktree(terminal, {
          tabsByWorktree: { [terminal.id]: [terminalTab] }
        })
      )
    ).toBe(true)
    expect(
      selectAgentWorkspaceTerminalAvailable(
        stateWithWorktree(terminal, {
          agentStatusByPaneKey: {
            [paneKey]: agentEntry(paneKey, {
              state: 'working',
              updatedAt: Date.UTC(2026, 5, 15, 15, 0),
              worktreeId: terminal.id
            })
          }
        })
      )
    ).toBe(true)
  })
})
