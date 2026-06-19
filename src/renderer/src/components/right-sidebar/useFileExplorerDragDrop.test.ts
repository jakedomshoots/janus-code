// @vitest-environment happy-dom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDragEdgeScrollTarget, useFileExplorerDragDrop } from './useFileExplorerDragDrop'

const mocks = vi.hoisted(() => ({
  getConnectionId: vi.fn(),
  getRightSidebarWorktreeRuntimeSettings: vi.fn(),
  renameRuntimePath: vi.fn(),
  requestEditorSaveQuiesce: vi.fn(),
  commitFileExplorerOp: vi.fn(),
  refreshDir: vi.fn()
}))

vi.mock('@/lib/connection-context', () => ({
  getConnectionId: mocks.getConnectionId
}))

vi.mock('./file-explorer-runtime-owner', () => ({
  getRightSidebarWorktreeRuntimeSettings: mocks.getRightSidebarWorktreeRuntimeSettings
}))

vi.mock('@/runtime/runtime-file-client', () => ({
  renameRuntimePath: mocks.renameRuntimePath
}))

vi.mock('@/components/editor/editor-autosave', () => ({
  requestEditorSaveQuiesce: mocks.requestEditorSaveQuiesce
}))

vi.mock('./fileExplorerUndoRedo', () => ({
  commitFileExplorerOp: mocks.commitFileExplorerOp
}))

vi.mock('@/lib/remap-open-editor-tabs-for-path-change', () => ({
  remapOpenEditorTabsForPathChange: vi.fn()
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: { openFiles: never[] }) => unknown) => selector({ openFiles: [] })
}))

let latestDragDrop: ReturnType<typeof useFileExplorerDragDrop> | null = null

function DragDropProbe(): null {
  latestDragDrop = useFileExplorerDragDrop({
    worktreePath: '/home/jake/janus-code',
    activeWorktreeId: 'id:repo-1::/home/jake/janus-code',
    expanded: new Set(),
    toggleDir: vi.fn(),
    refreshDir: mocks.refreshDir,
    scrollRef: { current: null }
  })
  return null
}

describe('getDragEdgeScrollTarget', () => {
  it('returns null away from the drag edge zones', () => {
    expect(
      getDragEdgeScrollTarget({
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 200,
        localY: 100
      })
    ).toBeNull()
  })

  it('scrolls down near the bottom edge', () => {
    const next = getDragEdgeScrollTarget({
      scrollTop: 100,
      scrollHeight: 1000,
      clientHeight: 200,
      localY: 190
    })

    expect(next).toBeGreaterThan(100)
  })

  it('scrolls up near the top edge', () => {
    const next = getDragEdgeScrollTarget({
      scrollTop: 100,
      scrollHeight: 1000,
      clientHeight: 200,
      localY: 10
    })

    expect(next).toBeLessThan(100)
  })

  it('stops at the bottom instead of scheduling a no-op frame forever', () => {
    expect(
      getDragEdgeScrollTarget({
        scrollTop: 800,
        scrollHeight: 1000,
        clientHeight: 200,
        localY: 190
      })
    ).toBeNull()
  })

  it('stops at the top instead of scheduling a no-op frame forever', () => {
    expect(
      getDragEdgeScrollTarget({
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 200,
        localY: 10
      })
    ).toBeNull()
  })
})

describe('useFileExplorerDragDrop', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    latestDragDrop = null
    mocks.getConnectionId.mockReset()
    mocks.getRightSidebarWorktreeRuntimeSettings.mockReset()
    mocks.renameRuntimePath.mockReset()
    mocks.requestEditorSaveQuiesce.mockReset()
    mocks.commitFileExplorerOp.mockReset()
    mocks.refreshDir.mockReset()
    mocks.getConnectionId.mockReturnValue('ssh-1')
    mocks.getRightSidebarWorktreeRuntimeSettings.mockReturnValue({
      activeRuntimeEnvironmentId: null
    })
    mocks.renameRuntimePath.mockResolvedValue(undefined)
    mocks.requestEditorSaveQuiesce.mockResolvedValue(undefined)
    mocks.refreshDir.mockResolvedValue(undefined)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('moves files through the selected SSH worktree context', async () => {
    await act(async () => {
      root.render(createElement(DragDropProbe))
    })

    await act(async () => {
      latestDragDrop?.handleMoveDrop(
        '/home/jake/janus-code/src/app.ts',
        '/home/jake/janus-code/lib'
      )
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mocks.getConnectionId).toHaveBeenCalledWith('id:repo-1::/home/jake/janus-code')
    expect(mocks.getRightSidebarWorktreeRuntimeSettings).toHaveBeenCalledWith(
      'id:repo-1::/home/jake/janus-code'
    )
    expect(mocks.renameRuntimePath).toHaveBeenCalledWith(
      {
        settings: { activeRuntimeEnvironmentId: null },
        worktreeId: 'id:repo-1::/home/jake/janus-code',
        worktreePath: '/home/jake/janus-code',
        connectionId: 'ssh-1'
      },
      '/home/jake/janus-code/src/app.ts',
      '/home/jake/janus-code/lib/app.ts'
    )
  })
})
