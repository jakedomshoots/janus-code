import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentBrowserWorkbenchSurface } from './AgentBrowserWorkbenchSurface'
import type { TabGroup } from '../../../../shared/types'

type MockAppState = {
  activeGroupIdByWorktree: Record<string, string | undefined>
  groupsByWorktree: Record<string, readonly TabGroup[]>
}

const mocks = vi.hoisted(() => ({
  state: null as MockAppState | null
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: MockAppState) => unknown) => {
    if (!mocks.state) {
      throw new Error('mock app state not initialized')
    }
    return selector(mocks.state)
  }
}))

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('../tab-group/useTabDragSplit', () => ({
  useTabDragSplit: () => ({
    activeDrag: null,
    collisionDetection: vi.fn(),
    hoveredDropTarget: null,
    hoveredTabInsertion: null,
    onDragCancel: vi.fn(),
    onDragEnd: vi.fn(),
    onDragMove: vi.fn(),
    onDragOver: vi.fn(),
    onDragStart: vi.fn(),
    sensors: []
  })
}))

vi.mock('../tab-group/TabGroupPanel', () => ({
  default: ({ groupId, worktreeId }: { groupId: string; worktreeId: string }) => (
    <div data-tab-group-panel-id={groupId} data-worktree-id={worktreeId}>
      <div data-tab-group-body-id={groupId} />
    </div>
  )
}))

vi.mock('../browser-pane/BrowserPaneOverlayLayer', () => ({
  default: ({
    worktreeId,
    isWorktreeActive
  }: {
    worktreeId: string
    isWorktreeActive: boolean
  }) => (
    <div
      data-browser-overlay-layer-worktree-id={worktreeId}
      data-browser-overlay-layer-active={isWorktreeActive ? 'true' : 'false'}
    />
  )
}))

vi.mock('../tab-bar/TabDragPreview', () => ({
  default: () => <div data-tab-drag-preview="true" />
}))

describe('AgentBrowserWorkbenchSurface', () => {
  beforeEach(() => {
    mocks.state = {
      activeGroupIdByWorktree: { 'wt-1': 'group-1' },
      groupsByWorktree: { 'wt-1': [createGroup('group-1')] }
    }
  })

  it('mounts the browser overlay layer inside the agent browser surface', () => {
    const markup = renderToStaticMarkup(<AgentBrowserWorkbenchSurface worktreeId="wt-1" />)

    expect(markup).toContain('data-agent-browser-workbench-surface="true"')
    expect(markup).toContain('data-tab-group-panel-id="group-1"')
    expect(markup).toContain('data-browser-overlay-layer-worktree-id="wt-1"')
    expect(markup).toContain('data-browser-overlay-layer-active="true"')
  })

  it('falls back to the first worktree group when no group is focused', () => {
    mocks.state = {
      activeGroupIdByWorktree: {},
      groupsByWorktree: { 'wt-1': [createGroup('group-fallback')] }
    }

    const markup = renderToStaticMarkup(<AgentBrowserWorkbenchSurface worktreeId="wt-1" />)

    expect(markup).toContain('data-tab-group-panel-id="group-fallback"')
    expect(markup).toContain('data-browser-overlay-layer-worktree-id="wt-1"')
  })

  it('does not mount browser chrome when the worktree has no tab group', () => {
    mocks.state = {
      activeGroupIdByWorktree: {},
      groupsByWorktree: { 'wt-1': [] }
    }

    const markup = renderToStaticMarkup(<AgentBrowserWorkbenchSurface worktreeId="wt-1" />)

    expect(markup).toBe('')
  })
})

function createGroup(id: string): TabGroup {
  return {
    id,
    worktreeId: 'wt-1',
    activeTabId: null,
    tabOrder: []
  }
}
