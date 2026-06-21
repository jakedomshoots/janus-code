export const DICTATION_TOGGLE_REQUEST_EVENT = 'dictation:toggle-request'
export const DICTATION_FINAL_INSERTED_EVENT = 'dictation:final-inserted'
export const DICTATION_SESSION_FAILED_EVENT = 'dictation:session-failed'

export type DictationFinalInsertedDetail = {
  text: string
  targetElement: HTMLElement | null
}

export type DictationSessionFailedDetail = {
  error: string
  targetElement: HTMLElement | null
}

export function requestDictationToggle(): void {
  window.dispatchEvent(new CustomEvent(DICTATION_TOGGLE_REQUEST_EVENT))
}

export function dispatchDictationFinalInserted(detail: DictationFinalInsertedDetail): void {
  window.dispatchEvent(new CustomEvent(DICTATION_FINAL_INSERTED_EVENT, { detail }))
}

export function dispatchDictationSessionFailed(detail: DictationSessionFailedDetail): void {
  window.dispatchEvent(new CustomEvent(DICTATION_SESSION_FAILED_EVENT, { detail }))
}
