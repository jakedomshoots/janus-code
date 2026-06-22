import { describe, expect, it, vi } from 'vitest'
import type { AppState } from '@/store'
import { activateAgentBrowserTab } from './agent-browser-workbench-activation'

const mocks = vi.hoisted(() => ({
  state: null as AppState | null,
  liveBrowserUrls: new Map<string, string>()
}))

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => {
      if (!mocks.state) {
        throw new Error('mock state not initialized')
      }
      return mocks.state
    }
  }
}))

vi.mock('../browser-pane/browser-runtime', () => ({
  getLiveBrowserUrl: (pageId: string) => mocks.liveBrowserUrls.get(pageId) ?? null
}))

describe('activateAgentBrowserTab', () => {
  it('focuses a live sibling page instead of a stale active page', () => {
    const focusBrowserTabInWorktree = vi.fn()
    const activateTab = vi.fn()
    const setActiveBrowserTab = vi.fn()
    const setActiveTabType = vi.fn()
    const createUnifiedTab = vi.fn()
    const browserTab = {
      id: 'browser-a',
      worktreeId: 'worktree-1',
      activePageId: 'stale-page',
      pageIds: ['stale-page', 'live-page'],
      url: 'http://localhost:5173/home',
      title: 'ChemCheck - Pool Service',
      loading: false,
      faviconUrl: null,
      canGoBack: false,
      canGoForward: false,
      loadError: null,
      createdAt: 1
    }
    mocks.liveBrowserUrls.set('live-page', 'http://localhost:5173/home')
    mocks.state = {
      browserTabsByWorktree: {
        'worktree-1': [browserTab]
      },
      browserPagesByWorkspace: {
        'browser-a': [
          {
            id: 'stale-page',
            workspaceId: 'browser-a',
            worktreeId: 'worktree-1',
            url: 'http://localhost:5173/home',
            title: 'ChemCheck - Pool Service',
            loading: false,
            faviconUrl: null,
            canGoBack: false,
            canGoForward: false,
            loadError: null,
            createdAt: 1
          },
          {
            id: 'live-page',
            workspaceId: 'browser-a',
            worktreeId: 'worktree-1',
            url: 'http://localhost:5173/home',
            title: 'ChemCheck - Pool Service',
            loading: false,
            faviconUrl: null,
            canGoBack: false,
            canGoForward: false,
            loadError: null,
            createdAt: 2
          }
        ]
      },
      unifiedTabsByWorktree: {
        'worktree-1': [
          {
            id: 'browser-unified',
            entityId: 'browser-a',
            groupId: 'group-1',
            worktreeId: 'worktree-1',
            contentType: 'browser',
            label: 'ChemCheck - Pool Service',
            customLabel: null,
            color: null,
            sortOrder: 1,
            createdAt: 1
          }
        ]
      },
      groupsByWorktree: {
        'worktree-1': [
          {
            id: 'group-1',
            worktreeId: 'worktree-1',
            activeTabId: 'terminal-1',
            tabOrder: ['terminal-1', 'browser-unified']
          }
        ]
      }
    } as unknown as AppState

    activateAgentBrowserTab({
      worktreeId: 'worktree-1',
      browserTab,
      targetGroupId: 'group-1',
      activateTab,
      createUnifiedTab,
      setActiveBrowserTab,
      setActiveTabType,
      focusBrowserTabInWorktree
    })

    expect(focusBrowserTabInWorktree).toHaveBeenCalledWith('worktree-1', 'live-page', {
      surfacePane: true
    })
    expect(activateTab).toHaveBeenCalledWith('browser-unified')
    expect(setActiveBrowserTab).toHaveBeenCalledWith('browser-a')
    expect(setActiveTabType).toHaveBeenCalledWith('browser')
  })
})
