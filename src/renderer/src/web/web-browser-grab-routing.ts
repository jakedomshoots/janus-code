// Why: the web client keeps local browser page ids in renderer state while grab
// runs against the paired runtime's remote browser tab id.
export type WebBrowserGrabRoute = {
  worktreeSelector: string
  remotePageId: string
}

const routesByLocalPageId = new Map<string, WebBrowserGrabRoute>()

export function setWebBrowserGrabRoute(
  localPageId: string,
  route: WebBrowserGrabRoute | null
): void {
  if (route) {
    routesByLocalPageId.set(localPageId, route)
    return
  }
  routesByLocalPageId.delete(localPageId)
}

export function resolveWebBrowserGrabRoute(localPageId: string): WebBrowserGrabRoute | null {
  return routesByLocalPageId.get(localPageId) ?? null
}
