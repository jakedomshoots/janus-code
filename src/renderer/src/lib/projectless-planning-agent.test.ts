import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Repo, Worktree } from '../../../shared/types'

const mocks = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  activateAndRevealWorktree: vi.fn(),
  toastError: vi.fn(),
  getDefaultCreateProjectParent: vi.fn(),
  createRepo: vi.fn(),
  setState: vi.fn()
}))

vi.mock('@/store', () => ({
  useAppStore: Object.assign(() => null, {
    getState: () => mocks.state,
    setState: mocks.setState
  })
}))

vi.mock('@/lib/worktree-activation', () => ({
  activateAndRevealWorktree: mocks.activateAndRevealWorktree
}))

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError
  }
}))

import { startProjectlessPlanningAgent } from './projectless-planning-agent'

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: 'repo-1',
    path: '/tmp/Janus Ideas',
    displayName: 'Janus Ideas',
    badgeColor: 'gray',
    addedAt: 1,
    kind: 'folder',
    ...overrides
  }
}

function makeWorktree(repoId = 'repo-1'): Worktree {
  return {
    id: `${repoId}::/tmp/Janus Ideas`,
    repoId,
    path: '/tmp/Janus Ideas',
    displayName: 'Janus Ideas',
    comment: '',
    linkedIssue: null,
    linkedPR: null,
    linkedLinearIssue: null,
    branch: 'main',
    head: 'HEAD',
    isBare: false,
    isMainWorktree: true,
    isArchived: false,
    isUnread: false,
    isPinned: false,
    sortOrder: 1,
    lastActivityAt: 1,
    createdAt: 1
  }
}

function setPlanningState(overrides: Partial<Record<string, unknown>> = {}): void {
  const repo = makeRepo()
  const worktree = makeWorktree(repo.id)
  mocks.getDefaultCreateProjectParent.mockResolvedValue('/tmp')
  mocks.createRepo.mockResolvedValue({ repo })
  mocks.state = {
    settings: {
      defaultTuiAgent: 'codex',
      disabledTuiAgents: [],
      agentCmdOverrides: {}
    },
    repos: [repo],
    projects: [],
    projectHostSetups: [],
    worktreesByRepo: { [repo.id]: [worktree] },
    fetchWorktrees: vi.fn(async () => true),
    ...overrides
  }
  vi.stubGlobal('window', {
    api: {
      repos: {
        getDefaultCreateProjectParent: mocks.getDefaultCreateProjectParent,
        create: mocks.createRepo
      }
    }
  })
}

describe('startProjectlessPlanningAgent', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('activates an existing planning folder project without opening a picker', async () => {
    setPlanningState()

    await startProjectlessPlanningAgent()

    expect(mocks.getDefaultCreateProjectParent).not.toHaveBeenCalled()
    expect(mocks.createRepo).not.toHaveBeenCalled()
    expect(mocks.state.fetchWorktrees).toHaveBeenCalledWith('repo-1')
    expect(mocks.activateAndRevealWorktree).toHaveBeenCalledWith(
      'repo-1::/tmp/Janus Ideas',
      expect.objectContaining({
        sidebarRevealBehavior: 'auto',
        startup: expect.objectContaining({
          command: expect.stringContaining('codex')
        })
      })
    )
  })

  it('creates the planning folder project when it does not exist yet', async () => {
    const repo = makeRepo({ id: 'created-repo' })
    const worktree = makeWorktree(repo.id)
    setPlanningState({
      repos: [],
      worktreesByRepo: { [repo.id]: [worktree] },
      fetchWorktrees: vi.fn(async () => true)
    })
    mocks.createRepo.mockResolvedValue({ repo })

    await startProjectlessPlanningAgent()

    expect(mocks.createRepo).toHaveBeenCalledWith({
      parentPath: '/tmp',
      name: 'Janus Ideas',
      kind: 'folder'
    })
    expect(mocks.activateAndRevealWorktree).toHaveBeenCalledWith(
      'created-repo::/tmp/Janus Ideas',
      expect.objectContaining({ sidebarRevealBehavior: 'auto' })
    )
  })
})
