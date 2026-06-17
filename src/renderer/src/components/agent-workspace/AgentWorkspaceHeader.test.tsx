import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AgentWorkspaceProject, AgentWorkspaceThread } from './agent-workspace-types'
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader'

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'orca',
  path: '/Users/jakedom/orca',
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
  cwd: '/Users/jakedom/orca'
}

describe('AgentWorkspaceHeader', () => {
  it('renders the selected thread provider label instead of assuming Codex', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={thread} />)

    expect(markup).toContain('OpenCode')
    expect(markup).not.toContain('Codex')
  })

  it('keeps the panes control visible in the workspace header', () => {
    const markup = renderToStaticMarkup(<AgentWorkspaceHeader project={project} thread={null} />)

    expect(markup).toContain('Panes')
    expect(markup).toContain('Open panes')
  })
})
