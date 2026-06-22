// @vitest-environment happy-dom

import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveAgentNotesSendResult } from '@/lib/active-agent-note-send'
import * as harness from './agent-composer.test.harness'
import { AgentComposer } from './AgentComposer'

const mocks = harness.getAgentComposerMocks()
describe('AgentComposer', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    ;({ root, container } = harness.setupAgentComposerTestRoot())
  })

  afterEach(async () => {
    await harness.cleanupAgentComposerTestRoot(root)
  })

  it('keeps selected workspace host context implicit before launch', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-remote"
          selectedThread={null}
          selectedProject={{
            id: 'worktree-remote',
            label: 'Remote Janus',
            path: '/home/jake/janus-code',
            hostKind: 'ssh',
            branchName: 'feature/remote',
            agentDetectionTarget: { kind: 'ssh', connectionId: 'ssh-1' }
          }}
        />
      )
    })

    expect(container.querySelector<HTMLElement>('[aria-label="Prompt context"]')).toBeNull()
    expect(container.textContent).not.toContain('/home/jake/janus-code')
  })

  it('warns when selected workspace branch no longer matches the thread branch', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          selectedProject={{
            id: 'worktree-1',
            label: 'Janus Code',
            path: '/Users/jakedom/janus-code',
            hostKind: 'local',
            branchName: 'main'
          }}
        />
      )
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Workspace')
    expect(contextTray!.textContent).toContain('main')
    expect(contextTray!.textContent).toContain('Context source changed')
  })

  it('keeps selected thread context implicit before follow-up', async () => {
    await act(async () => {
      root.render(
        <AgentComposer activeWorktreeId="worktree-1" selectedThread={harness.runningThread} />
      )
    })

    expect(container.querySelector<HTMLElement>('[aria-label="Prompt context"]')).toBeNull()
    expect(container.textContent).not.toContain('Implement composer')
  })

  it('keeps selected changed-file context implicit before follow-up', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          diffs={[harness.changedFileSummary]}
        />
      )
    })

    expect(container.querySelector<HTMLElement>('[aria-label="Prompt context"]')).toBeNull()
    expect(container.textContent).not.toContain('+12')
  })

  it('warns when changed-file context belongs to another thread', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          diffs={[{ ...harness.changedFileSummary, threadId: 'thread-2' }]}
        />
      )
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Changes')
    expect(contextTray!.textContent).toContain('Context source changed')
  })

  it('keeps selected review context implicit before follow-up', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          review={harness.reviewSummary}
        />
      )
    })

    expect(container.querySelector<HTMLElement>('[aria-label="Prompt context"]')).toBeNull()
    expect(container.textContent).not.toContain('GitLab #42')
  })

  it('warns when review context belongs to another worktree', async () => {
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.runningThread}
          review={{ ...harness.reviewSummary, worktreeId: 'worktree-2' }}
        />
      )
    })

    const contextTray = container.querySelector<HTMLElement>('[aria-label="Prompt context"]')
    expect(contextTray).not.toBeNull()
    expect(contextTray!.textContent).toContain('Review')
    expect(contextTray!.textContent).toContain('Context source changed')
  })

  it('sends follow-up prompts to completed selected threads', async () => {
    const onPendingAgentLaunch = vi.fn()
    const onMessageSent = vi.fn()
    mocks.sendNotesToActiveAgentSession.mockResolvedValue({
      status: 'sent'
    } satisfies ActiveAgentNotesSendResult)
    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={harness.makeThread({ phase: 'completed' })}
          onPendingAgentLaunch={onPendingAgentLaunch}
          onMessageSent={onMessageSent}
        />
      )
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      harness.setTextControlValue(textarea!, 'Start a follow-up agent.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).not.toHaveBeenCalled()
    expect(mocks.sendNotesToActiveAgentSession).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      prompt: 'Start a follow-up agent.'
    })
    expect(onPendingAgentLaunch).not.toHaveBeenCalled()
    expect(onMessageSent).toHaveBeenCalledTimes(1)
    expect(textarea?.value).toBe('')
  })

  it('passes the selected thinking mode into new Codex agent launches', async () => {
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.launchAgentInNewTab.mockReturnValue({
      tabId: 'tab-codex',
      startupPlan: {
        agent: 'codex',
        launchCommand: 'codex',
        expectedProcess: 'codex',
        followupPrompt: null
      },
      pasteDraftAfterLaunch: false
    })

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    await harness.openAgentSettings(container)
    const highReasoningOption = harness.getDocumentButton('Set reasoning: High')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(highReasoningOption).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      highReasoningOption?.click()
    })
    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use deep reasoning for this.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'worktree-1',
      prompt: 'Use deep reasoning for this.',
      agentArgs: '--dangerously-bypass-approvals-and-sandbox -c model_reasoning_effort=high',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
  })

  it('passes the selected model into new Codex agent launches', async () => {
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['codex'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })
    mocks.launchAgentInNewTab.mockReturnValue({
      tabId: 'tab-codex',
      startupPlan: {
        agent: 'codex',
        launchCommand: 'codex',
        expectedProcess: 'codex',
        followupPrompt: null
      },
      pasteDraftAfterLaunch: false
    })

    await act(async () => {
      root.render(<AgentComposer activeWorktreeId="worktree-1" selectedThread={null} />)
    })

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea')
    await harness.openAgentSettings(container)
    await act(async () => {
      harness.getDocumentButton('Open model menu')?.click()
    })
    const modelOption = harness.getDocumentButton('Set model: GPT-5.4 Mini')
    const button = container.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(textarea).not.toBeNull()
    expect(modelOption).not.toBeNull()
    expect(button).not.toBeNull()

    await act(async () => {
      modelOption?.click()
    })
    await act(async () => {
      harness.setTextControlValue(textarea!, 'Use the selected model.')
    })
    await act(async () => {
      button?.click()
    })

    expect(mocks.updateSettings).toHaveBeenCalledWith({
      agentModelSelections: { codex: 'gpt-5.4-mini' }
    })
    expect(mocks.launchAgentInNewTab).toHaveBeenCalledWith({
      agent: 'codex',
      worktreeId: 'worktree-1',
      prompt: 'Use the selected model.',
      agentArgs:
        '--dangerously-bypass-approvals-and-sandbox --model gpt-5.4-mini -c model_reasoning_effort=medium',
      promptDelivery: 'auto-submit',
      launchSource: 'new_workspace_composer',
      onPromptDelivered: expect.any(Function)
    })
  })

  it('syncs the resolved draft agent back to the workspace tab strip', async () => {
    const onDraftSessionAgentChange = vi.fn()
    mocks.useDetectedAgents.mockReturnValue({
      detectedIds: ['grok', 'codex', 'claude'],
      isLoading: false,
      isRefreshing: false,
      refresh: vi.fn()
    })

    await act(async () => {
      root.render(
        <AgentComposer
          activeWorktreeId="worktree-1"
          selectedThread={null}
          draftSessionId="draft-1"
          onDraftSessionAgentChange={onDraftSessionAgentChange}
        />
      )
      await Promise.resolve()
    })

    expect(onDraftSessionAgentChange).toHaveBeenCalledWith('claude')
  })
})
