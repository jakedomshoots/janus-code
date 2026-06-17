import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'janus-code',
  path: '/Users/jakedom/janus-code',
  hostKind: 'local'
}

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement provider parity',
  agentKind: 'opencode',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/provider-parity',
  cwd: '/Users/jakedom/janus-code'
}

describe('AgentWorkspaceHeader', () => {
  it('renders the selected thread provider label instead of assuming Codex', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={thread} />)

    expect(markup).toContain('OpenCode')
    expect(markup).not.toContain('Codex')
  })

  it('does not render one-off pane chrome in the workspace header', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={null} />)

    expect(markup).not.toContain('Panes')
    expect(markup).not.toContain('Open panes')
  })

  it('does not render right-panel controls without a selected thread', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceHeader
        project={project}
        thread={null}
        rightPanelCollapsed
        onExpandRightPanel={() => undefined}
        onOpenProjectFiles={() => undefined}
      />
    )

    expect(markup).not.toContain('Show right panel')
    expect(markup).not.toContain('Panel')
    expect(markup).not.toContain('Open project files')
    expect(markup).not.toContain('Files')
  })

  it('renders a right-panel expand affordance when the panel is collapsed', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceHeader
        project={project}
        thread={thread}
        rightPanelCollapsed
        onExpandRightPanel={() => undefined}
      />
    )

    expect(markup).toContain('Show right panel')
    expect(markup).toContain('Panel')
    expect(markup).not.toContain('Open project files')
  })

  it('renders a project files affordance when the right panel is expanded', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceHeader
        project={project}
        thread={thread}
        onOpenProjectFiles={() => undefined}
      />
    )

    expect(markup).toContain('Open project files')
    expect(markup).toContain('Files')
    expect(markup).not.toContain('Show right panel')
  })
})
