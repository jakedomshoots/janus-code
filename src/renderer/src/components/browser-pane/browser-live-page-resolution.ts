import { ORCA_BROWSER_BLANK_URL } from '../../../../shared/constants'
import type { BrowserPage, BrowserWorkspace } from '../../../../shared/types'
import { getLiveBrowserUrl } from './browser-runtime'

export function isBlankBrowserUrl(url: string | null | undefined): boolean {
  return !url || url === 'about:blank' || url === ORCA_BROWSER_BLANK_URL
}

function normalizeComparableBrowserUrl(url: string | null | undefined): string | null {
  if (isBlankBrowserUrl(url)) {
    return null
  }
  return url ?? null
}

function resolveLiveSameUrlSiblingPageId(args: {
  activePage: BrowserPage | undefined
  pageById: ReadonlyMap<string, BrowserPage>
  pageIds: readonly string[]
}): string | null {
  const activeComparableUrl = normalizeComparableBrowserUrl(args.activePage?.url)
  if (!args.activePage || !activeComparableUrl) {
    return null
  }
  let candidate: BrowserPage | null = null
  for (const pageId of args.pageIds) {
    if (pageId === args.activePage.id) {
      continue
    }
    const page = args.pageById.get(pageId)
    const liveUrl = getLiveBrowserUrl(pageId)
    if (
      !page ||
      !liveUrl ||
      normalizeComparableBrowserUrl(page.url) !== activeComparableUrl ||
      normalizeComparableBrowserUrl(liveUrl) !== activeComparableUrl
    ) {
      continue
    }
    if (!candidate || page.createdAt > candidate.createdAt) {
      candidate = page
    }
  }
  return candidate?.id ?? null
}

export function resolveLiveBrowserPageId(args: {
  browserTab: BrowserWorkspace
  browserPages: readonly BrowserPage[]
}): string {
  const pageIds = args.browserTab.pageIds?.length
    ? args.browserTab.pageIds
    : args.browserPages.length > 0
      ? args.browserPages.map((page) => page.id)
      : args.browserTab.activePageId
        ? [args.browserTab.activePageId]
        : []
  const activePageId = args.browserTab.activePageId ?? pageIds[0] ?? args.browserTab.id
  const activeLiveUrl = getLiveBrowserUrl(activePageId)
  const pageById = new Map(args.browserPages.map((page) => [page.id, page] as const))
  const activePage = pageById.get(activePageId)
  const liveSameUrlSiblingPageId = resolveLiveSameUrlSiblingPageId({
    activePage,
    pageById,
    pageIds
  })
  if (liveSameUrlSiblingPageId) {
    return liveSameUrlSiblingPageId
  }
  if (activeLiveUrl) {
    return activePageId
  }

  if (activePage && isBlankBrowserUrl(activePage.url)) {
    return activePageId
  }

  const livePageId =
    pageIds.find((pageId) => {
      const liveUrl = getLiveBrowserUrl(pageId)
      const pageUrl = pageById.get(pageId)?.url
      return Boolean(liveUrl && !isBlankBrowserUrl(liveUrl) && !isBlankBrowserUrl(pageUrl))
    }) ??
    pageIds.find((pageId) => Boolean(getLiveBrowserUrl(pageId))) ??
    null

  // Why: repeated workbench opens can leave a fresh empty page active while a
  // sibling page owns the painted guest. Prefer the page that actually reported
  // live navigation, but preserve intentional blank tabs above.
  return livePageId ?? activePageId
}
