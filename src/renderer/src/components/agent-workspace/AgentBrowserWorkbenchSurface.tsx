import { DndContext, DragOverlay } from '@dnd-kit/core'
import TabGroupPanel from '../tab-group/TabGroupPanel'
import TabDragPreview from '../tab-bar/TabDragPreview'
import { useTabDragSplit } from '../tab-group/useTabDragSplit'
import { useAppStore } from '@/store'

// Why: browser tabs render via worktree-level BrowserPaneOverlayLayer, which
// anchors to TabGroupPanel body elements. In GUI agent mode the body must live
// over the chat pane instead of the bottom terminal drawer.
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
      className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
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
    </div>
  )
}
