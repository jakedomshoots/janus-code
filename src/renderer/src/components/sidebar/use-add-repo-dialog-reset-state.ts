import { useCallback, type Dispatch, type SetStateAction } from 'react'
import type { AddRepoDialogStep } from './add-repo-dialog-types'

export type AddRepoRecoveryNotice = {
  title: string
  description: string
  actionLabel?: string
}

type AddRepoDialogResetStateOptions = {
  resetCloneFlow: () => void
  resetCreateDefaultState: () => void
  resetCreateState: () => void
  resetLocalFolderFlow: () => void
  resetNestedImportFlow: () => void
  resetNestedRepoReviewState: () => void
  resetRemoteState: () => void
  resetServerPathFlow: () => void
  setAddProjectBusyLabel: Dispatch<SetStateAction<string | null>>
  setAddProjectRecoveryNotice: Dispatch<SetStateAction<AddRepoRecoveryNotice | null>>
  setIsAdding: Dispatch<SetStateAction<boolean>>
  setStep: Dispatch<SetStateAction<AddRepoDialogStep>>
}

type AddRepoDialogResetState = {
  resetHostScopedState: () => void
  resetState: () => void
}

export function useAddRepoDialogResetState({
  resetCloneFlow,
  resetCreateDefaultState,
  resetCreateState,
  resetLocalFolderFlow,
  resetNestedImportFlow,
  resetNestedRepoReviewState,
  resetRemoteState,
  resetServerPathFlow,
  setAddProjectBusyLabel,
  setAddProjectRecoveryNotice,
  setIsAdding,
  setStep
}: AddRepoDialogResetStateOptions): AddRepoDialogResetState {
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

  return { resetHostScopedState, resetState }
}
