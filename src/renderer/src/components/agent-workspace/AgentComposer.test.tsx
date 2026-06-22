// @vitest-environment happy-dom

import { act } from 'react'
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

  it('renders the bottom chat composer skin without hiding core controls', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const form = container.querySelector('form')
    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const panel = textarea?.parentElement
    const footerLayout = container.querySelector(
      '#agent-workspace-composer-status'
    )?.nextElementSibling

    expect(form?.className).toContain('border-t')
    expect(form?.className).toContain('bg-background/95')
    expect(textarea?.className).toContain('min-h-16')
    expect(textarea?.getAttribute('rows')).toBe('2')
    expect(panel?.className).toContain('rounded-xl')
    expect(footerLayout?.className).toContain('flex min-h-10 flex-wrap items-center gap-2')
    expect(footerLayout?.className).not.toContain('justify-between')
    expect(container.querySelector('select[aria-label="Thinking mode"]')).toBeNull()
    expect(container.querySelector('select[aria-label="Agent model"]')).toBeNull()
    expect(container.querySelector('select[aria-label="Agent provider"]')).toBeNull()
    expect(container.querySelector('button[type="submit"]')).not.toBeNull()

    await harness.openAgentSettings(container)

    expect(harness.getDocumentButton('Set reasoning: Medium')).not.toBeNull()
    expect(harness.getDocumentButton('Open model menu')).not.toBeNull()
    expect(harness.getDocumentButton('Open provider menu')).not.toBeNull()
  })

  it('renders provider task-fit hints without changing provider selection', async () => {
    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
      await harness.flushMicrotasks()
    })

    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open provider menu')?.click()
    })

    expect(document.body.textContent).toContain('Broad refactor')
    expect(document.body.textContent).toContain('Fast edit')

    const openCodeOption = harness.getDocumentButton('Set agent provider: OpenCode')
    expect(openCodeOption).not.toBeNull()

    await act(async () => {
      openCodeOption?.click()
    })

    expect(container.textContent).toContain('OpenCode')
  })

  it('hides provider task-fit hints when the setting is disabled', async () => {
    mocks.settings.agentTaskFitHintsEnabled = false

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
      await harness.flushMicrotasks()
    })

    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open provider menu')?.click()
    })

    expect(document.body.textContent).not.toContain('Broad refactor')
    expect(document.body.textContent).not.toContain('Fast edit')
    expect(harness.getDocumentButton('Set agent provider: OpenCode')).not.toBeNull()
  })

  it('renders provider usage warnings from existing rate-limit data', async () => {
    mocks.rateLimits.claude = {
      provider: 'claude',
      session: {
        usedPercent: 88,
        windowMinutes: 300,
        resetsAt: null,
        resetDescription: null
      },
      weekly: null,
      updatedAt: Date.now(),
      error: null,
      status: 'ok'
    }

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
      await harness.flushMicrotasks()
    })

    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open provider menu')?.click()
    })

    expect(document.body.textContent).toContain('Low quota: Session 12% left')
    expect(container.textContent).toContain('Claude')
  })

  it('keeps bare space typing inside the composer draft', async () => {
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    expect(textarea).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'ab')
    })

    textarea!.selectionStart = 1
    textarea!.selectionEnd = 1
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true
    })

    await act(async () => {
      textarea!.dispatchEvent(event)
      await Promise.resolve()
    })

    expect(event.defaultPrevented).toBe(true)
    expect(textarea?.value).toBe('a b')
    expect(textarea?.selectionStart).toBe(2)
    expect(textarea?.selectionEnd).toBe(2)
  })

  it('blocks send but keeps drafting when the selected thread is outside the active worktree', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-active"
          selectedThread={harness.makeThread({ worktreeId: 'worktree-target' })}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')

    expect(textarea?.disabled).toBe(false)
    expect(button?.disabled).toBe(true)
    expect(container.textContent).toContain('Switch to this worktree before sending a message.')
    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
  })

  it('renders send failures inline', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({ status: 'not-ready' })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.makeThread({ phase: 'waiting-for-user' })}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()
    expect(container.querySelector('select[aria-label="Agent model"]')).toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Status?')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Status?'
    })
    expect(container.textContent).toContain('The agent is not ready for input yet.')
  })

  it('queues a follow-up while the selected thread phase is still running', async () => {
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
      harness.setTextControlValue(textarea!, 'Do this after your current turn.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
    expect(textarea?.value).toBe('')
    expect(container.textContent).toContain('Queued follow-up')
    expect(container.textContent).toContain('Do this after your current turn.')
  })

  it('queues a follow-up while the selected thread has a running tool event', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          timeline={[
            {
              id: 'tool-running',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'Running pnpm test',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'running'
            }
          ]}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'After tests pass, update the docs.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
    expect(textarea?.value).toBe('')
    expect(container.textContent).toContain('Queued follow-up')
    expect(container.textContent).toContain('After tests pass, update the docs.')
  })

  it('edits and sends a queued follow-up when the same thread becomes ready', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          timeline={[
            {
              id: 'tool-running',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'Running pnpm test',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'running'
            }
          ]}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Follow up after the tool.')
    })
    await act(async () => {
      button?.click()
    })

    const queuedTextarea = container.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Queued follow-up message"]'
    )
    expect(queuedTextarea).not.toBeNull()
    await act(async () => {
      harness.setTextControlValue(queuedTextarea!, 'Summarize the passing tests.')
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.makeThread({ phase: 'waiting-for-user' })}
          timeline={[
            {
              id: 'tool-done',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'pnpm test passed',
              createdAt: '2026-06-16T12:02:00.000Z',
              status: 'done'
            }
          ]}
        />
      )
      await harness.flushMicrotasks()
    })

    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Summarize the passing tests.'
    })
    expect(container.textContent).not.toContain('Queued follow-up')
  })

  it('does not send a queued follow-up after switching threads', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          timeline={[
            {
              id: 'tool-running',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'Running pnpm test',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'running'
            }
          ]}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Only send this to the first thread.')
    })
    await act(async () => {
      button?.click()
    })
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.makeThread({ id: 'thread-2', phase: 'waiting-for-user' })}
        />
      )
      await Promise.resolve()
    })

    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Queued follow-up')
  })

  it('deletes a queued follow-up before the thread becomes ready', async () => {
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          timeline={[
            {
              id: 'tool-running',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'Running pnpm test',
              createdAt: '2026-06-16T12:01:00.000Z',
              status: 'running'
            }
          ]}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Only if the current run stays relevant.')
    })
    await act(async () => {
      button?.click()
    })

    const deleteButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Delete queued follow-up"]'
    )
    expect(deleteButton).not.toBeNull()

    await act(async () => {
      deleteButton?.click()
    })
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.makeThread({ phase: 'waiting-for-user' })}
          timeline={[
            {
              id: 'tool-done',
              threadId: harness.runningThread.id,
              kind: 'tool',
              text: 'pnpm test passed',
              createdAt: '2026-06-16T12:02:00.000Z',
              status: 'done'
            }
          ]}
        />
      )
      await Promise.resolve()
    })

    expect(mocks.sendNotesToActiveAgentSession).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Queued follow-up')
  })
})
