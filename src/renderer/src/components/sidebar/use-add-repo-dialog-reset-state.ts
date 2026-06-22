import { useCallback, type Dispatch, type SetStateAction } from 'react'
import type { AddRepoDialogStep } from './add-repo-dialog-types'

type AddProjectRecoveryNotice = {
  title: string
  description: string
  actionLabel?: string
}

export function useAddRepoDialogResetState({
  resetLocalFolderFlow,
  setStep,
  setIsAdding,
  setAddProjectBusyLabel,
  setAddProjectRecoveryNotice,
  resetServerPathFlow,
  resetCloneFlow,
  resetNestedImportFlow,
  resetNestedRepoReviewState,
  resetCreateDefaultState,
  resetCreateState,
  resetRemoteState
}: {
  resetLocalFolderFlow: () => void
  setStep: Dispatch<SetStateAction<AddRepoDialogStep>>
  setIsAdding: Dispatch<SetStateAction<boolean>>
  setAddProjectBusyLabel: Dispatch<SetStateAction<string | null>>
  setAddProjectRecoveryNotice: Dispatch<SetStateAction<AddProjectRecoveryNotice | null>>
  resetServerPathFlow: () => void
  resetCloneFlow: () => void
  resetNestedImportFlow: () => void
  resetNestedRepoReviewState: () => void
  resetCreateDefaultState: () => void
  resetCreateState: () => void
  resetRemoteState: () => void
}): {
  resetState: () => void
  resetHostScopedState: () => void
} {
  const resetState = useCallback(() => {
    // Why: kill the git clone process if one is running, so backing out
    // or closing the dialog doesn't leave a clone running on disk.
    void window.api.repos.cloneAbort()
    resetLocalFolderFlow()
    setStep('add')
    setIsAdding(false)
    setAddProjectBusyLabel(null)
    setAddProjectRecoveryNotice(null)
    resetServerPathFlow()
    resetCloneFlow()
    resetNestedImportFlow()
    resetNestedRepoReviewState()
    resetCreateDefaultState()
    resetCreateState()
    resetRemoteState()
  }, [
    resetCloneFlow,
    resetLocalFolderFlow,
    resetNestedRepoReviewState,
    resetCreateDefaultState,
    resetServerPathFlow,
    resetNestedImportFlow,
    resetRemoteState,
    resetCreateState,
    setAddProjectBusyLabel,
    setAddProjectRecoveryNotice,
    setIsAdding,
    setStep
  ])

  const resetHostScopedState = useCallback(() => {
    setIsAdding(false)
    setAddProjectBusyLabel(null)
    setAddProjectRecoveryNotice(null)
    resetServerPathFlow()
    resetCloneFlow()
    resetCreateDefaultState()
    resetCreateState()
    resetRemoteState()
  }, [
    resetCloneFlow,
    resetCreateDefaultState,
    resetCreateState,
    resetRemoteState,
    resetServerPathFlow,
    setAddProjectBusyLabel,
    setAddProjectRecoveryNotice,
    setIsAdding
  ])

  return { resetState, resetHostScopedState }
}
