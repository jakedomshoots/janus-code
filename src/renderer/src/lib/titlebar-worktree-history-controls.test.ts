import { describe, expect, it } from 'vitest'
import { shouldShowWorktreeHistoryControls } from './titlebar-worktree-history-controls'

describe('shouldShowWorktreeHistoryControls', () => {
  it('shows controls wherever worktree history navigation is supported', () => {
    expect(shouldShowWorktreeHistoryControls('terminal')).toBe(true)
    expect(shouldShowWorktreeHistoryControls('tasks')).toBe(true)
    expect(shouldShowWorktreeHistoryControls('automations')).toBe(true)
  })

  it('hides terminal history controls while the GUI agent workspace owns the terminal view', () => {
    expect(shouldShowWorktreeHistoryControls('terminal', { guiAgentWorkspaceEnabled: true })).toBe(
      false
    )
    expect(shouldShowWorktreeHistoryControls('tasks', { guiAgentWorkspaceEnabled: true })).toBe(
      true
    )
  })

  it('hides controls on full-page views outside the history stack', () => {
    expect(shouldShowWorktreeHistoryControls('settings')).toBe(false)
    expect(shouldShowWorktreeHistoryControls('activity')).toBe(false)
    expect(shouldShowWorktreeHistoryControls('space')).toBe(false)
    expect(shouldShowWorktreeHistoryControls('skills')).toBe(false)
  })
})
