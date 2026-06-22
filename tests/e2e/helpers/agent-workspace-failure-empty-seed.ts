import type { Page } from '@stablyai/playwright-test'

export async function seedAgentWorkspaceFailureEmptyState(
  page: Page,
  input: {
    paneKey: string
    worktreeId: string
    title: string
    prompt: string
  }
): Promise<void> {
  await page.evaluate(async ({ paneKey, worktreeId, title, prompt }) => {
    const store = window.__store
    if (!store) {
      throw new Error('window.__store is not available')
    }

    const state = store.getState()
    const worktree = Object.values(state.worktreesByRepo)
      .flat()
      .find((candidate) => candidate.id === worktreeId)
    if (!worktree) {
      throw new Error(`Worktree ${worktreeId} is not available`)
    }

    const now = Date.now()
    // Why: this spec file is serial, and earlier source-control cases leave the
    // shared temp repo dirty. The failure-empty seed owns a real clean slate.
    const dirtyStatus = await window.api.git.status({ worktreePath: worktree.path })
    const stagedPaths = Array.from(
      new Set(
        dirtyStatus.entries.filter((entry) => entry.area === 'staged').map((entry) => entry.path)
      )
    )
    if (stagedPaths.length > 0) {
      await window.api.git.bulkUnstage({ worktreePath: worktree.path, filePaths: stagedPaths })
    }
    const statusAfterUnstage = await window.api.git.status({ worktreePath: worktree.path })
    const dirtyPaths = Array.from(new Set(statusAfterUnstage.entries.map((entry) => entry.path)))
    if (dirtyPaths.length > 0) {
      await window.api.git.bulkDiscard({ worktreePath: worktree.path, filePaths: dirtyPaths })
    }
    const cleanStatus = await window.api.git.status({ worktreePath: worktree.path })
    if (cleanStatus.entries.length > 0) {
      throw new Error('Failure-empty seed could not clean git status')
    }
    state.setGitStatus(worktreeId, cleanStatus)
    store.setState({
      memorySnapshot: null,
      memorySnapshotError: 'Resource daemon unavailable'
    })
    store.getState().setAgentStatus(
      paneKey,
      {
        state: 'done',
        prompt,
        agentType: 'codex',
        toolEvent: {
          id: 'tool-e2e-failed-empty',
          status: 'failed',
          name: 'Bash',
          input: 'pnpm run verify:agent-workspace',
          fallbackText: 'Running Bash: pnpm run verify:agent-workspace'
        },
        failure: {
          id: 'failure-e2e-failed-empty',
          source: 'hook',
          reason: 'verification-failed',
          exitCode: 1,
          recoverable: true,
          fallbackText: 'Verification failed before the agent produced file changes.'
        },
        verification: {
          command: 'pnpm run verify:agent-workspace',
          status: 'failed',
          executionContext: {
            hostKind: 'runtime',
            cwd: worktree.path,
            platform: 'linux',
            runtimeEnvironmentId: 'runtime-old-server'
          }
        }
      },
      title,
      { updatedAt: now, stateStartedAt: now - 90_000 },
      { worktreeId }
    )
  }, input)
}
