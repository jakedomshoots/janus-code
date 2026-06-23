import { afterEach, describe, expect, it, vi } from 'vitest'
import { setRendererUiLanguage } from '@/i18n/i18n'
import { submitAgentComposerMessage, type AgentComposerSendFunction } from './agent-composer-submit'
import type { AgentWorkspaceThread } from './agent-workspace-types'

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement composer',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

function makeThread(overrides: Partial<AgentWorkspaceThread>): AgentWorkspaceThread {
  return { ...runningThread, ...overrides }
}

describe('submitAgentComposerMessage', () => {
  afterEach(async () => {
    await setRendererUiLanguage('en')
  })

  it('blocks an empty prompt without calling the send function', async () => {
    const sendNotes: AgentComposerSendFunction = vi.fn()

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: runningThread,
      prompt: '   \n\t',
      sendNotes
    })

    expect(sendNotes).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: 'blocked',
      reason: 'empty',
      message: 'Enter a message before sending.',
      prompt: '',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })

  it('blocks when no thread is selected', async () => {
    const sendNotes: AgentComposerSendFunction = vi.fn()

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: null,
      prompt: 'Run the next step.',
      sendNotes
    })

    expect(sendNotes).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: 'blocked',
      reason: 'no-selected-thread',
      message: 'Select a running thread before sending a message.',
      prompt: 'Run the next step.',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: null,
        agentKind: null
      }
    })
  })

  it('blocks selected threads that cannot receive messages', async () => {
    const sendNotes: AgentComposerSendFunction = vi.fn()

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: makeThread({ phase: 'failed' }),
      prompt: 'Continue after the prompt.',
      sendNotes
    })

    expect(sendNotes).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: 'blocked',
      reason: 'thread-not-running',
      message: 'This thread is failed and cannot receive messages yet.',
      prompt: 'Continue after the prompt.',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })

  it('sends to a thread that is waiting for user input', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'sent' })

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: makeThread({ phase: 'waiting-for-user' }),
      prompt: 'Here is the answer.',
      sendNotes
    })

    expect(sendNotes).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Here is the answer.'
    })
    expect(result.status).toBe('sent')
  })

  it('sends to a completed thread as the next conversation turn', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'sent' })

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: makeThread({ phase: 'completed' }),
      prompt: 'Follow up in the same thread.',
      sendNotes
    })

    expect(sendNotes).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Follow up in the same thread.'
    })
    expect(result.status).toBe('sent')
  })

  it('sends a trimmed prompt to the selected running thread worktree', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'sent' })

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: runningThread,
      prompt: '  Run the next step.\n',
      sendNotes
    })

    expect(sendNotes).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Run the next step.'
    })
    expect(result).toEqual({
      status: 'sent',
      message: 'Message accepted by Codex.',
      prompt: 'Run the next step.',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })

  it('targets the selected thread pane instead of whichever terminal is active', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'sent' })
    const selectedThread = makeThread({
      id: 'tab-selected:123e4567-e89b-12d3-a456-426614174000'
    })

    await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread,
      prompt: 'Continue this chat.',
      sendNotes
    })

    expect(sendNotes).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Continue this chat.',
      noteTarget: {
        tabId: 'tab-selected',
        leafId: '123e4567-e89b-12d3-a456-426614174000',
        stablePaneId: '123e4567-e89b-12d3-a456-426614174000'
      }
    })
  })

  it('localizes failure results from the send API', async () => {
    await setRendererUiLanguage('es')
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'no-agent' })

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: runningThread,
      prompt: 'Status?',
      sendNotes
    })

    expect(result).toEqual({
      status: 'error',
      reason: 'no-agent',
      message: 'La terminal activa no es una sesion de agente reconocida.',
      prompt: 'Status?',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })

  it('returns a visible error when the send function rejects', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockRejectedValue(new Error('offline'))

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-1',
      selectedThread: runningThread,
      prompt: 'Status?',
      sendNotes
    })

    expect(result).toEqual({
      status: 'error',
      reason: 'send-exception',
      message: 'Could not send the message to the agent.',
      prompt: 'Status?',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })

  it('blocks selected threads outside the active worktree without calling the send function', async () => {
    const sendNotes = vi.fn<AgentComposerSendFunction>().mockResolvedValue({ status: 'sent' })
    const remoteThread = makeThread({ worktreeId: 'worktree-target' })

    const result = await submitAgentComposerMessage({
      activeWorktreeId: 'worktree-active',
      selectedThread: remoteThread,
      prompt: 'Run the target worktree task.',
      sendNotes
    })

    expect(sendNotes).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: 'blocked',
      reason: 'thread-not-active-worktree',
      message: 'Switch to this worktree before sending a message.',
      prompt: 'Run the target worktree task.',
      context: {
        activeWorktreeId: 'worktree-active',
        worktreeId: 'worktree-target',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })
  })
})
