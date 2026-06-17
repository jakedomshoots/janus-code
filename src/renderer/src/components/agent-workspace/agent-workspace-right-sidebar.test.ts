import { describe, expect, it } from 'vitest'
import { shouldSuppressProjectRightSidebar } from './agent-workspace-right-sidebar'

describe('shouldSuppressProjectRightSidebar', () => {
  it('suppresses project controls when the GUI agent right panel is expanded on terminal view', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(true)
  })

  it('keeps project controls when the agent panel is collapsed', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: false
      })
    ).toBe(false)
  })

  it('keeps project controls when the GUI agent workspace is disabled', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: false,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(false)
  })

  it('keeps project controls on non-terminal views', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'editor',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(false)
  })
})
