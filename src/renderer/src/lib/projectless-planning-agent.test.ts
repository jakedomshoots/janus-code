import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Repo, Worktree } from '../../../shared/types'

const mocks = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  activateAndRevealWorktree: vi.fn(),
  launchAgentInNewTab: vi.fn(),
  toastError: vi.fn(),
  getDefaultCreateProjectParent: vi.fn(),
  createRepo: vi.fn(),
  setState: vi.fn(),
  tryConnectLocalDevRuntime: vi.fn()
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

vi.mock('@/lib/launch-agent-in-new-tab', () => ({
  launchAgentInNewTab: mocks.launchAgentInNewTab
}))

vi.mock('@/web/web-dev-local-pairing', () => ({
  tryConnectLocalDevRuntime: mocks.tryConnectLocalDevRuntime
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
  mocks.activateAndRevealWorktree.mockReturnValue({ primaryTabId: 'tab-1' })
  mocks.launchAgentInNewTab.mockReturnValue({
    tabId: 'tab-agent',
    startupPlan: {
      agent: 'codex',
      launchCommand: 'codex',
      expectedProcess: 'codex',
      followupPrompt: null
    },
    pasteDraftAfterLaunch: false
  })
  mocks.tryConnectLocalDevRuntime.mockResolvedValue(false)
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

    const result = await startProjectlessPlanningAgent()

    expect(result).toBe(true)
    expect(mocks.getDefaultCreateProjectParent).not.toHaveBeenCalled()
    expect(mocks.createRepo).not.toHaveBeenCalled()
    expect(mocks.state.fetchWorktrees).toHaveBeenCalledWith('repo-1')
    expect(mocks.activateAndRevealWorktree).toHaveBeenCalledWith(
      'repo-1::/tmp/Janus Ideas',
      expect.objectContaining({ sidebarRevealBehavior: 'auto' })
    )
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'repo-1::/tmp/Janus Ideas',
      prompt: '',
      launchSource: 'sidebar'
    })
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

    const result = await startProjectlessPlanningAgent({
      prompt: 'Plan the app first.',
      agent: 'codex'
    })

    expect(result).toBe(true)
    expect(mocks.createRepo).toHaveBeenCalledWith({
      parentPath: '/tmp',
      name: 'Janus Ideas',
      kind: 'folder'
    })
    expect(mocks.activateAndRevealWorktree).toHaveBeenCalledWith(
      'created-repo::/tmp/Janus Ideas',
      expect.objectContaining({ sidebarRevealBehavior: 'auto' })
    )
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'created-repo::/tmp/Janus Ideas',
      prompt: 'Plan the app first.',
      launchSource: 'sidebar'
    })
  })

  it('retries after local dev pairing when the web client starts unpaired', async () => {
    const repo = makeRepo({ id: 'paired-repo' })
    const worktree = makeWorktree(repo.id)
    setPlanningState({
      repos: [],
      worktreesByRepo: { [repo.id]: [worktree] },
      fetchWorktrees: vi.fn(async () => true)
    })
    mocks.getDefaultCreateProjectParent
      .mockRejectedValueOnce(new Error('Pair this web client with a Janus Code server first.'))
      .mockResolvedValueOnce('/tmp')
    mocks.createRepo.mockResolvedValue({ repo })
    mocks.tryConnectLocalDevRuntime.mockResolvedValue(true)

    const result = await startProjectlessPlanningAgent()

    expect(result).toBe(true)
    expect(mocks.tryConnectLocalDevRuntime).toHaveBeenCalledTimes(1)
    expect(mocks.createRepo).toHaveBeenCalledWith({
      parentPath: '/tmp',
      name: 'Janus Ideas',
      kind: 'folder'
    })
    expect(mocks.activateAndRevealWorktree).toHaveBeenCalledWith(
      'paired-repo::/tmp/Janus Ideas',
      expect.objectContaining({ sidebarRevealBehavior: 'auto' })
    )
    expect(mocks.toastError).not.toHaveBeenCalled()
  })

  it('shows a pairing-specific failure when local dev pairing is unavailable', async () => {
    setPlanningState({
      repos: [],
      worktreesByRepo: {},
      fetchWorktrees: vi.fn(async () => true)
    })
    mocks.getDefaultCreateProjectParent.mockRejectedValue(
      new Error('Pair this web client with a Janus Code server first.')
    )
    mocks.tryConnectLocalDevRuntime.mockResolvedValue(false)

    const result = await startProjectlessPlanningAgent()

    expect(result).toBe(false)
    expect(mocks.tryConnectLocalDevRuntime).toHaveBeenCalledTimes(1)
    expect(mocks.toastError).toHaveBeenCalledWith(
      'Connect Janus Code before starting a planning agent.'
    )
    expect(mocks.createRepo).not.toHaveBeenCalled()
    expect(mocks.activateAndRevealWorktree).not.toHaveBeenCalled()
  })
})
