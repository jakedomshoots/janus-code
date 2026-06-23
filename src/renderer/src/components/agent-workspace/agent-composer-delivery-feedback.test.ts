import { describe, expect, it } from 'vitest'
import { resolveAgentComposerDeliveryFeedback } from './agent-composer-delivery-feedback'
import type { AgentWorkspaceThread } from './agent-workspace-types'

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Improve delivery states',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-22T15:00:00.000Z',
  branchName: 'feature/delivery-states',
  cwd: '/Users/jakedom/janus-code'
}

describe('resolveAgentComposerDeliveryFeedback', () => {
  it('shows queued while the terminal handoff is pending', () => {
    const feedback = resolveAgentComposerDeliveryFeedback({
      submitting: true,
      statusTone: null,
      statusMessage: null,
      selectedThread: runningThread,
      recoverablePrompt: null
    })

    expect(feedback.state).toBe('queued')
    expect(feedback.label).toBe('Queued')
    expect(feedback.detail).toBe('Waiting for terminal acceptance.')
    expect(feedback.steps.map((step) => [step.id, step.state])).toEqual([
      ['queued', 'current'],
      ['accepted', 'upcoming'],
      ['running', 'upcoming'],
      ['needs-input', 'upcoming'],
      ['failed', 'upcoming']
    ])
  })

  it('uses accepted, running, needs-input, and failed states from real composer context', () => {
    expect(
      resolveAgentComposerDeliveryFeedback({
        submitting: false,
        statusTone: 'sent',
        statusMessage: 'Agent accepted message.',
        selectedThread: runningThread,
        recoverablePrompt: null
      }).state
    ).toBe('accepted')

    expect(
      resolveAgentComposerDeliveryFeedback({
        submitting: false,
        statusTone: null,
        statusMessage: null,
        selectedThread: runningThread,
        recoverablePrompt: null
      }).state
    ).toBe('running')

    expect(
      resolveAgentComposerDeliveryFeedback({
        submitting: false,
        statusTone: null,
        statusMessage: null,
        selectedThread: { ...runningThread, phase: 'waiting-for-user' },
        recoverablePrompt: null
      }).state
    ).toBe('needs-input')

    expect(
      resolveAgentComposerDeliveryFeedback({
        submitting: false,
        statusTone: 'error',
        statusMessage: 'The active terminal did not accept the message.',
        selectedThread: runningThread,
        recoverablePrompt: 'Try again.'
      }).state
    ).toBe('failed')
  })
})
