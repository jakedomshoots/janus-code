const TERMINAL_DRAWER_MIN_HEIGHT = 224
const TERMINAL_DRAWER_MAX_HEIGHT = 768
const TERMINAL_DRAWER_TOP_GUTTER = 120
const TERMINAL_DRAWER_DEFAULT_VIEWPORT_RATIO = 0.46
const TERMINAL_DRAWER_DEFAULT_MAX_HEIGHT = 512

export function getTerminalDrawerMaxHeight(viewportHeight: number): number {
  return Math.max(
    TERMINAL_DRAWER_MIN_HEIGHT,
    Math.min(TERMINAL_DRAWER_MAX_HEIGHT, viewportHeight - TERMINAL_DRAWER_TOP_GUTTER)
  )
}

export function clampTerminalDrawerHeight(height: number, viewportHeight: number): number {
  return Math.min(
    Math.max(height, TERMINAL_DRAWER_MIN_HEIGHT),
    getTerminalDrawerMaxHeight(viewportHeight)
  )
}

export function getDefaultTerminalDrawerHeight(viewportHeight: number): number {
  return clampTerminalDrawerHeight(
    Math.min(
      Math.round(viewportHeight * TERMINAL_DRAWER_DEFAULT_VIEWPORT_RATIO),
      TERMINAL_DRAWER_DEFAULT_MAX_HEIGHT
    ),
    viewportHeight
  )
}

export function getResizedTerminalDrawerHeight({
  startHeight,
  startClientY,
  currentClientY,
  viewportHeight
}: {
  startHeight: number
  startClientY: number
  currentClientY: number
  viewportHeight: number
}): number {
  return clampTerminalDrawerHeight(startHeight + startClientY - currentClientY, viewportHeight)
}
