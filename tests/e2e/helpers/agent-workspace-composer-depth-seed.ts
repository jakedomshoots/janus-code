import type { Page } from '@stablyai/playwright-test'

export async function seedAgentWorkspaceComposerDepthState(
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
    await state.updateSettings({
      defaultTuiAgent: 'codex',
      disabledTuiAgents: [],
      agentTaskFitHintsEnabled: true,
      voice: {
        enabled: true,
        sttModel: '',
        modelsDir: '',
        language: 'en',
        dictationMode: 'toggle',
        terminalConfirmBeforeInsert: false,
        userModels: [],
        openAiApiKeyConfigured: false
      }
    })
    store.setState({
      detectedAgentIds: ['codex', 'claude'],
      isDetectingAgents: false,
      memorySnapshotError: null,
      memorySnapshot: {
        app: {
          cpu: 2,
          memory: 2048,
          main: { cpu: 1, memory: 1024 },
          renderer: { cpu: 1, memory: 512 },
          other: { cpu: 0, memory: 512 },
          history: [2048]
        },
        worktrees: [
          {
            worktreeId,
            worktreeName: worktree.displayName || worktree.path,
            repoId: worktree.repoId,
            repoName: worktree.repoId,
            cpu: 4,
            memory: 4096,
            sessions: [
              {
                sessionId: 'session-e2e-composer-depth',
                paneKey,
                pid: 123,
                cpu: 4,
                memory: 4096
              }
            ],
            history: [4096]
          }
        ],
        host: {
          totalMemory: 8192,
          freeMemory: 4096,
          usedMemory: 4096,
          memoryUsagePercent: 50,
          cpuCoreCount: 8,
          loadAverage1m: 1
        },
        totalCpu: 6,
        totalMemory: 6144,
        collectedAt: Date.UTC(2026, 5, 21, 16, 0)
      }
    })
    store.getState().setAgentStatus(
      paneKey,
      {
        state: 'working',
        prompt,
        agentType: 'codex',
        toolEvent: {
          id: 'tool-e2e-composer-depth',
          status: 'running',
          name: 'Bash',
          input: 'pnpm run test:e2e',
          fallbackText: 'Running Bash: pnpm run test:e2e'
        },
        verification: {
          command: 'pnpm run test:e2e',
          status: 'running'
        }
      },
      title,
      { updatedAt: now, stateStartedAt: now - 45_000 },
      { worktreeId }
    )
  }, input)
}
