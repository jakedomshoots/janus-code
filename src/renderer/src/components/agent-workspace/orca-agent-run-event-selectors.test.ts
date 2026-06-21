import { describe, expect, it } from 'vitest'
import type {
  AgentStatusEntry,
  AgentStatusApprovalStatus,
  AgentStatusVerificationStatus
} from '../../../../shared/agent-status-types'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import type { AppState } from '../../store'
import { createTestStore, makeTab, makeWorktree } from '../../store/slices/store-test-helpers'
import { selectAgentWorkspaceSnapshot } from './orca-agent-workspace-selectors'

const firstPaneKey = makePaneKey('tab-agent-1', '11111111-1111-4111-8111-111111111111')
const secondPaneKey = makePaneKey('tab-agent-2', '22222222-2222-4222-8222-222222222222')
const stalePaneKey = makePaneKey('tab-stale', '33333333-3333-4333-8333-333333333333')
const firstWorktree = makeWorktree({
  id: 'wt-agent-1',
  repoId: 'repo-agent',
  path: '/repo/janus-code/worktrees/agent-1'
})
const secondWorktree = makeWorktree({
  id: 'wt-agent-2',
  repoId: 'repo-agent',
  path: '/repo/janus-code/worktrees/agent-2'
})

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState({
    repos: [{ id: 'repo-agent', path: '/repo/janus-code', displayName: 'Janus Code' }],
    worktreesByRepo: { 'repo-agent': [firstWorktree, secondWorktree] },
    activeWorktreeId: firstWorktree.id,
    tabsByWorktree: {
      [firstWorktree.id]: [makeTab({ id: 'tab-agent-1', worktreeId: firstWorktree.id })],
      [secondWorktree.id]: [makeTab({ id: 'tab-agent-2', worktreeId: secondWorktree.id })]
    },
    ...overrides
  } as Partial<AppState>)
  return store.getState()
}

function agentEntry(overrides: Partial<AgentStatusEntry>): AgentStatusEntry {
  return {
    state: 'working',
    prompt: 'Build the run ledger',
    updatedAt: Date.UTC(2026, 5, 21, 16, 10),
    stateStartedAt: Date.UTC(2026, 5, 21, 16, 10),
    agentType: 'codex',
    paneKey: firstPaneKey,
    stateHistory: [],
    ...overrides
  }
}

describe('orca agent run event selectors', () => {
  it('builds provider-neutral run events from agent status without crossing threads', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [firstPaneKey]: agentEntry({
            state: 'waiting',
            updatedAt: Date.UTC(2026, 5, 21, 16, 15),
            stateStartedAt: Date.UTC(2026, 5, 21, 16, 14),
            stateHistory: [
              {
                state: 'working',
                prompt: 'Build the run ledger',
                startedAt: Date.UTC(2026, 5, 21, 16, 10)
              }
            ],
            toolEvent: {
              id: 'tool-1',
              status: 'running',
              name: 'Bash',
              input: 'pnpm test',
              fallbackText: 'Running Bash: pnpm test'
            },
            approval: {
              id: 'approval-1',
              status: 'requested',
              title: 'Approve Bash',
              description: 'Run the focused test suite.',
              toolName: 'Bash',
              toolInput: 'pnpm test',
              fallbackText: 'Approve Bash: pnpm test'
            }
          }),
          [secondPaneKey]: agentEntry({
            paneKey: secondPaneKey,
            state: 'done',
            prompt: 'Unrelated thread',
            updatedAt: Date.UTC(2026, 5, 21, 16, 20),
            stateStartedAt: Date.UTC(2026, 5, 21, 16, 18)
          })
        }
      })
    )

    const runEvents = snapshot.runEvents ?? []
    const firstThreadEvents = runEvents.filter((event) => event.threadId === firstPaneKey)
    expect(firstThreadEvents.map((event) => [event.kind, event.title, event.status])).toEqual([
      ['state', 'Working', 'done'],
      ['state', 'Waiting for user', 'pending'],
      ['tool', 'Bash', 'running'],
      ['approval', 'Approval requested', 'pending'],
      ['telemetry', 'Partial telemetry', 'unknown']
    ])
    expect(firstThreadEvents.map((event) => event.detail)).toContain('pnpm test')
    expect(runEvents.some((event) => event.threadId === secondPaneKey)).toBe(true)
    expect(firstThreadEvents.some((event) => event.detail === 'Unrelated thread')).toBe(false)
  })

  it('shows a pending launch verification command as not run', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {},
        pendingAgentLaunchesByPaneKey: {
          [firstPaneKey]: {
            paneKey: firstPaneKey,
            tabId: 'tab-agent-1',
            worktreeId: firstWorktree.id,
            agent: 'codex',
            prompt: 'Build the verification contract',
            startedAt: Date.UTC(2026, 5, 21, 17, 0),
            verification: {
              command: 'pnpm run typecheck:web',
              status: 'not-run'
            }
          }
        }
      })
    )

    const runEvents = snapshot.runEvents ?? []
    expect(runEvents.map((event) => [event.kind, event.title, event.detail, event.status])).toEqual(
      [
        ['state', 'Starting', 'Codex', 'running'],
        ['verification', 'Verification not run', 'pnpm run typecheck:web', 'pending'],
        [
          'telemetry',
          'Partial telemetry',
          'Janus is waiting for the agent to report structured run state.',
          'unknown'
        ]
      ]
    )
  })

  it('suppresses stale retained run events when a fresh launch is pending in the same pane', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {},
        pendingAgentLaunchesByPaneKey: {
          [firstPaneKey]: {
            paneKey: firstPaneKey,
            tabId: 'tab-agent-1',
            worktreeId: firstWorktree.id,
            agent: 'codex',
            prompt: 'Start the fresh run',
            startedAt: Date.UTC(2026, 5, 21, 17, 0)
          }
        },
        retainedAgentsByPaneKey: {
          [firstPaneKey]: {
            entry: agentEntry({
              state: 'done',
              prompt: 'Old retained run',
              updatedAt: Date.UTC(2026, 5, 21, 16, 0),
              stateStartedAt: Date.UTC(2026, 5, 21, 15, 58),
              toolEvent: {
                id: 'tool-stale',
                status: 'completed',
                name: 'Bash',
                input: 'pnpm stale',
                fallbackText: 'Completed Bash: pnpm stale'
              }
            }),
            worktreeId: firstWorktree.id,
            tab: makeTab({ id: 'tab-agent-1', worktreeId: firstWorktree.id }),
            agentType: 'codex',
            startedAt: Date.UTC(2026, 5, 21, 15, 58)
          },
          [stalePaneKey]: {
            entry: agentEntry({
              paneKey: stalePaneKey,
              state: 'done',
              prompt: 'Closed stale run',
              updatedAt: Date.UTC(2026, 5, 21, 15, 0),
              stateStartedAt: Date.UTC(2026, 5, 21, 14, 58)
            }),
            worktreeId: firstWorktree.id,
            tab: makeTab({ id: 'tab-stale', worktreeId: firstWorktree.id }),
            agentType: 'codex',
            startedAt: Date.UTC(2026, 5, 21, 14, 58)
          }
        }
      })
    )

    const runEvents = snapshot.runEvents ?? []
    const firstThreadEvents = runEvents.filter((event) => event.threadId === firstPaneKey)
    expect(firstThreadEvents.map((event) => [event.kind, event.title, event.detail])).toEqual([
      ['state', 'Starting', 'Codex'],
      [
        'telemetry',
        'Partial telemetry',
        'Janus is waiting for the agent to report structured run state.'
      ]
    ])
    expect(runEvents.some((event) => event.detail === 'Old retained run')).toBe(false)
    expect(runEvents.some((event) => event.detail === 'pnpm stale')).toBe(false)
    expect(firstThreadEvents.some((event) => event.detail === 'Closed stale run')).toBe(false)
  })

  it.each([
    ['running', 'Verification running', 'running'],
    ['passed', 'Verification passed', 'done'],
    ['failed', 'Verification failed', 'failed']
  ] satisfies [AgentStatusVerificationStatus, string, string][])(
    'renders an observed %s verification command',
    (verificationStatus, title, eventStatus) => {
      const snapshot = selectAgentWorkspaceSnapshot(
        getState({
          agentStatusByPaneKey: {
            [firstPaneKey]: agentEntry({
              verification: {
                command: 'pnpm test',
                status: verificationStatus
              }
            })
          }
        })
      )

      const verificationEvent = snapshot.runEvents?.find((event) => event.kind === 'verification')
      expect(verificationEvent).toMatchObject({
        title,
        detail: 'pnpm test',
        status: eventStatus
      })
    }
  )

  it('renders verification execution context in run evidence details', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [firstPaneKey]: agentEntry({
            verification: {
              command: 'pnpm test',
              status: 'running',
              executionContext: {
                hostKind: 'ssh',
                cwd: '/home/jake/janus-code',
                platform: 'linux',
                connectionId: 'ssh-1'
              }
            }
          })
        }
      })
    )

    const verificationEvent = snapshot.runEvents?.find((event) => event.kind === 'verification')
    expect(verificationEvent).toMatchObject({
      title: 'Verification running',
      detail: 'pnpm test - SSH (ssh-1, linux) - /home/jake/janus-code',
      status: 'running'
    })
  })

  it('classifies risky tool and approval commands in run events', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [firstPaneKey]: agentEntry({
            toolEvent: {
              id: 'tool-delete',
              status: 'running',
              name: 'Bash',
              input: 'rm -rf dist',
              fallbackText: 'Running Bash: rm -rf dist'
            },
            approval: {
              id: 'approval-delete',
              status: 'requested',
              title: 'Approve Bash',
              description: 'Delete build output.',
              toolName: 'Bash',
              toolInput: 'rm -rf dist',
              fallbackText: 'Approve Bash: rm -rf dist'
            }
          })
        }
      })
    )

    const toolEvent = snapshot.runEvents?.find((event) => event.kind === 'tool')
    const approvalEvent = snapshot.runEvents?.find((event) => event.kind === 'approval')
    expect(toolEvent?.risk).toMatchObject({
      category: 'delete',
      level: 'high'
    })
    expect(approvalEvent?.risk).toMatchObject({
      category: 'delete',
      level: 'high'
    })
  })

  it('attaches protected resource policy matches to tool and approval commands', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        settings: {
          ...createTestStore().getState().settings!,
          protectedResourcePolicies: [
            {
              id: 'prod-command',
              label: 'Production deploys',
              scope: { kind: 'global' },
              commandPatterns: ['*kubectl*prod*']
            }
          ]
        },
        agentStatusByPaneKey: {
          [firstPaneKey]: agentEntry({
            toolEvent: {
              id: 'tool-prod',
              status: 'running',
              name: 'Bash',
              input: 'kubectl apply -f prod/deploy.yaml',
              fallbackText: 'Running Bash: kubectl apply -f prod/deploy.yaml'
            },
            approval: {
              id: 'approval-prod',
              status: 'requested',
              title: 'Approve Bash',
              description: 'Deploy production manifests.',
              toolName: 'Bash',
              toolInput: 'kubectl apply -f prod/deploy.yaml',
              fallbackText: 'Approve Bash: kubectl apply -f prod/deploy.yaml'
            }
          })
        }
      })
    )

    const toolEvent = snapshot.runEvents?.find((event) => event.kind === 'tool')
    const approvalEvent = snapshot.runEvents?.find((event) => event.kind === 'approval')
    expect(toolEvent?.protectedResourcePolicyMatches?.[0]).toMatchObject({
      policyId: 'prod-command',
      label: 'Production deploys',
      reasons: ['command']
    })
    expect(approvalEvent?.protectedResourcePolicyMatches?.[0]).toMatchObject({
      policyId: 'prod-command',
      label: 'Production deploys',
      reasons: ['command']
    })
  })

  it.each([
    ['approved', 'Approval approved', 'done'],
    ['denied', 'Approval denied', 'failed'],
    ['expired', 'Approval expired', 'unknown']
  ] satisfies [AgentStatusApprovalStatus, string, string][])(
    'renders an %s approval response as a first-class run event',
    (approvalStatus, title, eventStatus) => {
      const snapshot = selectAgentWorkspaceSnapshot(
        getState({
          agentStatusByPaneKey: {
            [firstPaneKey]: agentEntry({
              approval: {
                id: `approval-${approvalStatus}`,
                status: approvalStatus,
                title: 'Approve Bash',
                description: 'Run the focused test suite.',
                toolName: 'Bash',
                toolInput: 'pnpm test',
                fallbackText: 'Approve Bash: pnpm test'
              }
            })
          }
        })
      )

      const approvalEvent = snapshot.runEvents?.find((event) => event.kind === 'approval')
      expect(approvalEvent).toMatchObject({
        title,
        detail: 'pnpm test',
        status: eventStatus
      })
    }
  )
})
