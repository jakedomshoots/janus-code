export const COMPACT_SIDEBAR_COLLAPSE_WIDTH = 640

export function shouldAutoCollapseSidebarForViewport({
  showSidebar,
  width
}: {
  showSidebar: boolean
  width: number
}): boolean {
  return showSidebar && Number.isFinite(width) && width < COMPACT_SIDEBAR_COLLAPSE_WIDTH
}
