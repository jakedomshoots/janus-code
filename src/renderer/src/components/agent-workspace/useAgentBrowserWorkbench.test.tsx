// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import { useAgentBrowserWorkbench } from './useAgentBrowserWorkbench'

const createWebRuntimeSessionBrowserTabMock = vi.hoisted(() => vi.fn())

vi.mock('@/runtime/web-runtime-session', () => ({
  createWebRuntimeSessionBrowserTab: createWebRuntimeSessionBrowserTabMock,
  isWebRuntimeSessionActive: (environmentId: string | null | undefined) =>
    Boolean(environmentId?.trim())
}))

const storeMocks = vi.hoisted(() => {
  const createBrowserTab = vi.fn(() => ({
    id: 'browser-tab-1',
    worktreeId: 'worktree-1',
    activePageId: 'browser-page-1',
    pageIds: ['browser-page-1'],
    url: 'data:text/html,',
    title: 'New Browser Tab',
    loading: false,
    faviconUrl: null,
    canGoBack: false,
    canGoForward: false,
    loadError: null,
    createdAt: 1
  }))
  const focusBrowserTabInWorktree = vi.fn()
  const closeBrowserTab = vi.fn()
  const createUnifiedTab = vi.fn()
  const activateTab = vi.fn()
  const setActiveBrowserTab = vi.fn()
  const setActiveTabType = vi.fn()
  const ensureWorktreeRootGroup = vi.fn()
  const openNewBrowserTabInActiveWorkspace = vi.fn(async () => undefined)
  const state = {
    browserDefaultUrl: 'data:text/html,',
    settings: { activeRuntimeEnvironmentId: 'runtime-1' },
    repos: [],
    worktreesByRepo: {},
    browserTabsByWorktree: {} as Record<string, unknown[]>,
    activeBrowserTabIdByWorktree: {} as Record<string, string | null>,
    browserAnnotationsByPageId: {},
    unifiedTabsByWorktree: {} as Record<string, unknown[]>,
    remoteBrowserPageHandlesByPageId: {} as Record<string, unknown>,
    activeGroupIdByWorktree: { 'worktree-1': 'group-1' } as Record<string, string>,
    groupsByWorktree: { 'worktree-1': [{ id: 'group-1', activeTabId: null, tabOrder: [] }] },
    createBrowserTab,
    focusBrowserTabInWorktree,
    closeBrowserTab,
    createUnifiedTab,
    activateTab,
    setActiveBrowserTab,
    setActiveTabType,
    openNewBrowserTabInActiveWorkspace,
    ensureWorktreeRootGroup
  }

  return {
    state,
    createBrowserTab,
    focusBrowserTabInWorktree,
    closeBrowserTab,
    createUnifiedTab,
    activateTab,
    setActiveBrowserTab,
    setActiveTabType,
    openNewBrowserTabInActiveWorkspace,
    ensureWorktreeRootGroup
  }
})

vi.mock('@/store', () => ({
  useAppStore: Object.assign(
    (selector: (state: typeof storeMocks.state) => unknown) => selector(storeMocks.state),
    { getState: () => storeMocks.state }
  )
}))

function BrowserWorkbenchButton({
  onOpenTerminalDrawer
}: {
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
}): React.JSX.Element {
  const workbench = useAgentBrowserWorkbench({
    activeWorktreeId: 'worktree-1',
    onOpenTerminalDrawer
  })
  return (
    <button type="button" onClick={() => workbench.openBrowserWorkbench()}>
      Open browser workbench
    </button>
  )
}

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
} {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })
  return { promise, resolve, reject }
}

describe('useAgentBrowserWorkbench', () => {
  let root: Root | null = null

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.replaceChildren()
  })

  beforeEach(() => {
    createWebRuntimeSessionBrowserTabMock.mockReset()
    storeMocks.createBrowserTab.mockClear()
    storeMocks.focusBrowserTabInWorktree.mockClear()
    storeMocks.closeBrowserTab.mockClear()
    storeMocks.createUnifiedTab.mockClear()
    storeMocks.activateTab.mockClear()
    storeMocks.setActiveBrowserTab.mockClear()
    storeMocks.setActiveTabType.mockClear()
    storeMocks.ensureWorktreeRootGroup.mockClear()
    storeMocks.openNewBrowserTabInActiveWorkspace.mockClear()
    storeMocks.state.browserTabsByWorktree = {}
    storeMocks.state.activeBrowserTabIdByWorktree = {}
    storeMocks.state.unifiedTabsByWorktree = {}
    storeMocks.state.remoteBrowserPageHandlesByPageId = {}
    storeMocks.state.settings = { activeRuntimeEnvironmentId: 'runtime-1' }
  })

  it('creates a host-owned browser tab for paired web runtimes', async () => {
    createWebRuntimeSessionBrowserTabMock.mockImplementation(async () => {
      storeMocks.state.browserTabsByWorktree = {
        'worktree-1': [
          {
            id: 'browser-tab-1',
            worktreeId: 'worktree-1',
            activePageId: 'browser-page-1',
            pageIds: ['browser-page-1']
          }
        ]
      }
      storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
      storeMocks.state.unifiedTabsByWorktree = {
        'worktree-1': [
          {
            id: 'unified-1',
            entityId: 'browser-tab-1',
            groupId: 'group-1',
            contentType: 'browser'
          }
        ]
      }
      storeMocks.state.remoteBrowserPageHandlesByPageId = {
        'browser-page-1': { environmentId: 'runtime-1', remotePageId: 'remote-1' }
      }
      return true
    })
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton onOpenTerminalDrawer={onOpenTerminalDrawer} />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.ensureWorktreeRootGroup).toHaveBeenCalledWith('worktree-1')
    expect(createWebRuntimeSessionBrowserTabMock).toHaveBeenCalledWith({
      worktreeId: 'worktree-1',
      environmentId: 'runtime-1',
      url: 'data:text/html,',
      targetGroupId: 'group-1'
    })
    expect(storeMocks.createBrowserTab).not.toHaveBeenCalled()
    expect(storeMocks.focusBrowserTabInWorktree).toHaveBeenCalledWith(
      'worktree-1',
      'browser-page-1',
      { surfacePane: true }
    )
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })

  it('still provisions and activates browser state when no drawer callback is registered', async () => {
    storeMocks.state.settings = { activeRuntimeEnvironmentId: '' }
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.ensureWorktreeRootGroup).toHaveBeenCalledWith('worktree-1')
    expect(storeMocks.createBrowserTab).toHaveBeenCalledWith(
      'worktree-1',
      'data:text/html,',
      expect.objectContaining({
        activate: true,
        focusAddressBar: true,
        targetGroupId: 'group-1'
      })
    )
    expect(storeMocks.focusBrowserTabInWorktree).toHaveBeenCalledWith(
      'worktree-1',
      'browser-page-1',
      { surfacePane: true }
    )
  })

  it('opens the browser workbench immediately while paired host tab creation is pending', async () => {
    const pendingHostCreation = deferred<boolean>()
    createWebRuntimeSessionBrowserTabMock.mockReturnValue(pendingHostCreation.promise)
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton onOpenTerminalDrawer={onOpenTerminalDrawer} />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
    expect(storeMocks.focusBrowserTabInWorktree).not.toHaveBeenCalled()

    pendingHostCreation.resolve(false)
    await act(async () => {
      await pendingHostCreation.promise
    })
  })

  it('keeps the drawer open when host creation fails on paired web runtimes', async () => {
    createWebRuntimeSessionBrowserTabMock.mockResolvedValue(false)
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton onOpenTerminalDrawer={onOpenTerminalDrawer} />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(createWebRuntimeSessionBrowserTabMock).toHaveBeenCalled()
    expect(storeMocks.createBrowserTab).not.toHaveBeenCalled()
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })

  it('reprovisions stale local-only browser tabs before opening the workbench', async () => {
    storeMocks.state.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'stale-browser-tab',
          worktreeId: 'worktree-1',
          activePageId: 'stale-browser-page',
          pageIds: ['stale-browser-page'],
          title: 'Stale tab'
        }
      ]
    }
    storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'stale-browser-tab' }
    createWebRuntimeSessionBrowserTabMock.mockImplementation(async () => {
      storeMocks.state.browserTabsByWorktree = {
        'worktree-1': [
          {
            id: 'browser-tab-1',
            worktreeId: 'worktree-1',
            activePageId: 'browser-page-1',
            pageIds: ['browser-page-1']
          }
        ]
      }
      storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
      storeMocks.state.unifiedTabsByWorktree = {
        'worktree-1': [
          {
            id: 'unified-1',
            entityId: 'browser-tab-1',
            groupId: 'group-1',
            contentType: 'browser'
          }
        ]
      }
      storeMocks.state.remoteBrowserPageHandlesByPageId = {
        'browser-page-1': { environmentId: 'runtime-1', remotePageId: 'remote-1' }
      }
      return true
    })
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton onOpenTerminalDrawer={onOpenTerminalDrawer} />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.closeBrowserTab).toHaveBeenCalledWith('stale-browser-tab')
    expect(createWebRuntimeSessionBrowserTabMock).toHaveBeenCalled()
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })

  it('creates a new browser tab when the workbench is already open and createNewTab is set', async () => {
    storeMocks.state.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          title: 'Live tab'
        },
        {
          id: 'browser-tab-2',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-2',
          pageIds: ['browser-page-2'],
          title: 'Second tab'
        }
      ]
    }
    storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-2' }
    storeMocks.state.remoteBrowserPageHandlesByPageId = {
      'browser-page-2': { environmentId: 'runtime-1', remotePageId: 'remote-2' }
    }
    storeMocks.state.unifiedTabsByWorktree = {
      'worktree-1': [
        {
          id: 'unified-2',
          entityId: 'browser-tab-2',
          groupId: 'group-1',
          contentType: 'browser'
        }
      ]
    }
    storeMocks.openNewBrowserTabInActiveWorkspace.mockImplementation(async () => {
      storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-2' }
    })
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    function OpenNewBrowserTabButton(): React.JSX.Element {
      const workbench = useAgentBrowserWorkbench({
        activeWorktreeId: 'worktree-1',
        browserWorkbenchActive: true,
        onOpenTerminalDrawer
      })
      return (
        <button
          type="button"
          onClick={() => workbench.openBrowserWorkbench({ createNewTab: true })}
        >
          New browser tab
        </button>
      )
    }

    await act(async () => {
      root?.render(<OpenNewBrowserTabButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.openNewBrowserTabInActiveWorkspace).toHaveBeenCalledWith('group-1', {
      activate: true,
      worktreeId: 'worktree-1'
    })
    expect(createWebRuntimeSessionBrowserTabMock).not.toHaveBeenCalled()
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })

  it('creates and focuses a browser tab from the agent session', async () => {
    storeMocks.openNewBrowserTabInActiveWorkspace.mockImplementation(async () => {
      storeMocks.state.browserTabsByWorktree = {
        'worktree-1': [
          {
            id: 'browser-tab-1',
            worktreeId: 'worktree-1',
            activePageId: 'browser-page-1',
            pageIds: ['browser-page-1'],
            title: 'New Tab'
          }
        ]
      }
      storeMocks.state.unifiedTabsByWorktree = {
        'worktree-1': [
          {
            id: 'unified-1',
            entityId: 'browser-tab-1',
            groupId: 'group-1',
            contentType: 'browser'
          }
        ]
      }
      storeMocks.state.remoteBrowserPageHandlesByPageId = {
        'browser-page-1': { environmentId: 'runtime-1', remotePageId: 'remote-1' }
      }
    })
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    function OpenBackgroundBrowserTabButton(): React.JSX.Element {
      const workbench = useAgentBrowserWorkbench({
        activeWorktreeId: 'worktree-1',
        browserWorkbenchActive: false,
        onOpenTerminalDrawer
      })
      return (
        <button
          type="button"
          onClick={() => workbench.openBrowserWorkbench({ createNewTab: true })}
        >
          New browser tab
        </button>
      )
    }

    await act(async () => {
      root?.render(<OpenBackgroundBrowserTabButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.openNewBrowserTabInActiveWorkspace).toHaveBeenCalledWith('group-1', {
      activate: true,
      worktreeId: 'worktree-1'
    })
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
    expect(storeMocks.focusBrowserTabInWorktree).toHaveBeenCalledWith(
      'worktree-1',
      'browser-page-1',
      { surfacePane: true }
    )
  })

  it('does not create another browser tab when the workbench is already open', async () => {
    storeMocks.state.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'browser-tab-1',
          worktreeId: 'worktree-1',
          activePageId: 'browser-page-1',
          pageIds: ['browser-page-1'],
          title: 'Live tab'
        }
      ]
    }
    storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'browser-tab-1' }
    storeMocks.state.remoteBrowserPageHandlesByPageId = {
      'browser-page-1': { environmentId: 'runtime-1', remotePageId: 'remote-1' }
    }
    storeMocks.state.unifiedTabsByWorktree = {
      'worktree-1': [
        {
          id: 'unified-1',
          entityId: 'browser-tab-1',
          groupId: 'group-1',
          contentType: 'browser'
        }
      ]
    }
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    function OpenBrowserWorkbenchButton(): React.JSX.Element {
      const workbench = useAgentBrowserWorkbench({
        activeWorktreeId: 'worktree-1',
        browserWorkbenchActive: true,
        onOpenTerminalDrawer
      })
      return (
        <button type="button" onClick={() => workbench.openBrowserWorkbench()}>
          Open browser workbench
        </button>
      )
    }

    await act(async () => {
      root?.render(<OpenBrowserWorkbenchButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(createWebRuntimeSessionBrowserTabMock).not.toHaveBeenCalled()
    expect(storeMocks.createBrowserTab).not.toHaveBeenCalled()
    expect(onOpenTerminalDrawer).not.toHaveBeenCalled()
    expect(storeMocks.focusBrowserTabInWorktree).toHaveBeenCalledWith(
      'worktree-1',
      'browser-page-1',
      { surfacePane: true }
    )
  })

  it('assigns orphan browser tabs to the active tab group', async () => {
    storeMocks.state.browserTabsByWorktree = {
      'worktree-1': [
        {
          id: 'orphan-browser-tab',
          worktreeId: 'worktree-1',
          activePageId: 'orphan-browser-page',
          pageIds: ['orphan-browser-page'],
          title: 'Orphan tab'
        }
      ]
    }
    storeMocks.state.activeBrowserTabIdByWorktree = { 'worktree-1': 'orphan-browser-tab' }
    storeMocks.state.remoteBrowserPageHandlesByPageId = {
      'orphan-browser-page': { environmentId: 'runtime-1', remotePageId: 'remote-1' }
    }
    const onOpenTerminalDrawer = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(<BrowserWorkbenchButton onOpenTerminalDrawer={onOpenTerminalDrawer} />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(storeMocks.createUnifiedTab).toHaveBeenCalledWith('worktree-1', 'browser', {
      entityId: 'orphan-browser-tab',
      label: 'Orphan tab',
      targetGroupId: 'group-1',
      activate: true,
      insertAfterActiveTab: true
    })
    expect(createWebRuntimeSessionBrowserTabMock).not.toHaveBeenCalled()
    expect(onOpenTerminalDrawer).toHaveBeenCalledWith('browser')
  })
})
