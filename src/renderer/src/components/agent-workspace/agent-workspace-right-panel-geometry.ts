const MIN_CONTEXT_CARD_WIDTH = 280
const MAX_CONTEXT_CARD_WIDTH = 380
const CONTEXT_CARD_SURFACE_MARGIN = 32
const MIN_CHAT_SURFACE_WIDTH = 360

export function clampAgentWorkspaceContextCardWidth({
  requestedWidth,
  viewportWidth,
  availableSurfaceWidth
}: {
  requestedWidth: number
  viewportWidth: number
  availableSurfaceWidth: number
}): number {
  const viewportMax = Math.max(MIN_CONTEXT_CARD_WIDTH, viewportWidth - MIN_CHAT_SURFACE_WIDTH)
  const surfaceMax = Math.max(
    MIN_CONTEXT_CARD_WIDTH,
    availableSurfaceWidth - CONTEXT_CARD_SURFACE_MARGIN
  )
  const maxWidth = Math.min(MAX_CONTEXT_CARD_WIDTH, viewportMax, surfaceMax)

  return Math.min(Math.max(requestedWidth, MIN_CONTEXT_CARD_WIDTH), maxWidth)
}
