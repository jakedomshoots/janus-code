import type { ElectronApplication, Page } from '@stablyai/playwright-test'
import { expect } from '@stablyai/playwright-test'

export function agentWorkspaceRegion(page: Page) {
  return page.getByRole('region', { name: /Agent workspace/i })
}

export function agentWorkspaceRightPanel(page: Page) {
  return agentWorkspaceRegion(page).getByRole('complementary')
}

export async function selectAgentThreadTab(page: Page, threadTitle: string): Promise<void> {
  const workspace = agentWorkspaceRegion(page)
  await workspace.getByRole('tab', { name: new RegExp(threadTitle) }).click()
}

export async function waitForAgentRightPanelActions(
  page: Page,
  buttonName: 'Approve' | 'Deny'
): Promise<void> {
  const workspace = agentWorkspaceRegion(page)
  const actionButton = agentWorkspaceRightPanel(page).getByRole('button', {
    name: buttonName,
    exact: true
  })
  await expect
    .poll(
      async () => {
        if (await actionButton.isVisible()) {
          return true
        }
        const panelButton = workspace.getByRole('button', { name: /Show right panel/i })
        if (await panelButton.isVisible()) {
          await panelButton.click({ force: true })
        }
        return false
      },
      { timeout: 15_000, message: `${buttonName} controls did not appear in the right panel` }
    )
    .toBe(true)
}

export async function enableGuiAgentWorkspace(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const store = window.__store
    if (!store) {
      throw new Error('window.__store is not available')
    }
    await store.getState().updateSettings({ guiAgentWorkspaceEnabled: true })
    store.getState().setActiveView('terminal')
  })
  await expect(agentWorkspaceRegion(page)).toBeVisible({ timeout: 30_000 })
}

export async function seedAgentWorkspaceThread(
  page: Page,
  input: {
    paneKey: string
    worktreeId: string
    title: string
    prompt: string
    approval?: {
      id: string
      status: 'requested'
      title: string
      toolName: string
      toolInput: string
      fallbackText: string
    }
  }
): Promise<void> {
  await page.evaluate(({ paneKey, worktreeId, title, prompt, approval }) => {
    const store = window.__store
    if (!store) {
      throw new Error('window.__store is not available')
    }

    const now = Date.now()
    store.getState().setAgentStatus(
      paneKey,
      {
        state: approval ? 'waiting' : 'working',
        prompt,
        agentType: 'codex',
        ...(approval ? { approval } : {})
      },
      title,
      { updatedAt: now, stateStartedAt: now },
      { worktreeId }
    )
  }, input)
}

export async function seedAgentWorkspaceReviewSourceControlState(
  page: Page,
  input: {
    paneKey: string
    worktreeId: string
    title: string
    prompt: string
  }
): Promise<{
  stagedFilePath: string
  unstagedFilePath: string
}> {
  return page.evaluate(async ({ paneKey, worktreeId, title, prompt }) => {
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

    const repo = state.repos.find((candidate) => candidate.id === worktree.repoId)
    if (!repo) {
      throw new Error(`Repo for worktree ${worktreeId} is not available`)
    }

    const branch = (worktree.branch ?? '').replace(/^refs\/heads\//, '') || 'e2e/review'
    const now = Date.now()
    const separator = worktree.path.includes('\\') ? '\\' : '/'
    const unstagedFilePath = 'src/index.ts'
    const stagedFilePath = `agent-workspace-review-${now}.md`
    await state.updateSettings({ defaultTuiAgent: 'codex' })
    await window.api.fs.writeFile({
      filePath: `${worktree.path}${separator}src${separator}index.ts`,
      content: `export const hello = "agent workspace review ${now}"\n`
    })
    await window.api.fs.writeFile({
      filePath: `${worktree.path}${separator}${stagedFilePath}`,
      content: `# Agent workspace review ${now}\n\nStaged for the right panel.\n`
    })
    await window.api.git.stage({ worktreePath: worktree.path, filePath: stagedFilePath })
    state.setGitStatus(worktreeId, await window.api.git.status({ worktreePath: worktree.path }))
    store.setState({
      hostedReviewCache: {
        ...state.hostedReviewCache,
        [`local::${repo.id}::${branch}`]: {
          data: {
            provider: 'gitlab',
            number: 42,
            title: 'Tighten workspace context',
            state: 'open',
            url: 'https://gitlab.example.com/janus/merge_requests/42',
            status: 'pending',
            updatedAt: new Date(now).toISOString(),
            mergeable: 'UNKNOWN'
          },
          fetchedAt: now
        }
      }
    })
    store.getState().setAgentStatus(
      paneKey,
      {
        state: 'done',
        prompt,
        agentType: 'codex',
        verification: {
          command: 'pnpm test --filter agent-workspace',
          status: 'passed'
        }
      },
      title,
      { updatedAt: now, stateStartedAt: now - 30_000 },
      { worktreeId }
    )

    return { stagedFilePath, unstagedFilePath }
  }, input)
}

// Why: contextBridge freezes window.api, so approval E2E proves PTY bytes via
// the same main-process spy path used by terminal shortcut specs.
export async function installMainProcessPtyWriteSpy(app: ElectronApplication): Promise<void> {
  await app.evaluate(({ ipcMain }) => {
    const g = globalThis as unknown as {
      __ptyWriteLog?: { id: string; data: string }[]
      __ptyWriteSpyInstalled?: boolean
      __ptyWriteAcceptedSpyInstalled?: boolean
    }
    if (g.__ptyWriteSpyInstalled) {
      return
    }
    g.__ptyWriteLog = []
    g.__ptyWriteSpyInstalled = true
    ipcMain.prependListener('pty:write', (_event: unknown, args: { id: string; data: string }) => {
      g.__ptyWriteLog!.push({ id: args.id, data: args.data })
    })
    const invokeHandlers = (
      ipcMain as unknown as {
        _invokeHandlers?: Map<
          string,
          (event: unknown, args: { id: string; data: string }) => unknown
        >
      }
    )._invokeHandlers
    const writeAcceptedHandler = invokeHandlers?.get('pty:writeAccepted')
    if (writeAcceptedHandler && !g.__ptyWriteAcceptedSpyInstalled) {
      g.__ptyWriteAcceptedSpyInstalled = true
      invokeHandlers?.set('pty:writeAccepted', (event, args) => {
        g.__ptyWriteLog!.push({ id: args.id, data: args.data })
        return writeAcceptedHandler(event, args)
      })
    }
  })
}

export async function clearPtyWriteLog(app: ElectronApplication): Promise<void> {
  await app.evaluate(() => {
    const g = globalThis as unknown as { __ptyWriteLog?: { id: string; data: string }[] }
    if (g.__ptyWriteLog) {
      g.__ptyWriteLog.length = 0
    }
  })
}

export async function getPtyWrites(app: ElectronApplication): Promise<string[]> {
  return app.evaluate(() => {
    const g = globalThis as unknown as { __ptyWriteLog?: { id: string; data: string }[] }
    return (g.__ptyWriteLog ?? []).map((entry) => entry.data)
  })
}
