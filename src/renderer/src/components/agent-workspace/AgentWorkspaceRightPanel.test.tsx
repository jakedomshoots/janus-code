// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AgentWorkspaceDiffSummary,
  AgentWorkspaceApproval,
  AgentWorkspaceProject,
  AgentWorkspaceThread
} from './agent-workspace-types'
import { AgentWorkspaceRightPanel } from './AgentWorkspaceRightPanel'

const approvalMocks = vi.hoisted(() => ({
  respondToAgentWorkspaceApproval: vi.fn(async () => ({ status: 'sent' as const }))
}))
const runtimeFileMocks = vi.hoisted(() => ({
  readRuntimeFileContent: vi.fn(async () => ({
    content: `# Long Handoff\n\n${Array.from({ length: 80 }, (_, index) => `- Item ${index}`).join(
      '\n'
    )}`,
    isBinary: false
  }))
}))

vi.mock('./agent-workspace-approval-response', () => ({
  respondToAgentWorkspaceApproval: approvalMocks.respondToAgentWorkspaceApproval,
  getAgentWorkspaceApprovalResponseMessage: () => 'Approval sent to the agent terminal.'
}))

vi.mock('@/runtime/runtime-file-client', () => ({
  readRuntimeFileContent: runtimeFileMocks.readRuntimeFileContent
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

const runningThread: AgentWorkspaceThread = {
  id: 'thread-1',
  worktreeId: 'worktree-1',
  title: 'Implement right panel',
  agentKind: 'codex',
  phase: 'running',
  updatedAt: '2026-06-16T12:00:00.000Z',
  branchName: 'feature/janus-gui-workspace',
  cwd: '/Users/jakedom/janus-code'
}

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  label: 'janus-code',
  path: '/Users/jakedom/janus-code',
  hostKind: 'local',
  branchName: 'feature/janus-gui-workspace'
}

const diffSummary: AgentWorkspaceDiffSummary = {
  id: 'diff-1',
  threadId: 'thread-1',
  filePath: 'src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx',
  additions: 42,
  deletions: 7,
  status: 'modified'
}

const approvalRequest: AgentWorkspaceApproval = {
  id: 'thread-1:approval:approval-1',
  threadId: 'thread-1',
  providerKind: 'codex',
  worktreeId: 'worktree-1',
  status: 'requested',
  title: 'Approve Bash',
  description: 'Run the test suite before commit.',
  toolName: 'Bash',
  toolInput: 'pnpm test',
  fallbackText: 'Approve Bash: pnpm test',
  updatedAt: '2026-06-16T12:01:00.000Z'
}

describe('AgentWorkspaceRightPanel', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    approvalMocks.respondToAgentWorkspaceApproval.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
    runtimeFileMocks.readRuntimeFileContent.mockClear()
    document.body.replaceChildren()
  })

  it('renders a live conversation info card', async () => {
    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={runningThread}
          threads={[runningThread]}
          plan={null}
          approval={null}
          diffs={[diffSummary]}
          review={null}
          terminalAvailable
          selectedTab="diff"
          onSelectedTabChange={() => undefined}
        />
      )
    })

    const panel = container.querySelector('.agent-workspace-right-panel')
    const shell = container.querySelector('.agent-workspace-right-panel-shell')

    expect(panel?.className).toContain('absolute')
    expect(panel?.className).toContain('right-4')
    expect(shell?.className).toContain('max-h-[min(440px,calc(100vh-7rem))]')
    expect(shell?.className).toContain('p-3')
    expect(container.textContent).toContain('Environment')
    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('+42')
    expect(container.textContent).toContain('-7')
    expect(container.textContent).toContain('Worktree')
    expect(container.textContent).toContain('feature/janus-gui-workspace')
    expect(container.textContent).toContain('Commit or push')
    expect(container.textContent).toContain('Create pull request')
    expect(container.textContent).toContain('Side chat')
    expect(container.textContent).toContain('Sources')
    expect(container.textContent).not.toContain('AgentWorkspaceLayout.tsx')
    expect(container.textContent).not.toContain('modified')
  })

  it('sends approve and deny decisions from the info card', async () => {
    const onOpenTerminalDrawer = vi.fn()

    await act(async () => {
      root.render(
        <AgentWorkspaceRightPanel
          project={project}
          thread={{
            ...runningThread,
            phase: 'needs-approval',
            cwd: '/Users/jakedom/janus-code'
          }}
          threads={[runningThread]}
          plan={null}
          approval={approvalRequest}
          diffs={[]}
          review={null}
          terminalAvailable
          selectedTab="details"
          onSelectedTabChange={() => undefined}
          onOpenTerminalDrawer={onOpenTerminalDrawer}
        />
      )
    })

    const approveButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Approve')
    )
    const denyButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Deny')
    )
    expect(approveButton).toBeDefined()
    expect(denyButton).toBeDefined()

    await act(async () => {
      approveButton?.click()
    })

    expect(approvalMocks.respondToAgentWorkspaceApproval).toHaveBeenCalledWith({
      threadId: 'thread-1',
      worktreeId: 'worktree-1',
      agentKind: 'codex',
      decision: 'approve',
      onOpenTerminalDrawer
    })

    await act(async () => {
      denyButton?.click()
    })

    expect(approvalMocks.respondToAgentWorkspaceApproval).toHaveBeenLastCalledWith({
      threadId: 'thread-1',
      worktreeId: 'worktree-1',
      agentKind: 'codex',
      decision: 'deny',
      onOpenTerminalDrawer
    })
  })

  it('constrains the document preview so long markdown scrolls inside the panel', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceRightPanel
        project={project}
        thread={runningThread}
        threads={[runningThread]}
        plan={null}
        approval={null}
        diffs={[]}
        review={null}
        selectedMarkdownArtifact={{
          id: 'docs/handoff.md',
          fileName: 'handoff.md',
          filePath: 'docs/handoff.md',
          absolutePath: '/Users/jakedom/janus-code/docs/handoff.md'
        }}
        terminalAvailable
        selectedTab="document"
        onSelectedTabChange={() => undefined}
      />
    )
    container.innerHTML = markup

    const shell = container.querySelector('.agent-workspace-right-panel-shell')
    const tabPanel = container.querySelector('[role="tabpanel"]')
    const preview = container.querySelector('[data-agent-markdown-preview="docs/handoff.md"]')
    const scroller = preview?.querySelector('.agent-markdown-artifact-preview-scroller')

    expect(shell?.className).toContain('flex')
    expect(shell?.className).toContain('flex-col')
    expect(shell?.className).toContain('max-h-[min(440px,calc(100vh-7rem))]')
    expect(tabPanel?.className).toContain('min-h-0')
    expect(tabPanel?.className).toContain('flex-1')
    expect(tabPanel?.className).toContain('overflow-hidden')
    expect(preview?.className).toContain('h-full')
    expect(scroller?.className).toContain('overflow-auto')
  })
})
