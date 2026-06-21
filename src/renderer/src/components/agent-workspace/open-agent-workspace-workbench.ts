import type { Tab } from '../../../../shared/types'

const WORKBENCH_SURFACE_CONTENT_TYPES = new Set<Tab['contentType']>([
  'simulator',
  'editor',
  'diff',
  'conflict-review'
])

export function openAgentWorkspaceWorkbenchSurface({
  groupTabs,
  newFileTab,
  onOpenWorkbench
}: {
  groupTabs: readonly Tab[]
  newFileTab: () => void | Promise<void>
  onOpenWorkbench?: () => void
}): void {
  const hasWorkbenchTab = groupTabs.some((tab) =>
    WORKBENCH_SURFACE_CONTENT_TYPES.has(tab.contentType)
  )
  if (hasWorkbenchTab) {
    onOpenWorkbench?.()
    return
  }

  // Why: workbench mode hides terminal/browser tabs; create a real editor tab
  // first so the toolbar never opens to a blank surface.
  void (async () => {
    try {
      await newFileTab()
    } catch (error) {
      console.error('Failed to create workbench file tab before opening workbench surface', error)
    } finally {
      onOpenWorkbench?.()
    }
  })()
}
