import type { Page } from '@stablyai/playwright-test'

type SeededCompareState = {
  activeTitle: string
  challengerTitle: string
  activeWorktreeId: string
  challengerWorktreeId: string
}

export async function seedAgentWorkspaceCompareState(
  page: Page,
  input: {
    paneKey: string
    worktreeId: string
    titlePrefix: string
  }
): Promise<SeededCompareState> {
  return page.evaluate(async ({ paneKey, worktreeId, titlePrefix }) => {
    const store = window.__store
    if (!store) {
      throw new Error('window.__store is not available')
    }

    const state = store.getState()
    const allWorktrees = Object.values(state.worktreesByRepo).flat()
    const activeWorktree = allWorktrees.find((candidate) => candidate.id === worktreeId)
    if (!activeWorktree) {
      throw new Error(`Worktree ${worktreeId} is not available`)
    }

    const challengerWorktree = allWorktrees.find(
      (candidate) => candidate.repoId === activeWorktree.repoId && candidate.id !== worktreeId
    )
    if (!challengerWorktree) {
      throw new Error(`No comparison worktree found for repo ${activeWorktree.repoId}`)
    }

    const now = Date.now()
    const activeTitle = `${titlePrefix} Codex ${now}`
    const challengerTitle = `${titlePrefix} Claude ${now}`
    const challengerPaneKey = `e2e-compare-${now}:0`
    const separator = activeWorktree.path.includes('\\') ? '\\' : '/'
    await window.api.fs.writeFile({
      filePath: `${activeWorktree.path}${separator}src${separator}index.ts`,
      content: `export const hello = "compare codex ${now}"\n`
    })
    await window.api.fs.writeFile({
      filePath: `${challengerWorktree.path}${separator}src${separator}index.ts`,
      content: `export const hello = "compare claude ${now}"\n`
    })
    state.setGitStatus(
      activeWorktree.id,
      await window.api.git.status({ worktreePath: activeWorktree.path })
    )
    state.setGitStatus(
      challengerWorktree.id,
      await window.api.git.status({ worktreePath: challengerWorktree.path })
    )
    store.getState().setAgentStatus(
      paneKey,
      {
        state: 'done',
        prompt: 'Compare the Codex implementation attempt',
        agentType: 'codex',
        toolEvent: {
          id: 'tool-e2e-compare-codex',
          status: 'completed',
          name: 'Bash',
          input: 'pnpm run typecheck:web',
          fallbackText: 'Running Bash: pnpm run typecheck:web'
        },
        verification: {
          command: 'pnpm run typecheck:web',
          status: 'passed'
        }
      },
      activeTitle,
      { updatedAt: now, stateStartedAt: now - 60_000 },
      { worktreeId: activeWorktree.id }
    )
    store.getState().setAgentStatus(
      challengerPaneKey,
      {
        state: 'done',
        prompt: 'Compare the Claude implementation attempt',
        agentType: 'claude',
        toolEvent: {
          id: 'tool-e2e-compare-claude',
          status: 'failed',
          name: 'Bash',
          input: 'pnpm run test:e2e',
          fallbackText: 'Running Bash: pnpm run test:e2e'
        },
        verification: {
          command: 'pnpm run test:e2e',
          status: 'failed'
        }
      },
      challengerTitle,
      { updatedAt: now - 1_000, stateStartedAt: now - 75_000 },
      { worktreeId: challengerWorktree.id }
    )

    return {
      activeTitle,
      challengerTitle,
      activeWorktreeId: activeWorktree.id,
      challengerWorktreeId: challengerWorktree.id
    }
  }, input)
}
