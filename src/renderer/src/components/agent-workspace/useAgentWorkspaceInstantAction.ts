import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from 'react'

type InstantActionOptions = {
  stopPropagation?: boolean
}

type InstantActionHandlers<T extends HTMLElement> = {
  onPointerDown: (event: ReactPointerEvent<T>) => void
  onClick: (event: ReactMouseEvent<T>) => void
}

export function useAgentWorkspaceInstantAction<T extends HTMLElement>(
  action: (() => void) | undefined,
  options: InstantActionOptions = {}
): InstantActionHandlers<T> {
  const skipClickRef = useRef(false)
  const resetTimerRef = useRef<number | null>(null)
  const stopPropagation = options.stopPropagation === true

  const clearSkipClickTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  const markClickHandledByPointerDown = useCallback(() => {
    skipClickRef.current = true
    clearSkipClickTimer()
    resetTimerRef.current = window.setTimeout(() => {
      skipClickRef.current = false
      resetTimerRef.current = null
    }, 750)
  }, [clearSkipClickTimer])

  useEffect(() => clearSkipClickTimer, [clearSkipClickTimer])

  return {
    onPointerDown: useCallback(
      (event: ReactPointerEvent<T>) => {
        if (
          !action ||
          event.defaultPrevented ||
          event.button !== 0 ||
          (event.pointerType !== 'mouse' && event.pointerType !== 'pen')
        ) {
          return
        }

        if (stopPropagation) {
          event.stopPropagation()
        }

        // Mouse/pen workspace chrome should react on press; keyboard and touch keep native click.
        markClickHandledByPointerDown()
        action()
      },
      [action, markClickHandledByPointerDown, stopPropagation]
    ),
    onClick: useCallback(
      (event: ReactMouseEvent<T>) => {
        if (skipClickRef.current) {
          skipClickRef.current = false
          clearSkipClickTimer()
          if (stopPropagation) {
            event.stopPropagation()
          }
          return
        }

        if (!action) {
          return
        }

        if (stopPropagation) {
          event.stopPropagation()
        }

        action()
      },
      [action, clearSkipClickTimer, stopPropagation]
    )
  }
}
