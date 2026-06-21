// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceAttemptCompare } from './AgentWorkspaceAttemptCompare'
import type { AgentWorktreeCompareGroup } from './agent-worktree-compare-selectors'

const compareGroup: AgentWorktreeCompareGroup = {
  id: 'repo-janus',
  label: 'Janus Code',
  attemptCount: 2,
  attempts: [
    {
      threadId: 'thread-a',
      worktreeId: 'attempt-a',
      projectName: 'Attempt A',
      title: 'Try Codex',
      agentKind: 'codex',
      branchName: 'best/a',
      updatedAt: '2026-06-21T15:00:00.000Z',
      verificationTitle: 'Verification passed',
      verificationStatus: 'done',
      changedFileCount: 2,
      additions: 12,
      deletions: 3,
      riskNotes: ['deploy: May publish, push, or deploy changes.']
    },
    {
      threadId: 'thread-b',
      worktreeId: 'attempt-b',
      projectName: 'Attempt B',
      title: 'Try Claude',
      agentKind: 'claude',
      branchName: 'best/b',
      updatedAt: '2026-06-21T15:01:00.000Z',
      verificationTitle: 'Verification failed',
      verificationStatus: 'failed',
      changedFileCount: 1,
      additions: 4,
      deletions: 1,
      riskNotes: []
    }
  ]
}

const roots: Root[] = []

afterEach(() => {
  roots.splice(0).forEach((root) => root.unmount())
  document.body.replaceChildren()
})

describe('AgentWorkspaceAttemptCompare', () => {
  it('shows attempt evidence and records a local winner selection', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    const onOpenAttempt = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceAttemptCompare groups={[compareGroup]} onOpenAttempt={onOpenAttempt} />
      )
    })

    expect(container.textContent).toContain('Best-of-N compare')
    expect(container.textContent).toContain('Try Codex')
    expect(container.textContent).toContain('Verification passed')
    expect(container.textContent).toContain('2 files')
    expect(container.textContent).toContain('deploy')

    const selectWinner = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Select winner: Try Codex"]'
    )
    expect(selectWinner).not.toBeNull()

    await act(async () => {
      selectWinner?.click()
    })

    expect(onOpenAttempt).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Selected winner')

    const openAttempt = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Open attempt: Try Codex"]'
    )
    expect(openAttempt).not.toBeNull()

    await act(async () => {
      openAttempt?.click()
    })

    expect(onOpenAttempt).toHaveBeenCalledWith(compareGroup.attempts[0])
  })
})
