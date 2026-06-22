const liveBrowserUrlByTabId = new Map<string, string>()
const liveBrowserUrlListeners = new Set<() => void>()
let liveBrowserUrlRevision = 0

function notifyLiveBrowserUrlChanged(): void {
  liveBrowserUrlRevision += 1
  for (const listener of liveBrowserUrlListeners) {
    listener()
  }
}

export function rememberLiveBrowserUrl(browserTabId: string, url: string): void {
  if (liveBrowserUrlByTabId.get(browserTabId) === url) {
    return
  }
  liveBrowserUrlByTabId.set(browserTabId, url)
  notifyLiveBrowserUrlChanged()
}

export function getLiveBrowserUrl(browserTabId: string): string | null {
  return liveBrowserUrlByTabId.get(browserTabId) ?? null
}

export function clearLiveBrowserUrl(browserTabId: string): void {
  if (!liveBrowserUrlByTabId.delete(browserTabId)) {
    return
  }
  notifyLiveBrowserUrlChanged()
}

export function getLiveBrowserUrlRevision(): number {
  return liveBrowserUrlRevision
}

export function subscribeLiveBrowserUrls(listener: () => void): () => void {
  liveBrowserUrlListeners.add(listener)
  return () => liveBrowserUrlListeners.delete(listener)
}
