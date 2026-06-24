import { describe, expect, it } from 'vitest'
import { createAgentWorkspaceDraftSession } from './agent-workspace-draft-sessions'
import {
  findNewAgentWorkspaceThread,
  selectPanesAfterProjectThreadUpdate
} from './agent-workspace-pane-thread-selection'
import type { AgentWorkspacePaneState } from './agent-workspace-pane-state'
import type { AgentWorkspaceThread } from './agent-workspace-types'

function thread(
  id: string,
  phase: AgentWorkspaceThread['phase'] = 'running'
): AgentWorkspaceThread {
  return {
    id,
    worktreeId: 'worktree-1',
    title: 'Build the workspace flow',
    agentKind: 'codex',
    phase,
    updatedAt: '2026-06-19T20:00:00.000Z',
    branchName: null,
    cwd: '/repo/janus-code'
  }
}

describe('selectPanesAfterProjectThreadUpdate', () => {
  it('treats starting threads as new draft-launch candidates', () => {
    const olderThread = thread('thread-old', 'completed')
    const startingThread = thread('thread-starting', 'starting')

    expect(
      findNewAgentWorkspaceThread([startingThread, olderThread], new Set([olderThread.id]))
    ).toBe(startingThread)
  })

  it('consumes the selected draft session when its first real agent thread appears', () => {
    const draftSession = createAgentWorkspaceDraftSession('codex')
    const pane: AgentWorkspacePaneState = {
      id: 'pane-1',
      selectedThreadId: null,
      draftSessions: [draftSession],
      selectedDraftSessionId: draftSession.id,
      pendingLaunchedThreadSelection: false
    }
    const launchedThread = thread('thread-1')

    const [nextPane] = selectPanesAfterProjectThreadUpdate({
      panes: [pane],
      launchedThread,
      projectThreads: [launchedThread],
      defaultThreadId: launchedThread.id,
      hadProjectThreads: false
    })

    expect(nextPane?.selectedThreadId).toBe(launchedThread.id)
    expect(nextPane?.selectedDraftSessionId).toBeNull()
    expect(nextPane?.draftSessions).toEqual([])
  })

  it('consumes the selected draft session when a pending launch appears beside older threads', () => {
    const draftSession = createAgentWorkspaceDraftSession('claude')
    const pane: AgentWorkspacePaneState = {
      id: 'pane-1',
      selectedThreadId: null,
      draftSessions: [draftSession],
      selectedDraftSessionId: draftSession.id,
      pendingLaunchedThreadSelection: true
    }
    const olderThread = thread('thread-old')
    const launchedThread = thread('thread-new')

    const [nextPane] = selectPanesAfterProjectThreadUpdate({
      panes: [pane],
      launchedThread,
      projectThreads: [launchedThread, olderThread],
      defaultThreadId: launchedThread.id,
      hadProjectThreads: true
    })

    expect(nextPane?.selectedThreadId).toBe(launchedThread.id)
    expect(nextPane?.selectedDraftSessionId).toBeNull()
    expect(nextPane?.draftSessions).toEqual([])
  })

  it('selects the default thread when a CLI-created workspace has no draft marker', () => {
    const pane: AgentWorkspacePaneState = {
      id: 'pane-1',
      selectedThreadId: null,
      draftSessions: [],
      selectedDraftSessionId: null,
      pendingLaunchedThreadSelection: false
    }
    const cliThread = thread('thread-cli', 'completed')

    const [nextPane] = selectPanesAfterProjectThreadUpdate({
      panes: [pane],
      launchedThread: cliThread,
      projectThreads: [cliThread],
      defaultThreadId: cliThread.id,
      hadProjectThreads: false
    })

    expect(nextPane?.selectedThreadId).toBe(cliThread.id)
    expect(nextPane?.selectedDraftSessionId).toBeNull()
  })
})
