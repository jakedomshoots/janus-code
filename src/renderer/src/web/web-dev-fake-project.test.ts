// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import {
  DEV_FAKE_REPO_ID,
  DEV_FAKE_WORKTREE_ID,
  getDevFakeDetectedWorktrees,
  getDevFakeRepos,
  getDevFakeWorktreesForRepo,
  seedDevFakeProjectLocalState,
  shouldUseDevFakeProject
} from './web-dev-fake-project'
import {
  createStoredWebRuntimeEnvironment,
  saveStoredWebRuntimeEnvironment
} from './web-runtime-environment'

const UI_STORAGE_KEY = 'orca.web.ui.v1'
const SESSION_STORAGE_KEY = 'orca.web.workspaceSession.v1'

afterEach(() => {
  window.localStorage.clear()
})

describe('web-dev-fake-project', () => {
  it('returns fake repo and worktree fixtures', () => {
    expect(getDevFakeRepos()).toEqual([
      expect.objectContaining({
        id: DEV_FAKE_REPO_ID,
        displayName: 'Fake Project'
      })
    ])
    expect(getDevFakeWorktreesForRepo(DEV_FAKE_REPO_ID)).toEqual([
      expect.objectContaining({
        id: DEV_FAKE_WORKTREE_ID,
        displayName: '.factory'
      })
    ])
    expect(getDevFakeDetectedWorktrees(DEV_FAKE_REPO_ID)?.authoritative).toBe(true)
  })

  it('seeds active project state into browser storage', () => {
    seedDevFakeProjectLocalState()

    expect(JSON.parse(window.localStorage.getItem(UI_STORAGE_KEY) ?? '{}')).toMatchObject({
      lastActiveRepoId: DEV_FAKE_REPO_ID,
      lastActiveWorktreeId: DEV_FAKE_WORKTREE_ID
    })
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}')).toMatchObject({
      activeRepoId: DEV_FAKE_REPO_ID,
      activeWorktreeId: DEV_FAKE_WORKTREE_ID
    })
  })

  it('uses fake project only when localhost dev shell is unpaired', () => {
    expect(shouldUseDevFakeProject()).toBe(true)

    saveStoredWebRuntimeEnvironment(
      createStoredWebRuntimeEnvironment({
        name: 'Janus Code Server',
        offer: {
          v: 2,
          endpoint: 'ws://127.0.0.1:6769',
          deviceToken: 'token',
          publicKeyB64: 'cHVibGljS2V5'
        }
      })
    )

    expect(shouldUseDevFakeProject()).toBe(false)
  })
})
