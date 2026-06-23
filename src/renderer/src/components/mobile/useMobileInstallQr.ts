import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { Platform } from './MobileHero'
import { PLATFORM_COPY } from './mobile-platform-copy'
import { renderMobileQrDataUrl } from './mobile-qr-data-url'
import type { MobilePageStage as FlowStage } from './mobile-page-stage'

export function useMobileInstallQr({
  platform,
  setInstallQrUrl,
  stage
}: {
  platform: Platform
  setInstallQrUrl: Dispatch<SetStateAction<string | null>>
  stage: FlowStage | null
}): void {
  // Why: render install QRs lazily — only after the user enters the flow,
  // and re-render whenever the platform changes.
  useEffect(() => {
    if (stage !== 'flow') {
      return
    }
    // Clear the previous QR synchronously so the user never sees a stale
    // platform's image while the new one is rendering.
    setInstallQrUrl(null)
    let cancelled = false
    void (async () => {
      try {
        const dataUrl = await renderMobileQrDataUrl(PLATFORM_COPY[platform].url)
        if (!cancelled) {
          setInstallQrUrl(dataUrl)
        }
      } catch {
        if (!cancelled) {
          setInstallQrUrl(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [platform, setInstallQrUrl, stage])
}
