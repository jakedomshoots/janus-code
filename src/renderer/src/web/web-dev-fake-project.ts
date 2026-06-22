import {
  getDefaultUIState,
  getDefaultWorkspaceSession,
  ORCA_BROWSER_BLANK_URL
} from '../../../shared/constants'
import type { DetectedWorktreeListResult, Repo, Worktree } from '../../../shared/types'
import { isLocalDevWebHost } from './web-dev-local-pairing'
import { readStoredWebRuntimeEnvironment } from './web-runtime-environment'

export const DEV_FAKE_REPO_ID = 'dev-fake-repo'
export const DEV_FAKE_PROJECT_PATH = '/tmp/janus-fake-project'
export const DEV_FAKE_WORKTREE_ID = `${DEV_FAKE_REPO_ID}::${DEV_FAKE_PROJECT_PATH}`

const UI_STORAGE_KEY = 'orca.web.ui.v1'
const SESSION_STORAGE_KEY = 'orca.web.workspaceSession.v1'

export const DEV_FAKE_REPO: Repo = {
  id: DEV_FAKE_REPO_ID,
  path: DEV_FAKE_PROJECT_PATH,
  displayName: 'Fake Project',
  badgeColor: '#6366f1',
  addedAt: 1_700_000_000_000
}

export const DEV_FAKE_WORKTREE: Worktree = {
  id: DEV_FAKE_WORKTREE_ID,
  repoId: DEV_FAKE_REPO_ID,
  path: DEV_FAKE_PROJECT_PATH,
  head: 'abc123def456',
  branch: 'refs/heads/main',
  isBare: false,
  isMainWorktree: true,
  displayName: '.factory',
  comment: '',
  linkedIssue: null,
  linkedPR: null,
  linkedLinearIssue: null,
  linkedGitLabMR: null,
  linkedGitLabIssue: null,
  isArchived: false,
  isUnread: false,
  isPinned: false,
  sortOrder: 0,
  lastActivityAt: 1_700_000_000_000
}

export function isDevFakeProjectShell(): boolean {
  return import.meta.env.DEV && isLocalDevWebHost(window.location.hostname)
}

export function shouldUseDevFakeProject(): boolean {
  return isDevFakeProjectShell() && readStoredWebRuntimeEnvironment() === null
}

export function getDevFakeBrowserDefaultUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/`
  }
  return 'http://127.0.0.1:5175/'
}

export function isBlankBrowserUrl(url: string): boolean {
  return url === 'about:blank' || url === ORCA_BROWSER_BLANK_URL
}

export function getDevFakeRepos(): Repo[] {
  return [DEV_FAKE_REPO]
}

export function getDevFakeWorktreesForRepo(repoId: string): Worktree[] {
  return repoId === DEV_FAKE_REPO_ID ? [DEV_FAKE_WORKTREE] : []
}

export function getDevFakeDetectedWorktrees(repoId: string): DetectedWorktreeListResult | null {
  const worktrees = getDevFakeWorktreesForRepo(repoId)
  if (worktrees.length === 0) {
    return null
  }
  return {
    repoId,
    authoritative: true,
    source: 'session-fallback',
    worktrees: worktrees.map((worktree) => ({
      ...worktree,
      ownership: 'orca-managed',
      selectedCheckout: false,
      visible: true
    }))
  }
}

export function seedDevFakeProjectLocalState(): void {
  const ui = {
    ...getDefaultUIState(),
    ...readJsonRecord(UI_STORAGE_KEY),
    lastActiveRepoId: DEV_FAKE_REPO_ID,
    lastActiveWorktreeId: DEV_FAKE_WORKTREE_ID
  }
  const session = {
    ...getDefaultWorkspaceSession(),
    ...readJsonRecord(SESSION_STORAGE_KEY),
    activeRepoId: DEV_FAKE_REPO_ID,
    activeWorktreeId: DEV_FAKE_WORKTREE_ID
  }
  window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(ui))
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function readJsonRecord(key: string): Record<string, unknown> {
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return {}
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}
