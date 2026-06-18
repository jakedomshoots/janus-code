import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export type TabGroupBodyOverlayRect = {
  top: number
  left: number
  width: number
  height: number
}

function browserSupportsCssAnchorPositioning(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    CSS.supports('position-anchor', '--orca-tab-group-overlay-probe') &&
    CSS.supports('top', 'anchor(--orca-tab-group-overlay-probe top)') &&
    CSS.supports('width', 'anchor-size(--orca-tab-group-overlay-probe width)')
  )
}

// Why: paired web clients disable CSS anchor positioning and measure tab-group
// bodies instead — same fallback TerminalPaneOverlayLayer already uses.
export function shouldUseCssAnchorPositioning(): boolean {
  return (
    browserSupportsCssAnchorPositioning() &&
    (globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__ !== true &&
    findAgentWorkbenchSurface() === null
  )
}

function findAgentWorkbenchSurface(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>('[data-agent-tab-group-workbench-surface="true"]') ??
    document.querySelector<HTMLElement>('[data-agent-browser-workbench-surface="true"]')
  )
}

function findTabGroupBody(groupId: string): HTMLElement | null {
  const agentWorkbenchSurface = findAgentWorkbenchSurface()
  if (agentWorkbenchSurface) {
    return (
      agentWorkbenchSurface.querySelector<HTMLElement>(`[data-tab-group-body-id="${groupId}"]`) ??
      agentWorkbenchSurface
    )
  }
  for (const candidate of document.querySelectorAll<HTMLElement>('[data-tab-group-body-id]')) {
    if (candidate.dataset.tabGroupBodyId === groupId) {
      return candidate
    }
  }
  return null
}

export function useTabGroupBodyOverlayRect(
  groupId: string | undefined,
  shouldMeasure: boolean
): {
  overlayRef: RefObject<HTMLDivElement | null>
  measuredRect: TabGroupBodyOverlayRect | null
} {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [measuredRect, setMeasuredRect] = useState<TabGroupBodyOverlayRect | null>(null)

  useLayoutEffect(() => {
    if (!groupId || shouldUseCssAnchorPositioning() || !shouldMeasure) {
      return
    }

    const updateRect = (): void => {
      const overlay = overlayRef.current
      const parent = overlay?.parentElement
      const body = findTabGroupBody(groupId)
      if (!parent || !body) {
        setMeasuredRect(null)
        return
      }
      const parentRect = parent.getBoundingClientRect()
      const bodyRect = body.getBoundingClientRect()
      // Why: falling back to the overlay-host parent height paints browser and
      // emulator panes full-screen until the agent workbench body measures in.
      if (bodyRect.width <= 0 || bodyRect.height <= 0) {
        setMeasuredRect(null)
        return
      }
      setMeasuredRect({
        top: bodyRect.top - parentRect.top,
        left: bodyRect.left - parentRect.left,
        width: bodyRect.width,
        height: bodyRect.height
      })
    }

    updateRect()
    const body = findTabGroupBody(groupId)
    const parent = overlayRef.current?.parentElement
    const resizeObserver = new ResizeObserver(updateRect)
    if (body) {
      resizeObserver.observe(body)
    }
    if (parent) {
      resizeObserver.observe(parent)
    }
    window.addEventListener('resize', updateRect)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateRect)
    }
  }, [groupId, shouldMeasure])

  return { overlayRef, measuredRect }
}

export function buildTabGroupOverlayStyle(args: {
  anchorName: string | undefined
  isPaintable: boolean
  isActive: boolean
  measuredRect: TabGroupBodyOverlayRect | null
  tabStripHeight?: number
}): CSSProperties {
  const tabStripHeight = args.tabStripHeight ?? 32
  if (args.anchorName && shouldUseCssAnchorPositioning()) {
    return {
      position: 'absolute',
      positionAnchor: args.anchorName,
      top: `anchor(${args.anchorName} top)`,
      left: `anchor(${args.anchorName} left)`,
      width: `anchor-size(${args.anchorName} width)`,
      height: `anchor-size(${args.anchorName} height)`,
      display: args.isPaintable ? 'flex' : 'none',
      pointerEvents: args.isActive ? 'auto' : 'none',
      opacity: args.isActive ? 1 : 0
    }
  }
  if (args.anchorName) {
    const hasMeasuredBody =
      args.measuredRect !== null && args.measuredRect.width > 0 && args.measuredRect.height > 0
    // Why: paired web clients measure the agent workbench body asynchronously;
    // fill the overlay host while waiting so browser chrome is not invisible.
    const useWorkbenchFallback =
      !hasMeasuredBody &&
      args.isPaintable &&
      args.isActive &&
      (globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__ === true &&
      findAgentWorkbenchSurface() !== null
    return {
      position: 'absolute',
      top: hasMeasuredBody ? args.measuredRect!.top : tabStripHeight,
      left: hasMeasuredBody ? args.measuredRect!.left : 0,
      right: useWorkbenchFallback ? 0 : undefined,
      bottom: useWorkbenchFallback ? 0 : undefined,
      width: hasMeasuredBody ? args.measuredRect!.width : useWorkbenchFallback ? undefined : 0,
      height: hasMeasuredBody ? args.measuredRect!.height : useWorkbenchFallback ? undefined : 0,
      display: args.isPaintable && (hasMeasuredBody || useWorkbenchFallback) ? 'flex' : 'none',
      pointerEvents: args.isActive && (hasMeasuredBody || useWorkbenchFallback) ? 'auto' : 'none',
      opacity: args.isActive && (hasMeasuredBody || useWorkbenchFallback) ? 1 : 0
    }
  }
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    display: 'none',
    pointerEvents: 'none'
  }
}
