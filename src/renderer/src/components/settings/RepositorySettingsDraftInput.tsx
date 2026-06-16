import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'

type RepoTextDraft = { repoId: string; text: string }

// Why: updateRepo persists via async IPC before the store value updates, so a
// store-controlled input resets mid-IME-composition (Hangul decomposes into
// jamo). Keep keystrokes in local draft state; persist stays per-keystroke.
export function RepoSettingsDraftInput({
  repoId,
  storeValue,
  onTextChange,
  ...inputProps
}: {
  repoId: string
  storeValue: string
  onTextChange: (text: string) => void
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>): React.JSX.Element {
  const [draft, setDraft] = useState<RepoTextDraft>({ repoId, text: storeValue })
  const pendingStoreEchoesRef = useRef<string[]>([])
  const isEditingRef = useRef(false)
  const lastPersistedTextRef = useRef<string | null>(null)

  const updateDraftFromInput = (nextText: string): void => {
    setDraft({ repoId, text: nextText })
    if (lastPersistedTextRef.current === nextText) {
      return
    }
    lastPersistedTextRef.current = nextText
    pendingStoreEchoesRef.current.push(nextText)
    onTextChange(nextText)
  }

  useEffect(() => {
    setDraft((current) => {
      if (current.repoId !== repoId) {
        pendingStoreEchoesRef.current = []
        lastPersistedTextRef.current = null
        return { repoId, text: storeValue }
      }
      if (storeValue === current.text) {
        pendingStoreEchoesRef.current = []
        return current
      }
      const pendingEchoIndex = pendingStoreEchoesRef.current.indexOf(storeValue)
      if (pendingEchoIndex !== -1) {
        // Why: queued updateRepo calls can echo older input text after newer
        // keystrokes; accepting that echo re-cancels active IME composition.
        pendingStoreEchoesRef.current.splice(0, pendingEchoIndex + 1)
        return current
      }
      if (isEditingRef.current) {
        // Why: even a non-pending store value rewrite can cancel an active IME
        // composition. While the field is focused, the local draft is the
        // source of truth; external store sync can resume after blur.
        return current
      }
      pendingStoreEchoesRef.current = []
      return { repoId, text: storeValue }
    })
  }, [repoId, storeValue])

  const text = draft.repoId === repoId ? draft.text : storeValue
  return (
    <Input
      {...inputProps}
      value={text}
      onBlur={(e) => {
        isEditingRef.current = false
        inputProps.onBlur?.(e)
      }}
      onChange={(e) => {
        updateDraftFromInput(e.target.value)
      }}
      onFocus={(e) => {
        isEditingRef.current = true
        inputProps.onFocus?.(e)
      }}
      onInput={(e) => {
        updateDraftFromInput(e.currentTarget.value)
        inputProps.onInput?.(e)
      }}
    />
  )
}
