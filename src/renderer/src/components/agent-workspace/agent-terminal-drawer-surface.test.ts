import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncAgentTerminalDrawerSurface } from './agent-terminal-drawer-surface'

const mocks = vi.hoisted(() => ({
  setActiveTabType: vi.fn(),
  setActiveTab: vi.fn(),
  state: {
    activeWorktreeId: 'worktree-1' as string | null,
    activeTabId: 'tab-1' as string | null,
    activeTabIdByWorktree: { 'worktree-1': 'tab-1' } as Record<string, string | null>,
    tabsByWorktree: {
      'worktree-1': [{ id: 'tab-1' }, { id: 'tab-2' }]
    } as Record<string, { id: string }[]>
  }
}))

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => ({
      ...mocks.state,
      setActiveTabType: mocks.setActiveTabType,
      setActiveTab: mocks.setActiveTab
    })
  }
}))

describe('syncAgentTerminalDrawerSurface', () => {
  beforeEach(() => {
    mocks.setActiveTabType.mockReset()
    mocks.setActiveTab.mockReset()
    mocks.state.activeWorktreeId = 'worktree-1'
    mocks.state.activeTabId = 'tab-1'
    mocks.state.activeTabIdByWorktree = { 'worktree-1': 'tab-1' }
    mocks.state.tabsByWorktree = {
      'worktree-1': [{ id: 'tab-1' }, { id: 'tab-2' }]
    }
  })

  it('does nothing when the drawer is closed', () => {
    syncAgentTerminalDrawerSurface(null)
    expect(mocks.setActiveTabType).not.toHaveBeenCalled()
  })

  it('does not override browser workbench surface selection', () => {
    syncAgentTerminalDrawerSurface('browser')
    expect(mocks.setActiveTabType).not.toHaveBeenCalled()
  })

  it('focuses the terminal surface when opening the drawer for terminal reasons', () => {
    syncAgentTerminalDrawerSurface('keyboard-shortcut')
    expect(mocks.setActiveTabType).toHaveBeenCalledWith('terminal')
    expect(mocks.setActiveTab).toHaveBeenCalledWith('tab-1')
  })

  it('falls back to the last terminal tab when no active tab is set', () => {
    mocks.state.activeTabId = null
    mocks.state.activeTabIdByWorktree = { 'worktree-1': null }

    syncAgentTerminalDrawerSurface('failure')

    expect(mocks.setActiveTabType).toHaveBeenCalledWith('terminal')
    expect(mocks.setActiveTab).toHaveBeenCalledWith('tab-2')
  })
})
