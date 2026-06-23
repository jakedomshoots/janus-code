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

describe('orca agent workspace selectors', () => {
  it('returns an empty snapshot when there is no active worktree', () => {
    expect(selectAgentWorkspaceSnapshot(getState())).toEqual({
      activeWorktreeId: null,
      projects: [],
      threads: [],
      plans: [],
      timeline: [],
      approvals: [],
      diffs: [],
      reviews: [],
      terminalAvailable: false
    })
  })

  it('shows an active worktree project without tabs or threads', () => {
    const active = worktree('wt-empty', {
      path: '/repo/janus-code/worktrees/task-1',
      displayName: '',
      branch: 'refs/heads/feature/janus-gui-workspace'
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
        project.hostKind,
        project.branchName,
        project.repoId,
        project.canCreateWorktree,
        project.canDeleteWorktree,
        project.agentDetectionTarget
      ])
    ).toEqual([
      [
        active.id,
        'feature/janus-gui-workspace',
        active.path,
        'local',
        'feature/janus-gui-workspace',
        repo.id,
        true,
        true,
        { kind: 'local' }
      ]
    ])
  })

  it('shows pending GUI-launched CLI agents as starting threads immediately', () => {
    const active = worktree('wt-pending', {
      path: '/repo/janus-code/worktrees/pending-agent',
      displayName: 'Pending Agent',
      branch: 'refs/heads/feature/pending-agent'
    })
    const pendingPaneKey = makePaneKey('tab-pending', '66666666-6666-4666-8666-666666666666')

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(active, {
        activeWorktreeId: active.id,
        tabsByWorktree: { [active.id]: [tab('tab-pending', active.id)] },
        ...({
          pendingAgentLaunchesByPaneKey: {
            [pendingPaneKey]: {
              paneKey: pendingPaneKey,
              tabId: 'tab-pending',
              worktreeId: active.id,
              agent: 'codex',
              prompt: 'Make the CLI launch feel instant.',
              startedAt: Date.UTC(2026, 5, 20, 18, 0)
            }
          }
        } as unknown as Partial<AppState>)
      })
    )

    expect(snapshot.threads).toEqual([
      expect.objectContaining({
        id: pendingPaneKey,
        worktreeId: active.id,
        title: 'Make the CLI launch feel instant.',
        agentKind: 'codex',
        phase: 'starting',
        updatedAt: '2026-06-20T18:00:00.000Z'
      })
    ])
    expect(snapshot.timeline.map((entry) => [entry.kind, entry.text, entry.status])).toEqual([
      ['user', 'Make the CLI launch feel instant.', 'done'],
      ['system', 'Starting Codex...', 'running']
    ])
  })

  it('returns a stable snapshot reference when the backing state slices have not changed', () => {
    const active = worktree('wt-stable', {
      path: '/repo/janus-code/worktrees/stable',
      branch: 'refs/heads/feature/stable'
    })
    const state = stateWithWorktree(active, { activeWorktreeId: active.id })

    expect(selectAgentWorkspaceSnapshot(state)).toBe(selectAgentWorkspaceSnapshot(state))
  })

  it('maps a running agent tab to a running thread', () => {
    const running = worktree('wt-running', {
      path: '/repo/janus-code/worktrees/running',
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

  it('maps source-control git status entries to selected agent diffs', () => {
    const running = worktree('wt-diff', {
      path: '/repo/janus-code/worktrees/diff',
      branch: 'refs/heads/feature/diff'
    })
    const runningTab = tab('tab-agent', running.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(running, {
        activeWorktreeId: running.id,
        tabsByWorktree: { [running.id]: [runningTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'working',
            updatedAt: Date.UTC(2026, 5, 15, 14, 30)
          })
        },
        gitStatusByWorktree: {
          [running.id]: [
            {
              path: 'src/renamed.ts',
              oldPath: 'src/old.ts',
              status: 'renamed',
              area: 'staged',
              added: 2,
              removed: 1
            },
            {
              path: 'src/app.ts',
              status: 'modified',
              area: 'unstaged',
              added: 7,
              removed: 3
            }
          ]
        }
      })
    )

    expect(snapshot.diffs).toEqual([
      {
        id: `${paneKey}:unstaged:modified:no-old-path:src/app.ts`,
        threadId: paneKey,
        area: 'unstaged',
        filePath: 'src/app.ts',
        additions: 7,
        deletions: 3,
        status: 'modified'
      },
      {
        id: `${paneKey}:staged:renamed:src/old.ts:src/renamed.ts`,
        threadId: paneKey,
        area: 'staged',
        filePath: 'src/renamed.ts',
        oldPath: 'src/old.ts',
        additions: 2,
        deletions: 1,
        status: 'renamed'
      }
    ])
  })

  it('maps structured agent status plans to workspace plans', () => {
    const running = worktree('wt-plan', {
      path: '/repo/janus-code/worktrees/plan',
      branch: 'refs/heads/feature/plan'
    })
    const runningTab = tab('tab-agent', running.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(running, {
        activeWorktreeId: running.id,
        tabsByWorktree: { [running.id]: [runningTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'working',
            updatedAt: Date.UTC(2026, 5, 15, 14, 30),
            plan: {
              title: 'Build GUI workspace',
              explanation: 'Use the runtime plan snapshot.',
              steps: [
                { id: 'inspect', title: 'Inspect runtime state', status: 'completed' },
                { id: 'wire', title: 'Wire plan panel', status: 'in-progress' }
              ],
              markdown: '# Build GUI workspace',
              updatedAt: Date.UTC(2026, 5, 15, 14, 31)
            }
          })
        }
      })
    )

    expect(snapshot.plans).toEqual([
      {
        id: `${paneKey}:plan`,
        threadId: paneKey,
        title: 'Build GUI workspace',
        explanation: 'Use the runtime plan snapshot.',
        steps: [
          { id: 'inspect', title: 'Inspect runtime state', status: 'completed' },
          { id: 'wire', title: 'Wire plan panel', status: 'in-progress' }
        ],
        markdown: '# Build GUI workspace',
        updatedAt: '2026-06-15T14:31:00.000Z'
      }
    ])
  })

  it('maps structured approval requests to workspace approvals', () => {
    const running = worktree('wt-approval', {
      path: '/repo/janus-code/worktrees/approval',
      branch: 'refs/heads/feature/approval'
    })
    const runningTab = tab('tab-agent', running.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(running, {
        activeWorktreeId: running.id,
        tabsByWorktree: { [running.id]: [runningTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'waiting',
            updatedAt: Date.UTC(2026, 5, 15, 14, 35),
            approval: {
              id: 'approval-1',
              status: 'requested',
              title: 'Approve Bash',
              description: 'Run the test suite.',
              toolName: 'Bash',
              toolInput: 'pnpm test',
              fallbackText: 'Approve Bash: pnpm test'
            }
          })
        }
      })
    )

    expect(snapshot.approvals).toEqual([
      {
        id: `${paneKey}:approval:approval-1`,
        threadId: paneKey,
        providerKind: 'codex',
        worktreeId: running.id,
        status: 'requested',
        title: 'Approve Bash',
        description: 'Run the test suite.',
        toolName: 'Bash',
        toolInput: 'pnpm test',
        fallbackText: 'Approve Bash: pnpm test',
        updatedAt: '2026-06-15T14:35:00.000Z'
      }
    ])
  })

  it('keeps structured tool lifecycle events out of chat timeline entries', () => {
    const running = worktree('wt-tool-event', {
      path: '/repo/janus-code/worktrees/tool-event',
      branch: 'refs/heads/feature/tool-event'
    })
    const runningTab = tab('tab-agent', running.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(running, {
        activeWorktreeId: running.id,
        tabsByWorktree: { [running.id]: [runningTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'working',
            updatedAt: Date.UTC(2026, 5, 15, 14, 40),
            toolEvent: {
              id: 'tool-1',
              status: 'completed',
              name: 'Bash',
              input: 'pnpm test',
              output: '154 tests passed',
              fallbackText: 'Completed Bash: pnpm test'
            }
          })
        }
      })
    )

    expect(snapshot.timeline).toEqual([
      {
        id: `${paneKey}:prompt:1781534400000`,
        threadId: paneKey,
        kind: 'user',
        text: 'Implement Task 1.2 from the Janus Code GUI plan',
        createdAt: '2026-06-15T14:40:00.000Z',
        status: 'done'
      },
      {
        id: `${paneKey}:working-indicator:1781534400000`,
        threadId: paneKey,
        kind: 'agent',
        text: '',
        createdAt: '2026-06-15T14:40:00.000Z',
        status: 'running'
      }
    ])
  })

  it('maps structured agent failures to failed threads and error timeline entries', () => {
    const failed = worktree('wt-failure', {
      path: '/repo/janus-code/worktrees/failure',
      branch: 'refs/heads/feature/failure'
    })
    const failedTab = tab('tab-agent', failed.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(failed, {
        activeWorktreeId: failed.id,
        tabsByWorktree: { [failed.id]: [failedTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'done',
            updatedAt: Date.UTC(2026, 5, 15, 14, 45),
            failure: {
              id: 'failure-1',
              source: 'hook',
              reason: 'Model is not supported.',
              fallbackText: 'Agent failed: model is not supported',
              providerKind: 'codex',
              worktreeId: failed.id,
              occurredAt: Date.UTC(2026, 5, 15, 14, 44)
            }
          })
        }
      })
    )

    expect(snapshot.threads[0]).toMatchObject({
      id: paneKey,
      phase: 'failed'
    })
    expect(snapshot.timeline).toEqual([
      {
        id: `${paneKey}:prompt:1781534700000`,
        threadId: paneKey,
        kind: 'user',
        text: 'Implement Task 1.2 from the Janus Code GUI plan',
        createdAt: '2026-06-15T14:44:00.000Z',
        status: 'done'
      },
      {
        id: `${paneKey}:failure:failure-1`,
        threadId: paneKey,
        kind: 'error',
        text: 'Agent failed: model is not supported',
        createdAt: '2026-06-15T14:44:00.000Z',
        status: 'failed'
      }
    ])
  })

  it('maps completed agent summaries to timeline entries', () => {
    const completed = worktree('wt-completion', {
      path: '/repo/janus-code/worktrees/completion',
      branch: 'refs/heads/feature/completion'
    })
    const completedTab = tab('tab-agent', completed.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(completed, {
        activeWorktreeId: completed.id,
        tabsByWorktree: { [completed.id]: [completedTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'done',
            updatedAt: Date.UTC(2026, 5, 15, 14, 50),
            lastAssistantMessage: 'Implemented the structured runtime checkpoint.'
          })
        }
      })
    )

    expect(snapshot.timeline).toEqual([
      {
        id: `${paneKey}:prompt:1781535000000`,
        threadId: paneKey,
        kind: 'user',
        text: 'Implement Task 1.2 from the Janus Code GUI plan',
        createdAt: '2026-06-15T14:50:00.000Z',
        status: 'done'
      },
      {
        id: `${paneKey}:completion:1781535000000`,
        threadId: paneKey,
        kind: 'agent',
        text: 'Implemented the structured runtime checkpoint.',
        createdAt: '2026-06-15T14:50:00.000Z',
        status: 'done'
      }
    ])
  })

  it('maps preserved conversation turns before the current model response', () => {
    const chat = worktree('wt-chat', {
      path: '/repo/janus-code/worktrees/chat',
      branch: 'refs/heads/feature/chat'
    })
    const chatTab = tab('tab-agent', chat.id)

    const snapshot = selectAgentWorkspaceSnapshot(
      stateWithWorktree(chat, {
        activeWorktreeId: chat.id,
        tabsByWorktree: { [chat.id]: [chatTab] },
        agentStatusByPaneKey: {
          [paneKey]: agentEntry(paneKey, {
            state: 'done',
            prompt: 'Second question',
            updatedAt: Date.UTC(2026, 5, 15, 14, 55),
            stateStartedAt: Date.UTC(2026, 5, 15, 14, 54),
            lastAssistantMessage: 'Second answer',
            conversation: [
              {
                id: `${paneKey}:turn:1781535000000`,
                prompt: 'First question',
                assistantMessage: 'First answer',
                startedAt: Date.UTC(2026, 5, 15, 14, 50),
                completedAt: Date.UTC(2026, 5, 15, 14, 51)
              }
            ]
          })
        }
      })
    )

    expect(snapshot.timeline.map((entry) => [entry.kind, entry.text])).toEqual([
      ['user', 'First question'],
      ['agent', 'First answer'],
      ['user', 'Second question'],
      ['agent', 'Second answer']
    ])
  })

  it('maps waiting and blocked statuses to user-action phases', () => {
    const action = worktree('wt-action', { path: '/repo/janus-code/worktrees/action' })

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
    const done = worktree('wt-done', { path: '/repo/janus-code/done' })

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
    const disconnected = worktree('wt-disconnected', { path: '/repo/janus-code/disconnected' })

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
