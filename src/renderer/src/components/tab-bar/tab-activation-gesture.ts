const TAB_ACTIVATION_DRAG_THRESHOLD_PX = 4

type TabActivationPointerEvent = {
  button?: number
  clientX: number
  clientY: number
  pointerId: number
}

export type TabActivationGesture = {
  pointerId: number | null
  startX: number
  startY: number
  dragged: boolean
}

export function createTabActivationGesture(): TabActivationGesture {
  return {
    pointerId: null,
    startX: 0,
    startY: 0,
    dragged: false
  }
}

export function beginTabActivationGesture(
  gesture: TabActivationGesture,
  event: TabActivationPointerEvent
): void {
  if (event.button !== 0) {
    return
  }
  gesture.pointerId = event.pointerId
  gesture.startX = event.clientX
  gesture.startY = event.clientY
  gesture.dragged = false
}

export function updateTabActivationGesture(
  gesture: TabActivationGesture,
  event: TabActivationPointerEvent
): void {
  if (gesture.pointerId !== event.pointerId) {
    return
  }
  const deltaX = Math.abs(event.clientX - gesture.startX)
  const deltaY = Math.abs(event.clientY - gesture.startY)
  if (deltaX > TAB_ACTIVATION_DRAG_THRESHOLD_PX || deltaY > TAB_ACTIVATION_DRAG_THRESHOLD_PX) {
    gesture.dragged = true
  }
}

export function finishTabActivationGesture(
  gesture: TabActivationGesture,
  event: TabActivationPointerEvent
): boolean {
  if (gesture.pointerId !== event.pointerId) {
    return false
  }
  updateTabActivationGesture(gesture, event)
  const shouldActivate = !gesture.dragged
  cancelTabActivationGesture(gesture)
  return shouldActivate
}

export function cancelTabActivationGesture(gesture: TabActivationGesture): void {
  gesture.pointerId = null
  gesture.startX = 0
  gesture.startY = 0
  gesture.dragged = false
}
