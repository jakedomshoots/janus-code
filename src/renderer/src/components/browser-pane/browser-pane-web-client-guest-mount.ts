import {
  notifyWebClientLocalBrowserGuestLoaded,
  registerWebClientLocalBrowserGuest,
  unregisterWebClientLocalBrowserGuest
} from '@/web/web-client-local-browser-guest'

export function shouldMountWebClientBrowserGuest(): boolean {
  return Boolean((globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__)
}

export function mountBrowserPaneWebClientGuest(args: {
  browserPageId: string
  container: HTMLElement
  initialUrl: string
  webviewRef: { current: HTMLElement | null }
  onNavigate: (url: string, title: string) => void
  onLoadingChange: (loading: boolean) => void
}): () => void {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Browser page')
  iframe.style.display = 'flex'
  iframe.style.flex = '1'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.background = '#ffffff'
  iframe.className = 'browser-pane-web-client-guest'
  iframe.src = args.initialUrl
  args.container.appendChild(iframe)
  args.webviewRef.current = iframe
  registerWebClientLocalBrowserGuest(args.browserPageId, iframe)

  const handleLoad = (): void => {
    const doc = iframe.contentDocument
    const nextUrl = iframe.contentWindow?.location.href ?? iframe.src
    notifyWebClientLocalBrowserGuestLoaded(args.browserPageId)
    args.onNavigate(nextUrl, doc?.title?.trim() || nextUrl)
    args.onLoadingChange(false)
  }

  iframe.addEventListener('load', handleLoad)

  return () => {
    iframe.removeEventListener('load', handleLoad)
    unregisterWebClientLocalBrowserGuest(args.browserPageId)
    if (args.webviewRef.current === iframe) {
      args.webviewRef.current = null
    }
    iframe.remove()
  }
}
