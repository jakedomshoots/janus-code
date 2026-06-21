// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AgentWorkspaceMarkdownArtifactSidePanel } from './AgentWorkspaceMarkdownArtifactSidePanel'
import type { AgentWorkspaceThread } from './agent-workspace-types'

vi.mock('@/runtime/runtime-file-client', () => ({
  readRuntimeFileContent: vi.fn(async () => ({
    content: '# Long Handoff\n\n- Item 1\n- Item 2',
    isBinary: false
  }))
}))

vi.mock('@/store', () => ({
  useAppStore: (
    selector: (state: { settings: { guiAgentWorkspaceEnabled: boolean } }) => unknown
  ) => selector({ settings: { guiAgentWorkspaceEnabled: false } })
}))

vi.mock('../sidebar/CommentMarkdown', () => ({
  default: ({ className, content }: { className?: string; content: string }) => (
    <article className={className}>{content}</article>
  )
}))

const thread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement right panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

describe('AgentWorkspaceMarkdownArtifactSidePanel', () => {
  it('renders markdown preview in a full-height right side panel', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceMarkdownArtifactSidePanel
        artifact={{
          id: 'docs/handoff.md',
          fileName: 'handoff.md',
          filePath: 'docs/handoff.md',
          absolutePath: '/Users/jakedom/janus-code/docs/handoff.md'
        }}
        thread={thread}
        onClose={() => undefined}
        onOpenInEditor={() => undefined}
      />
    )

    expect(markup).toContain('data-agent-markdown-side-panel="true"')
    expect(markup).toContain('data-agent-markdown-preview="docs/handoff.md"')
    expect(markup).toContain('Open in editor')
    expect(markup).toContain('Close document preview')
    expect(markup).toContain('h-full')
    expect(markup).toContain('overflow-auto')
  })
})
