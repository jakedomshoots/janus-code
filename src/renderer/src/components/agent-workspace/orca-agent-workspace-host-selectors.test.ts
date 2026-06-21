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

const repo = { ...TEST_REPO, id: 'repo-janus', path: '/repo/janus-code', displayName: 'Janus Code' }
const sshRepo = { ...TEST_REPO, id: 'repo-ssh', connectionId: 'ssh-target-1' }
const runtimeRepo = { ...TEST_REPO, id: 'repo-runtime', path: '/runtime/janus-code' }

const paneKey = makePaneKey('tab-agent', '11111111-1111-4111-8111-111111111111')
const retainedPaneKey = makePaneKey('tab-retained', '55555555-5555-4555-8555-555555555555')

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState(overrides as Partial<AppState>)
  return store.getState()
}

function worktree(id: string, overrides: Partial<Worktree> = {}): Worktree {
  return makeWorktree({ id, repoId: repo.id, path: `/repo/janus-code/${id}`, ...overrides })
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
    prompt: 'Implement Task 1.2 from the Janus Code GUI plan',
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
describe('orca agent workspace host selectors', () => {
  it('keeps retained completed agents visible when their tab is gone', () => {
    const retained = worktree('wt-retained', {
      path: '/repo/janus-code/retained',
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
      path: '/srv/janus-code/ssh',
      displayName: 'SSH Work'
    })
    const runtimeWorktree = makeWorktree({
      id: 'wt-runtime',
      repoId: runtimeRepo.id,
      path: '/runtime/janus-code/work',
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
      ).projects.map((project) => [project.id, project.hostKind, project.agentDetectionTarget])
    ).toEqual([
      [sshWorktree.id, 'ssh', { kind: 'ssh', connectionId: 'ssh-target-1' }],
      [runtimeWorktree.id, 'runtime', { kind: 'runtime', environmentId: 'runtime-env-1' }]
    ])
  })

  it('uses worktree host ownership before repo or focused host defaults', () => {
    const runtimeOwnedWorktree = worktree('wt-host-owned', {
      hostId: 'runtime:owned-runtime',
      path: '/runtime/janus-code/owned',
      displayName: 'Runtime Owned'
    })

    expect(
      selectAgentWorkspaceSnapshot(
        stateWithWorktree(runtimeOwnedWorktree, {
          settings: { activeRuntimeEnvironmentId: null } as never
        })
      ).projects.map((project) => [project.id, project.hostKind, project.agentDetectionTarget])
    ).toEqual([
      [runtimeOwnedWorktree.id, 'runtime', { kind: 'runtime', environmentId: 'owned-runtime' }]
    ])
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
      ).projects.map((project) => [
        project.id,
        project.label,
        project.path,
        project.hostKind,
        project.agentDetectionTarget
      ])
    ).toEqual([
      [
        'folder:folder-connected',
        'service-a',
        folderConnected.folderPath,
        'ssh',
        { kind: 'ssh', connectionId: 'folder-connection' }
      ],
      [
        'folder:folder-group-connected',
        'service-b',
        groupConnected.folderPath,
        'ssh',
        { kind: 'ssh', connectionId: 'group-connection' }
      ]
    ])
  })

  it('reports terminal availability for empty, tabbed, and live-thread states', () => {
    const terminal = worktree('wt-terminal', { path: '/repo/janus-code/term' })
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
