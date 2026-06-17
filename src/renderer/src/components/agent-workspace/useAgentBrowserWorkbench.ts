import { useMemo } from 'react'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'
import { ORCA_BROWSER_BLANK_URL } from '../../../../shared/constants'
import type { BrowserWorkspace } from '../../../../shared/types'
import type { BrowserPageAnnotation } from '../../../../shared/browser-grab-types'
import { formatBrowserAnnotationsAsMarkdown } from '../browser-pane/browser-annotation-output'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'

const EMPTY_BROWSER_TABS: readonly BrowserWorkspace[] = []
const EMPTY_BROWSER_ANNOTATIONS: readonly BrowserPageAnnotation[] = []

export type AgentBrowserWorkbenchState = {
  readonly browserWorkbenchReady: boolean
  readonly canOpenBrowserDrawer: boolean
  readonly browserAvailable: boolean
  readonly browserTabCount: number
  readonly browserAnnotationCount: number
  readonly browserAnnotationMarkdown: string
  readonly canAttachBrowserContext: boolean
  readonly openBrowserWorkbench: () => void
}

export function useAgentBrowserWorkbench({
  activeWorktreeId,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason) => void
}): AgentBrowserWorkbenchState {
  const browserTabs = useAppStore((state) =>
    activeWorktreeId
      ? (state.browserTabsByWorktree[activeWorktreeId] ?? EMPTY_BROWSER_TABS)
      : EMPTY_BROWSER_TABS
  )
  const activeBrowserTabId = useAppStore((state) =>
    activeWorktreeId ? (state.activeBrowserTabIdByWorktree[activeWorktreeId] ?? null) : null
  )
  const browserAnnotationsByPageId = useAppStore((state) => state.browserAnnotationsByPageId)
  const createBrowserTab = useAppStore((state) => state.createBrowserTab)
  const focusBrowserTabInWorktree = useAppStore((state) => state.focusBrowserTabInWorktree)

  const activeBrowserTab = useMemo(
    () =>
      activeBrowserTabId
        ? (browserTabs.find((tab) => tab.id === activeBrowserTabId) ?? null)
        : null,
    [activeBrowserTabId, browserTabs]
  )
  const visibleBrowserTab = activeBrowserTab ?? browserTabs[0] ?? null
  const activeBrowserPageId =
    visibleBrowserTab?.activePageId ?? visibleBrowserTab?.pageIds?.[0] ?? visibleBrowserTab?.id
  const browserAnnotations = activeBrowserPageId
    ? (browserAnnotationsByPageId[activeBrowserPageId] ?? EMPTY_BROWSER_ANNOTATIONS)
    : EMPTY_BROWSER_ANNOTATIONS
  const browserAnnotationMarkdown = useMemo(
    () => formatBrowserAnnotationsAsMarkdown([...browserAnnotations]),
    [browserAnnotations]
  )

  function openBrowserWorkbench(): void {
    if (!activeWorktreeId || typeof onOpenTerminalDrawer !== 'function') {
      return
    }

    const browserTab =
      visibleBrowserTab ??
      createBrowserTab(activeWorktreeId, ORCA_BROWSER_BLANK_URL, {
        title: translate(
          'auto.components.agentWorkspace.composer.newBrowserTab',
          'New Browser Tab'
        ),
        focusAddressBar: true,
        activate: true
      })
    const browserPageId = browserTab.activePageId ?? browserTab.pageIds?.[0] ?? browserTab.id
    focusBrowserTabInWorktree(activeWorktreeId, browserPageId, { surfacePane: true })
    onOpenTerminalDrawer('browser')
  }

  const browserWorkbenchReady = Boolean(activeWorktreeId)
  const canOpenBrowserDrawer = typeof onOpenTerminalDrawer === 'function'

  return {
    browserWorkbenchReady,
    canOpenBrowserDrawer,
    browserAvailable: browserWorkbenchReady && canOpenBrowserDrawer,
    browserTabCount: browserTabs.length,
    browserAnnotationCount: browserAnnotations.length,
    browserAnnotationMarkdown,
    canAttachBrowserContext: browserAnnotationMarkdown.length > 0,
    openBrowserWorkbench
  }
}
