// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDefaultSettings } from '../../../../shared/constants'
import { getDefaultSourceControlAiSettings } from '../../../../shared/source-control-ai'
import { normalizeCreateReviewBaseSearchResults } from './useCreatePullRequestDialogFields'
import { useCreatePullRequestDialogFields } from './useCreatePullRequestDialogFields'

const mocks = vi.hoisted(() => ({
  generateRuntimePullRequestFields: vi.fn(),
  getConnectionId: vi.fn(),
  recordFeatureInteraction: vi.fn()
}))

vi.mock('@/runtime/runtime-git-client', () => ({
  cancelRuntimeGeneratePullRequestFields: vi.fn(),
  generateRuntimePullRequestFields: mocks.generateRuntimePullRequestFields
}))

vi.mock('@/lib/connection-context', () => ({
  getConnectionId: mocks.getConnectionId
}))

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => ({
      recordFeatureInteraction: mocks.recordFeatureInteraction
    })
  }
}))

let latestFields: ReturnType<typeof useCreatePullRequestDialogFields> | null = null

const sourceControlAiSettings = {
  ...getDefaultSettings('/tmp'),
  sourceControlAi: {
    ...getDefaultSourceControlAiSettings(),
    enabled: true,
    agentId: 'codex' as const
  }
}

function PullRequestFieldsProbe(): null {
  latestFields = useCreatePullRequestDialogFields({
    open: true,
    repoId: 'repo-1',
    worktreeId: 'id:repo-1::/home/jake/janus-code',
    worktreePath: '/home/jake/janus-code',
    branch: 'feature/ssh-pr',
    eligibility: {
      provider: 'github',
      review: null,
      canCreate: true,
      blockedReason: null,
      nextAction: null,
      defaultBaseRef: 'origin/main',
      title: 'Initial title',
      body: 'Initial body'
    },
    settings: sourceControlAiSettings,
    submitting: false
  })
  return null
}

describe('normalizeCreateReviewBaseSearchResults', () => {
  it('uses detailed local branch names for base refs from arbitrary remotes', () => {
    expect(
      normalizeCreateReviewBaseSearchResults([
        {
          refName: 'mycorp-fork/main',
          localBranchName: 'main'
        }
      ])
    ).toEqual(['main'])
  })

  it('dedupes equivalent base branches found on multiple remotes', () => {
    expect(
      normalizeCreateReviewBaseSearchResults([
        {
          refName: 'origin/main',
          localBranchName: 'main'
        },
        {
          refName: 'upstream/main',
          localBranchName: 'main'
        },
        {
          refName: 'mycorp-fork/release/1.0',
          localBranchName: 'release/1.0'
        }
      ])
    ).toEqual(['main', 'release/1.0'])
  })
})

describe('useCreatePullRequestDialogFields', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    latestFields = null
    mocks.generateRuntimePullRequestFields.mockReset()
    mocks.getConnectionId.mockReset()
    mocks.recordFeatureInteraction.mockReset()
    mocks.getConnectionId.mockReturnValue('ssh-1')
    mocks.generateRuntimePullRequestFields.mockResolvedValue({
      success: true,
      fields: {
        base: 'main',
        title: 'Generated remote PR title',
        body: 'Generated remote PR body',
        draft: false
      }
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('generates PR fields through the selected SSH worktree context', async () => {
    await act(async () => {
      root.render(<PullRequestFieldsProbe />)
      await Promise.resolve()
    })

    await act(async () => {
      await latestFields?.handleGenerate()
    })

    expect(mocks.getConnectionId).toHaveBeenCalledWith('id:repo-1::/home/jake/janus-code')
    expect(mocks.generateRuntimePullRequestFields).toHaveBeenCalledWith(
      {
        settings: sourceControlAiSettings,
        worktreeId: 'id:repo-1::/home/jake/janus-code',
        worktreePath: '/home/jake/janus-code',
        connectionId: 'ssh-1'
      },
      {
        base: 'main',
        title: 'Initial title',
        body: 'Initial body',
        draft: false
      },
      undefined
    )
    expect(mocks.recordFeatureInteraction).toHaveBeenCalledWith('ai-pr-generation')
  })
})
