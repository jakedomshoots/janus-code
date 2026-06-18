import type { ClipboardEvent, Dispatch, SetStateAction } from 'react'
import {
  containsLegacyBrowserGrabDump,
  stripInjectedBrowserGrabDump
} from '../browser-pane/strip-browser-grab-dump'

export function handleAgentComposerPaste({
  event,
  prompt,
  setPrompt
}: {
  event: ClipboardEvent<HTMLTextAreaElement>
  prompt: string
  setPrompt: Dispatch<SetStateAction<string>>
}): void {
  const pastedText = event.clipboardData.getData('text/plain')
  if (!containsLegacyBrowserGrabDump(pastedText)) {
    return
  }
  event.preventDefault()
  const stripped = stripInjectedBrowserGrabDump(pastedText)
  if (!stripped) {
    return
  }
  const textarea = event.currentTarget
  const start = textarea.selectionStart ?? prompt.length
  const end = textarea.selectionEnd ?? prompt.length
  setPrompt(
    stripInjectedBrowserGrabDump(`${prompt.slice(0, start)}${stripped}${prompt.slice(end)}`)
  )
}
