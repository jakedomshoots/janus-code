import { describe, expect, it, vi } from 'vitest'
import { closeAgentWorkspaceThread } from './agent-workspace-thread-close'

const mocks = vi.hoisted(() => ({
  closeTerminalTab: vi.fn()
}))

vi.mock('@/components/terminal/terminal-tab-actions', () => ({
  closeTerminalTab: mocks.closeTerminalTab
}))

describe('closeAgentWorkspaceThread', () => {
  it('closes the underlying terminal tab for a pane key thread id', () => {
    mocks.closeTerminalTab.mockReset()
    const leafId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
    const closed = closeAgentWorkspaceThread(`tab-1:${leafId}`)

    expect(closed).toBe(true)
    expect(mocks.closeTerminalTab).toHaveBeenCalledWith('tab-1')
  })

  it('returns false for non-pane-key thread ids', () => {
    mocks.closeTerminalTab.mockReset()
    expect(closeAgentWorkspaceThread('not-a-pane-key')).toBe(false)
    expect(mocks.closeTerminalTab).not.toHaveBeenCalled()
  })
})
