import { describe, expect, it } from 'vitest'
import {
  COMPACT_SIDEBAR_COLLAPSE_WIDTH,
  shouldAutoCollapseSidebarForViewport
} from './responsive-sidebar-collapse'

describe('shouldAutoCollapseSidebarForViewport', () => {
  it('collapses sidebar-backed views below the compact viewport width', () => {
    expect(
      shouldAutoCollapseSidebarForViewport({
        showSidebar: true,
        width: COMPACT_SIDEBAR_COLLAPSE_WIDTH - 1
      })
    ).toBe(true)
  })

  it('keeps the sidebar state when the active view does not render it', () => {
    expect(
      shouldAutoCollapseSidebarForViewport({
        showSidebar: false,
        width: COMPACT_SIDEBAR_COLLAPSE_WIDTH - 1
      })
    ).toBe(false)
  })

  it('keeps the sidebar state at wider viewports', () => {
    expect(
      shouldAutoCollapseSidebarForViewport({
        showSidebar: true,
        width: COMPACT_SIDEBAR_COLLAPSE_WIDTH
      })
    ).toBe(false)
  })
})
