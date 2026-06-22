import type { Page } from '@stablyai/playwright-test'

export async function seedAgentWorkspacePlanEvidenceState(
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
      protectedResourcePolicies: [
        {
          id: 'e2e-production-deploys',
          label: 'Production deploys',
          scope: { kind: 'global' },
          commandPatterns: ['*kubectl*prod*']
        }
      ]
    })
    store.getState().setAgentStatus(
      paneKey,
      {
        state: 'waiting',
        prompt,
        agentType: 'codex',
        toolEvent: {
          id: 'tool-e2e-prod-deploy',
          status: 'running',
          name: 'Bash',
          input: 'kubectl apply -f prod/deploy.yaml',
          fallbackText: 'Running Bash: kubectl apply -f prod/deploy.yaml'
        },
        approval: {
          id: 'approval-e2e-prod-deploy',
          status: 'requested',
          title: 'Approve Bash',
          description: 'Deploy production manifests.',
          toolName: 'Bash',
          toolInput: 'kubectl apply -f prod/deploy.yaml',
          fallbackText: 'Approve Bash: kubectl apply -f prod/deploy.yaml'
        },
        plan: {
          title: 'Stabilize workspace evidence',
          explanation: 'Confirm risky commands and handoff evidence before release.',
          steps: [
            {
              id: 'map-evidence',
              title: 'Map the trust surfaces',
              status: 'completed'
            },
            {
              id: 'verify-run-ledger',
              title: 'Verify the run ledger',
              status: 'in-progress'
            },
            {
              id: 'copy-replay',
              title: 'Copy the replay report',
              status: 'pending'
            }
          ],
          markdown:
            '# Stabilize workspace evidence\n\n## Summary\n\nConfirm risky commands and replay export.',
          updatedAt: now
        },
        verification: {
          command: 'pnpm run verify:agent-workspace',
          status: 'running',
          executionContext: {
            hostKind: 'local',
            cwd: worktree.path,
            platform: 'darwin'
          }
        }
      },
      title,
      { updatedAt: now, stateStartedAt: now - 45_000 },
      { worktreeId }
    )
  }, input)
}
