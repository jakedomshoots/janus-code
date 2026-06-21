import { useMemo } from 'react'
import { useAppStore } from '@/store'
import type { BrowserWorkspace } from '../../../../shared/types'
import type { BrowserPageAnnotation } from '../../../../shared/browser-grab-types'
import { formatBrowserAnnotationsForAgentPrompt } from '../browser-pane/browser-annotation-output'
import type { AgentTerminalRevealReason } from './agent-terminal-visibility'
import {
  openAgentBrowserWorkbench,
  type OpenAgentBrowserWorkbenchOptions
} from './agent-browser-workbench-open'

const EMPTY_BROWSER_TABS: readonly BrowserWorkspace[] = []
const EMPTY_BROWSER_ANNOTATIONS: readonly BrowserPageAnnotation[] = []

export type AgentBrowserWorkbenchState = {
  readonly browserWorkbenchReady: boolean
  readonly canOpenBrowserDrawer: boolean
  readonly browserAvailable: boolean
  readonly browserTabCount: number
  readonly browserAnnotationCount: number
  readonly browserAnnotationMarkdown: string
  readonly browserContextSourceId?: string | null
  readonly canAttachBrowserContext: boolean
  readonly openBrowserWorkbench: (options?: OpenAgentBrowserWorkbenchOptions) => void
}

export function useAgentBrowserWorkbench({
  activeWorktreeId,
  browserWorkbenchActive = false,
  onOpenTerminalDrawer
}: {
  activeWorktreeId: string | null
  browserWorkbenchActive?: boolean
  onOpenTerminalDrawer?: (reason: AgentTerminalRevealReason | null) => void
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
  const closeBrowserTab = useAppStore((state) => state.closeBrowserTab)
  const createUnifiedTab = useAppStore((state) => state.createUnifiedTab)
  const activateTab = useAppStore((state) => state.activateTab)
  const setActiveBrowserTab = useAppStore((state) => state.setActiveBrowserTab)
  const setActiveTabType = useAppStore((state) => state.setActiveTabType)
  const focusBrowserTabInWorktree = useAppStore((state) => state.focusBrowserTabInWorktree)
  const openNewBrowserTabInActiveWorkspace = useAppStore(
    (state) => state.openNewBrowserTabInActiveWorkspace
  )

  const activeBrowserTab = useMemo(
    () =>
      activeBrowserTabId
        ? (browserTabs.find((tab) => tab.id === activeBrowserTabId) ?? null)
        : null,
    [activeBrowserTabId, browserTabs]
  )
  const visibleBrowserTab = activeBrowserTab ?? browserTabs[0] ?? null
  // Why: annotations are keyed by browser page id — never fall back to the
  // workspace tab id or attach/send will miss the user's feedback notes.
  const activeBrowserPageId =
    visibleBrowserTab?.activePageId ?? visibleBrowserTab?.pageIds?.[0] ?? null
  const browserAnnotations = activeBrowserPageId
    ? (browserAnnotationsByPageId[activeBrowserPageId] ?? EMPTY_BROWSER_ANNOTATIONS)
    : EMPTY_BROWSER_ANNOTATIONS
  const browserAnnotationMarkdown = useMemo(
    () => formatBrowserAnnotationsForAgentPrompt([...browserAnnotations]),
    [browserAnnotations]
  )

  function openBrowserWorkbench(options?: OpenAgentBrowserWorkbenchOptions): void {
    openAgentBrowserWorkbench({
      activeWorktreeId,
      browserWorkbenchActive,
      onOpenTerminalDrawer,
      options,
      createBrowserTab,
      closeBrowserTab,
      createUnifiedTab,
      activateTab,
      setActiveBrowserTab,
      setActiveTabType,
      focusBrowserTabInWorktree,
      openNewBrowserTabInActiveWorkspace
    })
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
    browserContextSourceId:
      visibleBrowserTab && activeBrowserPageId
        ? `${visibleBrowserTab.id}:${activeBrowserPageId}`
        : null,
    canAttachBrowserContext: browserAnnotationMarkdown.length > 0,
    openBrowserWorkbench
  }
}
