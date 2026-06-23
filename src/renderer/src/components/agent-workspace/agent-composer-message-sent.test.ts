import { describe, expect, it, vi } from 'vitest'
import { notifyAgentComposerMessageSent } from './agent-composer-message-sent'

describe('notifyAgentComposerMessageSent', () => {
  it('emits sent prompts as local user timeline messages', () => {
    const onMessageSent = vi.fn()

    notifyAgentComposerMessageSent(onMessageSent, {
      status: 'sent',
      message: 'Sent to codex.',
      prompt: 'Keep using this thread.',
      context: {
        activeWorktreeId: 'worktree-1',
        worktreeId: 'worktree-1',
        threadId: 'thread-1',
        agentKind: 'codex'
      }
    })

    expect(onMessageSent).toHaveBeenCalledWith({
      threadId: 'thread-1',
      prompt: 'Keep using this thread.',
      sentAt: expect.any(String),
      status: 'done'
    })
  })
})
