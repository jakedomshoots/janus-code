import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type {
  AgentWorkspaceProject,
  AgentWorkspaceThread,
  AgentWorkspaceThreadChromeSummary
} from './agent-workspace-types'
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

const runSummary: AgentWorkspaceThreadChromeSummary = {
  currentStep: 'Approval requested',
  lastCommand: 'pnpm test',
  changedFileCount: 2,
  attentionState: 'needs-attention'
}

describe('AgentWorkspaceHeader', () => {
  it('renders workspace identity without legacy provider chrome', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={thread} />)

    expect(markup).toContain('janus-code')
    expect(markup).toContain('Implement provider parity')
    expect(markup).not.toContain('OpenCode')
    expect(markup).not.toContain('Codex')
    expect(markup).not.toContain('running')
    expect(markup).not.toContain('feature/provider-parity')
  })

  it('renders a quiet ready state without one-off pane chrome', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={null} />)

    expect(markup).toContain('Ready for Janus Code')
    expect(markup).not.toContain('Panes')
    expect(markup).not.toContain('Open panes')
  })

  it('does not render right-panel controls without a selected thread', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceHeader
        project={project}
        thread={null}
        rightPanelCollapsed
        onNewSession={() => undefined}
        onExpandRightPanel={() => undefined}
        onOpenProjectFiles={() => undefined}
      />
    )

    expect(markup).not.toContain('Show details')
    expect(markup).not.toContain('Panel')
    expect(markup).not.toContain('Open project files')
    expect(markup).not.toContain('Files')
    expect(markup).toContain('New session')
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

    expect(markup).toContain('Show details')
    expect(markup).toContain('Details')
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
    expect(markup).not.toContain('Show details')
  })

  it('renders selected-thread run evidence in the workspace chrome', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceHeader project={project} thread={thread} runSummary={runSummary} />
    )

    expect(markup).toContain('Approval requested')
    expect(markup).toContain('pnpm test')
    expect(markup).toContain('2 files')
    expect(markup).toContain('Needs attention')
  })
})
