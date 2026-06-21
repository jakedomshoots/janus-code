import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { cn } from '@/lib/utils'
import {
  clampTerminalDrawerHeight,
  getDefaultTerminalDrawerHeight,
  getResizedTerminalDrawerHeight
} from './agent-terminal-drawer-resize'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

type ResizeSession = {
  readonly startClientY: number
  readonly startHeight: number
}

function getViewportHeight(): number {
  return typeof window === 'undefined' ? 720 : window.innerHeight
}

export function AgentTerminalDrawer({
  open,
  reason,
  onClose,
  children
}: {
  open: boolean
  reason: AgentTerminalRevealReason | null
  terminalAvailable: boolean
  onClose: () => void
  children: ReactNode
}): React.JSX.Element {
  const [height, setHeight] = useState(() => getDefaultTerminalDrawerHeight(getViewportHeight()))
  const resizeSessionRef = useRef<ResizeSession | null>(null)
  const isBrowserWorkbench = reason === 'browser'
  const title = isBrowserWorkbench
    ? translate('auto.components.agentWorkspace.layout.browserWorkbench', 'Browser workbench')
    : translate('auto.components.agentWorkspace.layout.terminalDrawer', 'Terminal drawer')
  const closeLabel = isBrowserWorkbench
    ? translate(
        'auto.components.agentWorkspace.layout.closeBrowserWorkbench',
        'Close browser workbench'
      )
    : translate(
        'auto.components.agentWorkspace.layout.closeTerminalDrawer',
        'Close terminal drawer'
      )
  const resizeLabel = translate(
    'auto.components.agentWorkspace.layout.resizeTerminalDrawer',
    'Resize terminal drawer'
  )

  const stopResize = useCallback((): void => {
    resizeSessionRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handleResizeMove = useCallback((event: PointerEvent): void => {
    const session = resizeSessionRef.current
    if (!session) {
      return
    }
    setHeight(
      getResizedTerminalDrawerHeight({
        startHeight: session.startHeight,
        startClientY: session.startClientY,
        currentClientY: event.clientY,
        viewportHeight: getViewportHeight()
      })
    )
  }, [])

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>): void => {
      event.preventDefault()
      resizeSessionRef.current = {
        startClientY: event.clientY,
        startHeight: height
      }
      // Why: drawer resize is bottom-anchored, so global pointer tracking keeps
      // the drag stable even when the cursor leaves the slim handle.
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    },
    [height]
  )

  const handleResizeKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const step = event.shiftKey ? 64 : 24
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHeight((currentHeight) =>
        clampTerminalDrawerHeight(currentHeight + step, getViewportHeight())
      )
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHeight((currentHeight) =>
        clampTerminalDrawerHeight(currentHeight - step, getViewportHeight())
      )
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setHeight(clampTerminalDrawerHeight(0, getViewportHeight()))
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setHeight(clampTerminalDrawerHeight(Number.POSITIVE_INFINITY, getViewportHeight()))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', handleResizeMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
    window.addEventListener('blur', stopResize)
    return () => {
      window.removeEventListener('pointermove', handleResizeMove)
      window.removeEventListener('pointerup', stopResize)
      window.removeEventListener('pointercancel', stopResize)
      window.removeEventListener('blur', stopResize)
      stopResize()
    }
  }, [handleResizeMove, stopResize])

  useEffect(() => {
    const handleWindowResize = (): void => {
      setHeight((currentHeight) => clampTerminalDrawerHeight(currentHeight, getViewportHeight()))
    }
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  return (
    <aside
      data-agent-terminal-drawer="true"
      data-state={open ? 'open' : 'closed'}
      aria-label={title}
      aria-hidden={!open}
      style={{ height }}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex min-h-56 flex-col border-t border-border bg-background shadow-2xl transition-[opacity,transform] duration-200',
        open
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[calc(100%+1rem)] opacity-0'
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute left-1/2 top-0 z-10 h-3 w-24 -translate-x-1/2 cursor-ns-resize rounded-b-md rounded-t-none border-x border-b border-border bg-muted/70 p-0 text-muted-foreground hover:bg-accent"
        onPointerDown={startResize}
        onKeyDown={handleResizeKeyDown}
        aria-label={resizeLabel}
      >
        <span className="h-0.5 w-8 rounded-full bg-current opacity-70" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-3 top-2 z-10 rounded-full bg-background/80 shadow-xs backdrop-blur hover:bg-accent"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
      {/* Why: TerminalWorkspace sizes itself with flex-1/min-h-0 — the drawer
          body must be a flex column or the preserved workbench collapses to 0px. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </aside>
  )
}
