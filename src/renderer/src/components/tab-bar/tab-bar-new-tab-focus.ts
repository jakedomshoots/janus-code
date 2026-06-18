import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
import { focusTerminalTabSurface } from '@/lib/focus-terminal-tab-surface'

const NEW_TAB_MENU_TERMINAL_FOCUS_RETRY_MS = 50
const NEW_TAB_MENU_TERMINAL_FOCUS_TIMEOUT_MS = 5000

export function useTabBarNewTabFocus(): {
  queueNewActiveTerminalFocusAfterNewTabMenuClose: () => void
  queueTerminalTabFocusAfterNewTabMenuClose: (tabId: string) => void
  runPendingNewTabMenuFocusAfterClose: () => void
} {
  const pendingNewTabMenuFocusRef = useRef<(() => void) | null>(null)
  const pendingNewTabMenuFocusAnimationRef = useRef<number | null>(null)
  const pendingNewTabMenuFocusRetryRef = useRef<number | null>(null)

  const clearPendingNewTabMenuFocusAnimation = (): void => {
    if (pendingNewTabMenuFocusAnimationRef.current === null) {
      return
    }
    cancelAnimationFrame(pendingNewTabMenuFocusAnimationRef.current)
    pendingNewTabMenuFocusAnimationRef.current = null
  }
  const clearPendingNewTabMenuFocusRetry = (): void => {
    if (pendingNewTabMenuFocusRetryRef.current === null) {
      return
    }
    window.clearTimeout(pendingNewTabMenuFocusRetryRef.current)
    pendingNewTabMenuFocusRetryRef.current = null
  }
  const focusNewActiveTerminalWhenReady = (
    previousActiveTabId: string | null,
    expiresAt: number
  ): void => {
    const state = useAppStore.getState()
    if (
      (state.activeTabType === 'terminal' || state.activeTabType === 'simulator') &&
      state.activeTabId &&
      state.activeTabId !== previousActiveTabId
    ) {
      focusTerminalTabSurface(state.activeTabId)
      return
    }
    if (Date.now() >= expiresAt) {
      return
    }
    pendingNewTabMenuFocusRetryRef.current = window.setTimeout(() => {
      pendingNewTabMenuFocusRetryRef.current = null
      focusNewActiveTerminalWhenReady(previousActiveTabId, expiresAt)
    }, NEW_TAB_MENU_TERMINAL_FOCUS_RETRY_MS)
  }

  useEffect(
    () => () => {
      clearPendingNewTabMenuFocusAnimation()
      clearPendingNewTabMenuFocusRetry()
    },
    []
  )

  return {
    queueNewActiveTerminalFocusAfterNewTabMenuClose: () => {
      const previousActiveTabId = useAppStore.getState().activeTabId
      pendingNewTabMenuFocusRef.current = () => {
        focusNewActiveTerminalWhenReady(
          previousActiveTabId,
          Date.now() + NEW_TAB_MENU_TERMINAL_FOCUS_TIMEOUT_MS
        )
      }
    },
    queueTerminalTabFocusAfterNewTabMenuClose: (tabId) => {
      pendingNewTabMenuFocusRef.current = () => focusTerminalTabSurface(tabId)
    },
    runPendingNewTabMenuFocusAfterClose: () => {
      const pendingFocus = pendingNewTabMenuFocusRef.current
      pendingNewTabMenuFocusRef.current = null
      clearPendingNewTabMenuFocusAnimation()
      clearPendingNewTabMenuFocusRetry()
      if (pendingFocus) {
        pendingNewTabMenuFocusAnimationRef.current = requestAnimationFrame(() => {
          pendingNewTabMenuFocusAnimationRef.current = null
          pendingFocus()
        })
      }
    }
  }
}
