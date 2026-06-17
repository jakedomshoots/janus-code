import { describe, expect, it } from 'vitest'
import { shouldSuppressOrcaRightSidebar } from './agent-workspace-orca-sidebar'

describe('shouldSuppressOrcaRightSidebar', () => {
  it('suppresses Orca controls when the GUI agent right panel is expanded on terminal view', () => {
    expect(
      shouldSuppressOrcaRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(true)
  })

  it('keeps Orca controls when the agent panel is collapsed', () => {
    expect(
      shouldSuppressOrcaRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: false
      })
    ).toBe(false)
  })

  it('keeps Orca controls when the GUI agent workspace is disabled', () => {
    expect(
      shouldSuppressOrcaRightSidebar({
        guiAgentWorkspaceEnabled: false,
        activeView: 'terminal',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(false)
  })

  it('keeps Orca controls on non-terminal views', () => {
    expect(
      shouldSuppressOrcaRightSidebar({
        guiAgentWorkspaceEnabled: true,
        activeView: 'editor',
        agentWorkspaceRightPanelExpanded: true
      })
    ).toBe(false)
  })
})
