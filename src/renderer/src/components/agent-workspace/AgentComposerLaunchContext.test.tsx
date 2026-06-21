// @vitest-environment happy-dom

import { act } from 'react'
import { flushSync } from 'react-dom'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
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

  it('ignores a stale submit result after the selected thread changes', async () => {
    const firstSend = harness.deferred<ActiveAgentNotesSendResult>()
    mocks.sendNotesToActiveAgentSession.mockReturnValue(firstSend.promise)

    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Keep this draft.')
    })
    await act(async () => {
      button?.click()
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-2"
          selectedThread={harness.makeThread({ id: 'thread-2', worktreeId: 'worktree-2' })}
        />
      )
    })

    await act(async () => {
      firstSend.resolve({ status: 'sent' })
      await firstSend.promise
    })

    const nextTextarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(container.textContent).not.toContain('Sent to codex.')
    expect(nextTextarea?.value).toBe('Keep this draft.')
  })

  it('updates stale-submit guards during the selection-change commit', async () => {
    const firstSend = harness.deferred<ActiveAgentNotesSendResult>()
    mocks.sendNotesToActiveAgentSession.mockReturnValue(firstSend.promise)

    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Keep this draft.')
    })
    await act(async () => {
      button?.click()
    })

    flushSync(() => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-2"
          selectedThread={harness.makeThread({ id: 'thread-2', worktreeId: 'worktree-2' })}
        />
      )
    })

    firstSend.resolve({ status: 'sent' })
    await act(async () => {
      await firstSend.promise
    })

    const nextTextarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(container.textContent).not.toContain('Sent to codex.')
    expect(nextTextarea?.value).toBe('Keep this draft.')
  })

  it('launches the selected detected provider when no running thread is selected', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open provider menu')?.click()
    })
    const openCodeOption = harness.getDocumentButton('Set agent provider: OpenCode')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(openCodeOption).not.toBeNull()
    expect(button).not.toBeNull()
    expect(harness.getDocumentButton('Set agent provider: Codex')).toBeNull()

    await act(async () => {
      openCodeOption?.click()
    })
    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use OpenCode for this workspace.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'opencode',
      worktreeId: 'worktree-1',
      prompt: 'Use OpenCode for this workspace.',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
    expect(textarea?.value).toBe('Use OpenCode for this workspace.')

    const launchArgs = mocks.launchAgentInNewTab.mock.calls.at(-1)?.[0] as
      | { onPromptDelivered?: () => void }
      | undefined
    await act(async () => {
      launchArgs?.onPromptDelivered?.()
    })
    expect(textarea?.value).toBe('')
  })

  it('passes a verification command into new agent launches', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const verificationInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Verification command"]'
    )
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(verificationInput).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Build the feature.')
      harness.setTextControlValue(verificationInput!, 'pnpm run typecheck:web')
    })
    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Verification')
    expect(contextTray!.textContent).toContain('pnpm run typecheck:web')

    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: 'claude',
        worktreeId: 'worktree-1',
        prompt: 'Build the feature.',
        promptDelivery: 'auto-submit',
        launchSource: 'new_workspace_composer',
        verificationCommand: 'pnpm run typecheck:web',
        promptContextManifest: {
          items: [
            {
              id: 'verification-command',
              kind: 'verification',
              command: 'pnpm run typecheck:web'
            },
            {
              id: 'agent-memory-context',
              kind: 'memory',
              command: '/memory'
            }
          ]
        },
        onPromptDelivered: expect.any(Function)
      })
    )
  })

  it('binds verification commands to the selected SSH workspace execution context', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-remote"
          selectedThread={null}
          selectedProject={{
            id: 'worktree-remote',
            label: 'Remote Janus',
            path: '/home/jake/janus-code',
            hostKind: 'ssh',
            branchName: 'feature/remote',
            agentDetectionTarget: { kind: 'ssh', connectionId: 'ssh-1' }
          }}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const verificationInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Verification command"]'
    )
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(verificationInput).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Build the remote feature.')
      harness.setTextControlValue(verificationInput!, 'pnpm test')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith(
      expect.objectContaining({
        worktreeId: 'worktree-remote',
        launchPlatform: 'linux',
        verificationCommand: 'pnpm test',
        verificationExecutionContext: {
          hostKind: 'ssh',
          cwd: '/home/jake/janus-code',
          platform: 'linux',
          connectionId: 'ssh-1'
        }
      })
    )
  })

  it('removes verification command context before launch', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const verificationInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Verification command"]'
    )
    expect(verificationInput).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(verificationInput!, 'pnpm test')
    })
    expect(container.textContent).toContain('Verification')
    expect(container.textContent).toContain('pnpm test')

    const removeVerificationButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove verification context"]'
    )
    expect(removeVerificationButton).not.toBeNull()

    await act(async () => {
      removeVerificationButton?.click()
    })

    expect(verificationInput?.value).toBe('')
    expect(container.textContent).not.toContain('Verification')
    expect(container.textContent).not.toContain('pnpm test')
  })
})
