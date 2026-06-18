import { describe, expect, it } from 'vitest'
import { shouldSuppressProjectRightSidebar } from './agent-workspace-right-sidebar'

describe('shouldSuppressProjectRightSidebar', () => {
  it('suppresses project controls when the GUI agent right panel is expanded on terminal view', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true,
        rightSidebarOpen: false
      })
    ).toBe(true)
  })

  it('suppresses project controls until the user explicitly opens explorer', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: false,
        rightSidebarOpen: false
      })
    ).toBe(true)
  })

  it('shows project controls after the user opens explorer in GUI agent mode', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: false,
        rightSidebarOpen: true
      })
    ).toBe(false)
  })

  it('keeps project controls when the GUI agent workspace is disabled', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: false,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true,
        rightSidebarOpen: false
      })
    ).toBe(false)
  })

  it('keeps project controls on non-terminal views', () => {
    expect(
      shouldSuppressProjectRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'editor',
        agentWorkspaceRightPanelExpanded: true,
        rightSidebarOpen: false
      })
    ).toBe(false)
  })
})
