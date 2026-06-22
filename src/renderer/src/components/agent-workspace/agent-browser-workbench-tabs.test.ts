import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppState } from '@/store'
import {
  consolidateAgentBrowserTabs,
  ensureBrowserUnifiedTabActive,
  ensureBrowserUnifiedTabRegistered,
  pruneStaleAgentBrowserTabs,
  resolveAgentBrowserPageId,
  selectAgentBrowserTab,
  selectNewestAssignedAgentBrowserTab
} from './agent-browser-workbench-tabs'
import { trackAgentWorkspaceBrowserTab } from './agent-workspace-browser-tab-session'

const mocks = vi.hoisted(() => ({
  liveBrowserUrls: new Map<string, string>()
}))

vi.mock('../browser-pane/browser-runtime', () => ({
  getLiveBrowserUrl: (pageId: string) => mocks.liveBrowserUrls.get(pageId) ?? null
}))

function makeState(
  overrides: Partial<{
    browserTabs: AppState['browserTabsByWorktree'][string]
    browserPagesByWorkspace: AppState['browserPagesByWorkspace']
    activeBrowserTabId: string | null
    unifiedTabs: AppState['unifiedTabsByWorktree'][string]
    groups: AppState['groupsByWorktree'][string]
    remoteHandles: AppState['remoteBrowserPageHandlesByPageId']
  }> = {}
): AppState {
  return {
    browserTabsByWorktree: {
      'worktree-1': overrides.browserTabs ?? []
    },
    browserPagesByWorkspace: overrides.browserPagesByWorkspace ?? {},
    activeBrowserTabIdByWorktree: {
      'worktree-1': overrides.activeBrowserTabId ?? null
    },
    unifiedTabsByWorktree: {
      'worktree-1': overrides.unifiedTabs ?? []
    },
    groupsByWorktree: {
      'worktree-1': overrides.groups ?? [
        { id: 'group-1', worktreeId: 'worktree-1', activeTabId: null, tabOrder: [] }
      ]
    },
    remoteBrowserPageHandlesByPageId: overrides.remoteHandles ?? {}
  } as unknown as AppState
}

describe('agent-browser-workbench-tabs', () => {
  beforeEach(() => {
    mocks.liveBrowserUrls.clear()
  })

  it('selects the active viable browser tab when it exists', () => {
    const state = makeState({
      browserTabs: [
        { id: 'browser-a', activePageId: 'page-a', pageIds: ['page-a'] } as never,
        { id: 'browser-b', activePageId: 'page-b', pageIds: ['page-b'] } as never
      ],
      activeBrowserTabId: 'browser-b',
      remoteHandles: {
        'page-a': { environmentId: 'runtime-1', remotePageId: 'remote-a' },
        'page-b': { environmentId: 'runtime-1', remotePageId: 'remote-b' }
      }
    })

    expect(selectAgentBrowserTab(state, 'worktree-1', true)?.id).toBe('browser-b')
  })

  it('prunes stale local-only browser tabs on paired web runtimes', () => {
    const closeBrowserTab = vi.fn()
    const state = makeState({
      browserTabs: [
        { id: 'stale', activePageId: 'stale-page', pageIds: ['stale-page'] } as never,
        { id: 'live', activePageId: 'live-page', pageIds: ['live-page'] } as never
      ],
      remoteHandles: {
        'live-page': { environmentId: 'runtime-1', remotePageId: 'remote-live' }
      }
    })

    pruneStaleAgentBrowserTabs({
      state,
      worktreeId: 'worktree-1',
      webRuntimeActive: true,
      closeBrowserTab
    })

    expect(closeBrowserTab).toHaveBeenCalledWith('stale')
    expect(closeBrowserTab).not.toHaveBeenCalledWith('live')
  })

  it('keeps tracked agent-workspace browser tabs while remote handles hydrate', () => {
    const closeBrowserTab = vi.fn()
    const state = makeState({
      browserTabs: [
        { id: 'tracked-stale', activePageId: 'tracked-page', pageIds: ['tracked-page'] } as never
      ]
    })
    trackAgentWorkspaceBrowserTab('worktree-1', 'tracked-stale')

    pruneStaleAgentBrowserTabs({
      state,
      worktreeId: 'worktree-1',
      webRuntimeActive: true,
      closeBrowserTab
    })

    expect(closeBrowserTab).not.toHaveBeenCalled()
  })

  it('resolves a live sibling page when the active browser page has no live webview', () => {
    mocks.liveBrowserUrls.set('live-page', 'http://localhost:5173/home')
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'stale-page',
          pageIds: ['stale-page', 'live-page']
        } as never
      ],
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
      } as never
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'live-page'
    )
  })

  it('keeps the active browser page when it is already live', () => {
    mocks.liveBrowserUrls.set('active-page', 'https://example.com/active')
    mocks.liveBrowserUrls.set('sibling-page', 'https://example.com/sibling')
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'active-page',
          pageIds: ['active-page', 'sibling-page']
        } as never
      ]
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'active-page'
    )
  })

  it('prefers a newer live sibling when duplicate pages point at the same URL', () => {
    mocks.liveBrowserUrls.set('active-page', 'http://localhost:5173/home')
    mocks.liveBrowserUrls.set('newer-page', 'http://localhost:5173/home')
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'active-page',
          pageIds: ['active-page', 'newer-page']
        } as never
      ],
      browserPagesByWorkspace: {
        'browser-a': [
          {
            id: 'active-page',
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
            id: 'newer-page',
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
      } as never
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'newer-page'
    )
  })

  it('prefers a same-url live sibling even when it was created before the active page', () => {
    mocks.liveBrowserUrls.set('active-page', 'http://localhost:5173/home')
    mocks.liveBrowserUrls.set('older-page', 'http://localhost:5173/home')
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'active-page',
          pageIds: ['active-page', 'older-page']
        } as never
      ],
      browserPagesByWorkspace: {
        'browser-a': [
          {
            id: 'active-page',
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
          },
          {
            id: 'older-page',
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
          }
        ]
      } as never
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'older-page'
    )
  })

  it('falls back to the active browser page when no page is live yet', () => {
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'active-page',
          pageIds: ['active-page', 'sibling-page']
        } as never
      ]
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'active-page'
    )
  })

  it('keeps an intentional blank active page even when a sibling is live', () => {
    mocks.liveBrowserUrls.set('sibling-page', 'https://example.com/sibling')
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          activePageId: 'blank-page',
          pageIds: ['blank-page', 'sibling-page']
        } as never
      ],
      browserPagesByWorkspace: {
        'browser-a': [
          {
            id: 'blank-page',
            workspaceId: 'browser-a',
            worktreeId: 'worktree-1',
            url: 'about:blank',
            title: 'New Tab',
            loading: false,
            faviconUrl: null,
            canGoBack: false,
            canGoForward: false,
            loadError: null,
            createdAt: 1
          },
          {
            id: 'sibling-page',
            workspaceId: 'browser-a',
            worktreeId: 'worktree-1',
            url: 'https://example.com/sibling',
            title: 'Example',
            loading: false,
            faviconUrl: null,
            canGoBack: false,
            canGoForward: false,
            loadError: null,
            createdAt: 2
          }
        ]
      } as never
    })

    expect(resolveAgentBrowserPageId(state, state.browserTabsByWorktree['worktree-1']![0]!)).toBe(
      'blank-page'
    )
  })

  it('consolidates duplicate browser tabs down to one keeper', () => {
    const closeBrowserTab = vi.fn()
    const state = makeState({
      browserTabs: [
        { id: 'keep', activePageId: 'keep-page', pageIds: ['keep-page'] } as never,
        { id: 'drop-a', activePageId: 'drop-a-page', pageIds: ['drop-a-page'] } as never,
        { id: 'drop-b', activePageId: 'drop-b-page', pageIds: ['drop-b-page'] } as never
      ]
    })

    consolidateAgentBrowserTabs({
      worktreeId: 'worktree-1',
      keepTabId: 'keep',
      readState: () => state,
      closeBrowserTab
    })

    expect(closeBrowserTab).toHaveBeenCalledTimes(2)
    expect(closeBrowserTab).toHaveBeenCalledWith('drop-a')
    expect(closeBrowserTab).toHaveBeenCalledWith('drop-b')
  })

  it('selects the newest browser tab assigned to the active group', () => {
    const state = makeState({
      browserTabs: [
        { id: 'browser-a', activePageId: 'page-a', pageIds: ['page-a'] } as never,
        { id: 'browser-b', activePageId: 'page-b', pageIds: ['page-b'] } as never
      ],
      unifiedTabs: [
        {
          id: 'browser-unified-a',
          entityId: 'browser-a',
          groupId: 'group-1',
          contentType: 'browser'
        } as never,
        {
          id: 'browser-unified-b',
          entityId: 'browser-b',
          groupId: 'group-1',
          contentType: 'browser'
        } as never
      ],
      groups: [
        {
          id: 'group-1',
          worktreeId: 'worktree-1',
          activeTabId: 'browser-unified-a',
          tabOrder: ['browser-unified-a', 'browser-unified-b']
        }
      ],
      remoteHandles: {
        'page-a': { environmentId: 'runtime-1', remotePageId: 'remote-a' },
        'page-b': { environmentId: 'runtime-1', remotePageId: 'remote-b' }
      }
    })

    expect(selectNewestAssignedAgentBrowserTab(state, 'worktree-1', 'group-1', true)?.id).toBe(
      'browser-b'
    )
  })

  it('registers orphan browser tabs in the active group without activating them', () => {
    const createUnifiedTab = vi.fn()
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          title: 'Browser',
          activePageId: 'page-a',
          pageIds: ['page-a']
        } as never
      ]
    })

    ensureBrowserUnifiedTabRegistered({
      readState: () => state,
      worktreeId: 'worktree-1',
      browserTabId: 'browser-a',
      targetGroupId: 'group-1',
      activate: false,
      createUnifiedTab
    })

    expect(createUnifiedTab).toHaveBeenCalledWith(
      'worktree-1',
      'browser',
      expect.objectContaining({
        entityId: 'browser-a',
        targetGroupId: 'group-1',
        activate: false
      })
    )
  })

  it('activates an existing browser unified tab when another tab type is still active', () => {
    const activateTab = vi.fn()
    const createUnifiedTab = vi.fn()
    const setActiveBrowserTab = vi.fn()
    const setActiveTabType = vi.fn()
    const state = makeState({
      browserTabs: [
        {
          id: 'browser-a',
          title: 'Browser',
          activePageId: 'page-a',
          pageIds: ['page-a']
        } as never
      ],
      unifiedTabs: [
        {
          id: 'sim-1',
          entityId: 'sim-1',
          groupId: 'group-1',
          contentType: 'simulator'
        } as never,
        {
          id: 'browser-unified-1',
          entityId: 'browser-a',
          groupId: 'group-1',
          contentType: 'browser'
        } as never
      ],
      groups: [
        {
          id: 'group-1',
          worktreeId: 'worktree-1',
          activeTabId: 'sim-1',
          tabOrder: ['sim-1', 'browser-unified-1']
        }
      ]
    })

    ensureBrowserUnifiedTabActive({
      readState: () => state,
      worktreeId: 'worktree-1',
      browserTabId: 'browser-a',
      targetGroupId: 'group-1',
      activateTab,
      createUnifiedTab,
      setActiveBrowserTab,
      setActiveTabType
    })

    expect(activateTab).toHaveBeenCalledWith('browser-unified-1')
    expect(createUnifiedTab).not.toHaveBeenCalled()
    expect(setActiveBrowserTab).toHaveBeenCalledWith('browser-a')
    expect(setActiveTabType).toHaveBeenCalledWith('browser')
  })
})
