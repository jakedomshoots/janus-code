import { describe, expect, it } from 'vitest'
import type { AgentStatusEntry } from '../../../../shared/agent-status-types'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import type { AppState } from '../../store'
import { createTestStore, makeTab, makeWorktree } from '../../store/slices/store-test-helpers'
import { selectAgentWorkspaceSnapshot } from './orca-agent-workspace-selectors'

const paneKey = makePaneKey('tab-agent', '11111111-1111-4111-8111-111111111111')
const worktree = makeWorktree({
  id: 'wt-agent',
  repoId: 'repo-agent',
  path: '/repo/janus-code/worktrees/agent'
})
const tab = makeTab({ id: 'tab-agent', worktreeId: worktree.id })

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState({
    repos: [{ id: 'repo-agent', path: '/repo/janus-code', displayName: 'Janus Code' }],
    worktreesByRepo: { 'repo-agent': [worktree] },
    activeWorktreeId: worktree.id,
    tabsByWorktree: { [worktree.id]: [tab] },
    ...overrides
  } as Partial<AppState>)
  return store.getState()
}

function agentEntry(overrides: Partial<AgentStatusEntry>): AgentStatusEntry {
  return {
    state: 'working',
    prompt: 'Visible user prompt',
    updatedAt: Date.UTC(2026, 5, 19, 15, 10),
    stateStartedAt: Date.UTC(2026, 5, 19, 15, 10),
    agentType: 'codex',
    paneKey,
    stateHistory: [],
    ...overrides
  }
}

describe('orca agent timeline selectors', () => {
  it('surfaces live assistant text while a CLI agent is still working', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [paneKey]: agentEntry({
            state: 'working',
            prompt: 'Draft the latency fix.',
            lastAssistantMessage: 'I found the slow handoff and am wiring the preview.'
          })
        }
      })
    )

    expect(snapshot.timeline.map((entry) => [entry.kind, entry.text, entry.status])).toEqual([
      ['user', 'Draft the latency fix.', 'done'],
      ['agent', 'I found the slow handoff and am wiring the preview.', 'running']
    ])
  })

  it('renders waiting assistant questions as one durable pending row', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [paneKey]: agentEntry({
            state: 'waiting',
            prompt: 'Start the dev server.',
            agentType: 'antigravity',
            toolName: 'ask_question',
            toolInput: 'Which port should I use for the dev server?',
            lastAssistantMessage: 'Which port should I use for the dev server?'
          })
        }
      })
    )

    expect(snapshot.timeline.map((entry) => [entry.kind, entry.text, entry.status])).toEqual([
      ['user', 'Start the dev server.', 'done'],
      ['approval', 'Which port should I use for the dev server?', 'pending']
    ])
  })

  it('hides internal runtime prompts from chat timeline bubbles', () => {
    const snapshot = selectAgentWorkspaceSnapshot(
      getState({
        agentStatusByPaneKey: {
          [paneKey]: agentEntry({
            state: 'done',
            prompt:
              '## Memory Writing Agent: Phase 2 (Consolidation) You are a Memory Writing Agent.',
            lastAssistantMessage: 'Internal memory write complete.',
            conversation: [
              {
                id: `${paneKey}:turn:1`,
                prompt: '100/100 composer smoke test.',
                assistantMessage: 'Confirmed.',
                startedAt: Date.UTC(2026, 5, 19, 14, 50),
                completedAt: Date.UTC(2026, 5, 19, 14, 51)
              },
              {
                id: `${paneKey}:turn:2`,
                prompt: '<environment_context><cwd>/repo</cwd></environment_context>',
                assistantMessage: 'Internal context consumed.',
                startedAt: Date.UTC(2026, 5, 19, 15, 0),
                completedAt: Date.UTC(2026, 5, 19, 15, 1)
              }
            ]
          })
        }
      })
    )

    expect(snapshot.timeline.map((entry) => [entry.kind, entry.text])).toEqual([
      ['user', '100/100 composer smoke test.'],
      ['agent', 'Confirmed.']
    ])
  })
})
