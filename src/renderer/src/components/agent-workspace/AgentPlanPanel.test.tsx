// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AgentWorkspacePlan, AgentWorkspaceThread } from './agent-workspace-types'
import { AgentPlanPanel } from './AgentPlanPanel'

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

const plan: AgentWorkspacePlan = {
  id: 'plan-1',
  threadId: thread.id,
  title: 'GUI workspace plan',
  explanation: 'Port the T3 plan sidebar pattern onto Orca state.',
  steps: [
    {
      id: 'step-1',
      title: 'Create typed plan selectors',
      status: 'completed'
    },
    {
      id: 'step-2',
      title: 'Render the plan panel',
      status: 'in-progress'
    },
    {
      id: 'step-3',
      title: 'Verify the workspace suite',
      status: 'pending'
    }
  ],
  markdown: '# GUI workspace plan\n\n## Summary\n\nRender structured plan markdown.',
  updatedAt: '2026-06-16T12:01:00.000Z'
}

describe('AgentPlanPanel', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('renders structured plan title, explanation, and steps', async () => {
    await act(async () => {
      root.render(<AgentPlanPanel thread={thread} plan={plan} />)
    })

    expect(container.textContent).toContain('GUI workspace plan')
    expect(container.textContent).toContain('Port the T3 plan sidebar pattern onto Orca state.')
    expect(container.textContent).toContain('Create typed plan selectors')
    expect(container.textContent).toContain('completed')
    expect(container.textContent).toContain('Render the plan panel')
    expect(container.textContent).toContain('in progress')
  })

  it('does not infer a plan when no structured plan is available', async () => {
    await act(async () => {
      root.render(<AgentPlanPanel thread={thread} plan={null} />)
    })

    expect(container.textContent).toContain('No structured plan available.')
    expect(container.textContent).toContain('Use the Terminal tab for raw session output.')
  })
})
