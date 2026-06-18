import { DndContext, DragOverlay } from '@dnd-kit/core'
import TabGroupPanel from '../tab-group/TabGroupPanel'
import TabDragPreview from '../tab-bar/TabDragPreview'
import { useTabDragSplit } from '../tab-group/useTabDragSplit'
import { useAppStore } from '@/store'
import BrowserPaneOverlayLayer from '../browser-pane/BrowserPaneOverlayLayer'

// Why: browser tabs need both pieces in the agent GUI: TabGroupPanel provides
// the browser body's anchor, and BrowserPaneOverlayLayer paints the persistent
// webview over that anchor. Keeping both inside this surface prevents the
// browser workbench from depending on a hidden terminal/worktree surface.
export function AgentBrowserWorkbenchSurface({
  worktreeId
}: {
  worktreeId: string
}): React.JSX.Element | null {
  const focusedGroupId = useAppStore(
    (state) =>
      state.activeGroupIdByWorktree[worktreeId] ?? state.groupsByWorktree[worktreeId]?.[0]?.id
  )
  const dragSplit = useTabDragSplit({ worktreeId, enabled: true })

  if (!focusedGroupId) {
    return null
  }

  return (
    <div
      className="pointer-events-auto relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
      data-agent-browser-workbench-surface="true"
    >
      <DndContext
        sensors={dragSplit.sensors}
        collisionDetection={dragSplit.collisionDetection}
        onDragStart={dragSplit.onDragStart}
        onDragMove={dragSplit.onDragMove}
        onDragOver={dragSplit.onDragOver}
        onDragEnd={dragSplit.onDragEnd}
        onDragCancel={dragSplit.onDragCancel}
        autoScroll={false}
      >
        <TabGroupPanel
          groupId={focusedGroupId}
          worktreeId={worktreeId}
          agentBrowserWorkbenchMode={true}
          isFocused={true}
          hasSplitGroups={false}
          touchesRightEdge={true}
          touchesLeftEdge={true}
          reserveClosedExplorerToggleSpace={false}
          reserveCollapsedSidebarHeaderSpace={false}
          isTabDragActive={dragSplit.activeDrag !== null}
          activeDropZone={
            dragSplit.hoveredDropTarget?.groupId === focusedGroupId
              ? dragSplit.hoveredDropTarget.zone
              : null
          }
          hoveredTabInsertion={
            dragSplit.hoveredTabInsertion?.groupId === focusedGroupId
              ? dragSplit.hoveredTabInsertion
              : null
          }
        />
        <DragOverlay dropAnimation={null}>
          {dragSplit.activeDrag ? <TabDragPreview drag={dragSplit.activeDrag} /> : null}
        </DragOverlay>
      </DndContext>
      <BrowserPaneOverlayLayer worktreeId={worktreeId} isWorktreeActive={true} />
    </div>
  )
}
