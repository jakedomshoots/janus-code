// @vitest-environment happy-dom

import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DICTATION_FINAL_INSERTED_EVENT,
  DICTATION_TOGGLE_REQUEST_EVENT
} from '../dictation/dictation-session-events'
import * as harness from './agent-composer.test.harness'
import { AgentComposer } from './AgentComposer'

const mocks = harness.getAgentComposerMocks()
describe('AgentComposer', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    ;({ root, container } = harness.setupAgentComposerTestRoot())
  })

  afterEach(async () => {
    await harness.cleanupAgentComposerTestRoot(root)
  })

  it('requests configured voice dictation from the focused composer draft', async () => {
    mocks.settings.voice = harness.makeVoiceSettings()
    const onDictationToggle = vi.fn()
    window.addEventListener(DICTATION_TOGGLE_REQUEST_EVENT, onDictationToggle)

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[aria-label="Dictate prompt"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(false)

    await act(async () => {
      button?.click()
    })

    expect(document.activeElement).toBe(textarea)
    expect(onDictationToggle).toHaveBeenCalledTimes(1)
    expect(mocks.launchAgentInNewTab).not.toHaveBeenCalled()
    window.removeEventListener(DICTATION_TOGGLE_REQUEST_EVENT, onDictationToggle)
  })

  it('renders voice dictation disabled until a speech model is configured', async () => {
    mocks.settings.voice = harness.makeVoiceSettings({ sttModel: '' })

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Configure dictation in Settings > Voice"]'
    )
    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(true)
    expect(button?.dataset.state).toBe('disabled')
  })

  it('keeps inserted voice transcripts editable without auto-submitting', async () => {
    mocks.settings.voice = harness.makeVoiceSettings()

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Plan:')
      harness.setTextControlValue(textarea!, 'Plan: audit logging')
      window.dispatchEvent(
        new CustomEvent(DICTATION_FINAL_INSERTED_EVENT, {
          detail: {
            text: ' audit logging',
            targetElement: textarea
          }
        })
      )
    })

    expect(textarea?.value).toBe('Plan: audit logging')
    expect(
      container.querySelector<HTMLButtonElement>('button[aria-label="Transcript inserted"]')
    ).not.toBeNull()
    expect(mocks.launchAgentInNewTab).not.toHaveBeenCalled()
  })

  it('opens the terminal drawer from the composer toolbar', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          terminalAvailable={true}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === 'Open terminal drawer'
    )

    expect(button).not.toBeNull()
    expect(button?.disabled).toBe(false)

    await act(async () => {
      button?.click()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('debug-button')
  })
})
