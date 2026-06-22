import { useEffect, useState } from 'react'
import QRCodeBrowser from 'qrcode/lib/browser'
import type { Platform } from './MobileHero'
import type { MobilePageStage } from './mobile-page-stage'
import { PLATFORM_COPY } from './mobile-platform-copy'

async function renderQrDataUrl(text: string): Promise<string> {
  return QRCodeBrowser.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 232
  })
}

export function useMobileInstallQrUrl({
  stage,
  platform
}: {
  stage: MobilePageStage | null
  platform: Platform
}): string | null {
  const qrSourceUrl = stage === 'flow' ? PLATFORM_COPY[platform].url : null
  const [renderedQr, setRenderedQr] = useState<{ sourceUrl: string; dataUrl: string } | null>(null)

  useEffect(() => {
    if (!qrSourceUrl) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const dataUrl = await renderQrDataUrl(qrSourceUrl)
        if (!cancelled) {
          setRenderedQr({ sourceUrl: qrSourceUrl, dataUrl })
        }
      } catch {
        // Keep returning null below until a QR for this source renders.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [qrSourceUrl])

  return renderedQr?.sourceUrl === qrSourceUrl ? renderedQr.dataUrl : null
}
