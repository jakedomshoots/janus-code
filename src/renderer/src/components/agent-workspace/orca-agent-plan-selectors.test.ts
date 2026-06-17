import { describe, expect, it } from 'vitest'
import type {
  AgentWorkspacePlan,
  AgentWorkspaceSnapshot,
  AgentWorkspaceThread
} from './agent-workspace-types'
import {
  getAgentWorkspacePlanMarkdownTitle,
  getAgentWorkspacePlanTitle,
  hasStructuredAgentWorkspacePlan,
  selectAgentWorkspacePlanForThread,
  selectAgentWorkspacePlansForThread,
  stripDisplayedAgentWorkspacePlanMarkdown
} from './orca-agent-plan-selectors'

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement plan panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/orca'
}

const olderPlan: AgentWorkspacePlan = {
  id: 'plan-older',
  threadId: thread.id,
  title: 'Older plan',
  explanation: 'First pass.',
  steps: [
    {
      id: 'step-1',
      title: 'Read the workspace code',
      status: 'completed'
    }
  ],
  markdown: null,
  updatedAt: '2026-06-16T12:01:00.000Z'
}

const newerPlan: AgentWorkspacePlan = {
  id: 'plan-newer',
  threadId: thread.id,
  title: 'Newer plan',
  explanation: 'Revised pass.',
  steps: [
    {
      id: 'step-2',
      title: 'Render structured plan steps',
      status: 'in-progress'
    }
  ],
  markdown: '# Newer plan\n\n## Summary\n\nShip the plan panel.',
  updatedAt: '2026-06-16T12:02:00.000Z'
}

const otherThreadPlan: AgentWorkspacePlan = {
  ...newerPlan,
  id: 'plan-other-thread',
  threadId: 'thread-2',
  title: 'Other thread plan'
}

function snapshot(plans: readonly AgentWorkspacePlan[]): AgentWorkspaceSnapshot {
  return {
    activeWorktreeId: 'worktree-1',
    projects: [
      {
        id: 'worktree-1',
        label: 'orca',
        path: '/Users/jakedom/orca',
        hostKind: 'local'
      }
    ],
    threads: [thread],
    plans,
    timeline: [],
    approvals: [],
    diffs: [],
    terminalAvailable: true
  }
}

describe('orca agent plan selectors', () => {
  it('selects the newest structured plan for the active thread', () => {
    const plans = selectAgentWorkspacePlansForThread(
      snapshot([olderPlan, otherThreadPlan, newerPlan]),
      thread
    )

    expect(plans.map((plan) => plan.id)).toEqual(['plan-newer', 'plan-older'])
    expect(selectAgentWorkspacePlanForThread(snapshot([olderPlan, newerPlan]), thread)).toEqual(
      newerPlan
    )
    expect(hasStructuredAgentWorkspacePlan(snapshot([olderPlan]), thread)).toBe(true)
  })

  it('sorts invalid plan timestamps after valid updates', () => {
    const invalidTimestampPlan = {
      ...newerPlan,
      id: 'plan-invalid-timestamp',
      updatedAt: 'not-a-date'
    } satisfies AgentWorkspacePlan

    expect(
      selectAgentWorkspacePlansForThread(snapshot([invalidTimestampPlan, olderPlan]), thread).map(
        (plan) => plan.id
      )
    ).toEqual(['plan-older', 'plan-invalid-timestamp'])
  })

  it('returns no plan when only timeline text resembles a plan', () => {
    const unstructuredSnapshot = {
      ...snapshot([]),
      timeline: [
        {
          id: 'timeline-plan-looking-text',
          threadId: thread.id,
          kind: 'agent',
          text: '# Plan\n\n- [ ] This came from terminal output',
          createdAt: '2026-06-16T12:03:00.000Z',
          status: 'done'
        }
      ]
    } satisfies AgentWorkspaceSnapshot

    expect(selectAgentWorkspacePlanForThread(unstructuredSnapshot, thread)).toBeNull()
    expect(hasStructuredAgentWorkspacePlan(unstructuredSnapshot, thread)).toBe(false)
  })

  it('derives titles and displayed markdown with Janus heading rules', () => {
    const markdown = '# Build GUI Workspace\n\n## Summary\n\n1. Add the plan panel.\n2. Wire it.'
    const markdownOnlyPlan = {
      ...newerPlan,
      title: null,
      markdown
    } satisfies AgentWorkspacePlan

    expect(getAgentWorkspacePlanMarkdownTitle(markdown)).toBe('Build GUI Workspace')
    expect(getAgentWorkspacePlanTitle(markdownOnlyPlan)).toBe('Build GUI Workspace')
    expect(stripDisplayedAgentWorkspacePlanMarkdown(markdown)).toBe(
      '1. Add the plan panel.\n2. Wire it.'
    )
  })
})
