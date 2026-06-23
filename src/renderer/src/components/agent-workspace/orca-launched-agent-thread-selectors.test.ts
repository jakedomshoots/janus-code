import { describe, expect, it } from 'vitest'
import type { AppState } from '@/store'
import {
  TEST_REPO,
  createTestStore,
  makeTab,
  makeWorktree
} from '@/store/slices/store-test-helpers'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import { TUI_AGENT_CONFIG } from '../../../../shared/tui-agent-config'
import type { TerminalLayoutSnapshot, TerminalTab, Worktree } from '../../../../shared/types'
import type { TuiAgent } from '../../../../shared/types'
import { selectAgentWorkspaceSnapshot } from './orca-agent-workspace-selectors'

const repo = { ...TEST_REPO, id: 'repo-janus', path: '/repo/janus-code' }
const ALL_TUI_AGENTS = Object.keys(TUI_AGENT_CONFIG) as TuiAgent[]

function getState(overrides: Partial<AppState> = {}): AppState {
  const store = createTestStore()
  store.setState(overrides as Partial<AppState>)
  return store.getState()
}

function worktree(id: string, overrides: Partial<Worktree> = {}): Worktree {
  return makeWorktree({ id, repoId: repo.id, path: `/repo/janus-code/${id}`, ...overrides })
}

function tab(id: string, worktreeId: string, overrides: Partial<TerminalTab> = {}): TerminalTab {
  return makeTab({ id, worktreeId, ...overrides })
}

function terminalLayout(leafId: string): TerminalLayoutSnapshot {
  return {
    root: { type: 'leaf', leafId },
    activeLeafId: leafId,
    expandedLeafId: null,
    ptyIdsByLeafId: { [leafId]: `pty-${leafId}` }
  }
}

function stateWithWorktree(worktreeEntry: Worktree, overrides: Partial<AppState> = {}): AppState {
  return getState({
    repos: [repo],
    worktreesByRepo: { [repo.id]: [worktreeEntry] },
    ...overrides
  })
}

describe('orca launched agent thread selectors', () => {
  it.each(ALL_TUI_AGENTS)(
    'maps a live hookless launched %s tab to a running workspace thread',
    (agent) => {
      const hookless = worktree('wt-hookless', {
        path: '/repo/janus-code/worktrees/hookless',
        branch: 'refs/heads/feature/hookless',
        displayName: 'Hookless Work'
      })
      const leafId = '77777777-7777-4777-8777-777777777777'
      const tabId = `tab-${agent}`
      const paneKey = makePaneKey(tabId, leafId)
      const title = `${agent} active task`
      const hooklessTab = tab(tabId, hookless.id, {
        launchAgent: agent,
        title: `${agent} Code`,
        createdAt: Date.UTC(2026, 5, 23, 18, 30)
      })

      const snapshot = selectAgentWorkspaceSnapshot(
        stateWithWorktree(hookless, {
          activeWorktreeId: hookless.id,
          tabsByWorktree: { [hookless.id]: [hooklessTab] },
          ptyIdsByTabId: { [tabId]: [`pty-${leafId}`] },
          terminalLayoutsByTabId: { [tabId]: terminalLayout(leafId) },
          runtimePaneTitlesByTabId: { [tabId]: { 1: title } }
        })
      )

      expect(snapshot.threads).toEqual([
        {
          id: paneKey,
          worktreeId: hookless.id,
          title,
          agentKind: agent,
          phase: 'running',
          updatedAt: '2026-06-23T18:30:00.000Z',
          branchName: 'feature/hookless',
          cwd: hookless.path
        }
      ])
    }
  )
})
