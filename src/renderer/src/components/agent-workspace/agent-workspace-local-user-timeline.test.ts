import { describe, expect, it } from 'vitest'
import {
  shouldSuppressLocalUserTimelineEntry,
  upsertLocalUserTimelineEntry
} from './agent-workspace-local-user-timeline'
import type { AgentWorkspaceTimelineEntry } from './agent-workspace-types'

describe('agent workspace local user timeline', () => {
  it('keeps the first local echo timestamp when delivery status settles', () => {
    const pending = upsertLocalUserTimelineEntry({
      current: [],
      sequence: 1,
      message: {
        localId: 'thread-1:local-user-pending:1',
        threadId: 'thread-1',
        prompt: 'Keep this bubble in place.',
        sentAt: '2026-06-22T20:00:00.000Z',
        status: 'pending'
      }
    })
    const agentPreview: AgentWorkspaceTimelineEntry = {
      id: 'thread-1:agent-live',
      threadId: 'thread-1',
      kind: 'agent',
      text: 'Working on it.',
      createdAt: '2026-06-22T20:00:01.000Z',
      status: 'running'
    }

    const settled = upsertLocalUserTimelineEntry({
      current: [agentPreview, ...pending],
      sequence: 2,
      message: {
        localId: 'thread-1:local-user-pending:1',
        threadId: 'thread-1',
        prompt: 'Keep this bubble in place.',
        sentAt: '2026-06-22T20:00:02.000Z',
        status: 'done'
      }
    })

    expect(settled.find((entry) => entry.id === 'thread-1:local-user-pending:1')).toMatchObject({
      createdAt: '2026-06-22T20:00:00.000Z',
      status: 'done'
    })
  })

  it('does not suppress a newer repeated prompt with older backend text', () => {
    const localEntry: AgentWorkspaceTimelineEntry = {
      id: 'thread-1:local-user-pending:2',
      threadId: 'thread-1',
      kind: 'user',
      text: 'retry please',
      createdAt: '2026-06-22T20:00:10.000Z',
      status: 'pending'
    }

    expect(
      shouldSuppressLocalUserTimelineEntry({
        entry: localEntry,
        backendTimeline: [
          {
            id: 'thread-1:prompt:old',
            threadId: 'thread-1',
            kind: 'user',
            text: 'retry please',
            createdAt: '2026-06-22T20:00:00.000Z',
            status: 'done'
          }
        ]
      })
    ).toBe(false)
  })

  it('suppresses a local prompt after matching backend delivery arrives', () => {
    const localEntry: AgentWorkspaceTimelineEntry = {
      id: 'thread-1:local-user-pending:1',
      threadId: 'thread-1',
      kind: 'user',
      text: 'retry please',
      createdAt: '2026-06-22T20:00:10.000Z',
      status: 'done'
    }

    expect(
      shouldSuppressLocalUserTimelineEntry({
        entry: localEntry,
        backendTimeline: [
          {
            id: 'thread-1:prompt:new',
            threadId: 'thread-1',
            kind: 'user',
            text: 'retry please',
            createdAt: '2026-06-22T20:00:11.000Z',
            status: 'done'
          }
        ]
      })
    ).toBe(true)
  })
})
