import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as ReactModule from 'react'

const mocks = vi.hoisted(() => ({
  refValues: [] as unknown[],
  refIndex: 0,
  pickFolder: vi.fn(),
  addRepoPath: vi.fn(),
  closeModal: vi.fn(),
  fetchWorktrees: vi.fn(),
  scanNestedRepos: vi.fn(),
  setActiveNestedScanId: vi.fn(),
  setNestedScanInProgress: vi.fn(),
  showNestedRepoReview: vi.fn(),
  onGitRepoReady: vi.fn(),
  setIsAdding: vi.fn(),
  setAddProjectBusyLabel: vi.fn(),
  setRecoveryNotice: vi.fn(),
  toastError: vi.fn()
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactModule>()
  return {
    ...actual,
    useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    useEffect: () => undefined,
    useRef: <T>(value: T) => {
      const index = mocks.refIndex++
      return {
        current: index in mocks.refValues ? (mocks.refValues[index] as T) : value
      }
    }
  }
})

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError
  }
}))

vi.mock('@/lib/telemetry', () => ({
  track: vi.fn()
}))

describe('useAddRepoLocalFolderFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.refIndex = 0
    mocks.refValues = []
    vi.stubGlobal('window', {
      api: {
        repos: {
          pickFolder: mocks.pickFolder
        }
      }
    })
  })

  it('shows a pairing error and clears busy state when the web folder picker is unavailable', async () => {
    mocks.pickFolder.mockRejectedValue(
      new Error('Pair this web client with a Janus Code server first.')
    )
    const { useAddRepoLocalFolderFlow } = await import('./useAddRepoLocalFolderFlow')

    const result = useAddRepoLocalFolderFlow({
      isOpen: true,
      droppedLocalPath: '',
      activeRuntimeEnvironmentId: null,
      addRepoPath: mocks.addRepoPath,
      closeModal: mocks.closeModal,
      fetchWorktrees: mocks.fetchWorktrees,
      scanNestedRepos: mocks.scanNestedRepos,
      setActiveNestedScanId: mocks.setActiveNestedScanId,
      setNestedScanInProgress: mocks.setNestedScanInProgress,
      showNestedRepoReview: mocks.showNestedRepoReview,
      onGitRepoReady: mocks.onGitRepoReady,
      setIsAdding: mocks.setIsAdding,
      setAddProjectBusyLabel: mocks.setAddProjectBusyLabel,
      setRecoveryNotice: mocks.setRecoveryNotice
    })

    await result.handleBrowse()

    expect(mocks.toastError).toHaveBeenCalledWith(
      'Pair this web client with Janus Code before browsing folders.',
      { description: undefined }
    )
    expect(mocks.setIsAdding).toHaveBeenLastCalledWith(false)
    expect(mocks.setAddProjectBusyLabel).toHaveBeenLastCalledWith(null)
    expect(mocks.addRepoPath).not.toHaveBeenCalled()
  })

  it('keeps remote host paths out of the local picker flow and clears busy state', async () => {
    mocks.pickFolder.mockResolvedValue('/Users/jake/project')
    const { useAddRepoLocalFolderFlow } = await import('./useAddRepoLocalFolderFlow')

    const result = useAddRepoLocalFolderFlow({
      isOpen: true,
      droppedLocalPath: '',
      activeRuntimeEnvironmentId: 'runtime-1',
      addRepoPath: mocks.addRepoPath,
      closeModal: mocks.closeModal,
      fetchWorktrees: mocks.fetchWorktrees,
      scanNestedRepos: mocks.scanNestedRepos,
      setActiveNestedScanId: mocks.setActiveNestedScanId,
      setNestedScanInProgress: mocks.setNestedScanInProgress,
      showNestedRepoReview: mocks.showNestedRepoReview,
      onGitRepoReady: mocks.onGitRepoReady,
      setIsAdding: mocks.setIsAdding,
      setAddProjectBusyLabel: mocks.setAddProjectBusyLabel,
      setRecoveryNotice: mocks.setRecoveryNotice
    })

    await result.handleBrowse()

    expect(mocks.toastError).toHaveBeenCalledWith(
      'Use a host path to add projects from a remote host.'
    )
    expect(mocks.closeModal).toHaveBeenCalledTimes(1)
    expect(mocks.addRepoPath).not.toHaveBeenCalled()
    expect(mocks.scanNestedRepos).not.toHaveBeenCalled()
    expect(mocks.setIsAdding).toHaveBeenLastCalledWith(false)
    expect(mocks.setAddProjectBusyLabel).toHaveBeenLastCalledWith(null)
  })
})
