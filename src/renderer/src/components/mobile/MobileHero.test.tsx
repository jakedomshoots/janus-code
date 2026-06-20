// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { HeroFlow } from './MobileHero'

function renderPairingStep(pairingIssue: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}): string {
  return renderToStaticMarkup(
    <HeroFlow
      stepIdx={1}
      platform="ios"
      onPlatformChange={vi.fn()}
      installQrUrl={null}
      installCopy={{
        description: 'Install app',
        ctaLabel: 'Open install link',
        url: 'https://example.test/app'
      }}
      onOpenInstallUrl={vi.fn()}
      onCopyInstallUrl={vi.fn()}
      pairQrDataUrl={null}
      pairingUrl={null}
      pairLoading={false}
      pairingIssue={pairingIssue}
      onRegeneratePairing={vi.fn()}
      onCopyPairingCode={vi.fn()}
      networkInterfaces={[]}
      selectedAddress={undefined}
      onSelectedAddressChange={vi.fn()}
      onRefreshNetworkInterfaces={vi.fn()}
      refreshingNetworkInterfaces={false}
      onBack={vi.fn()}
      onContinue={vi.fn()}
    />
  )
}

describe('HeroFlow', () => {
  it('shows a persistent pairing recovery notice when Janus Code transport is unavailable', () => {
    const markup = renderPairingStep({
      title: 'Start Janus Code server before pairing mobile.',
      description: 'Mobile pairing needs the desktop WebSocket transport to create a QR code.',
      actionLabel: 'Open Remote Hosts settings',
      onAction: vi.fn()
    })

    expect(markup).toContain('Start Janus Code server before pairing mobile.')
    expect(markup).toContain('Mobile pairing needs the desktop WebSocket transport')
    expect(markup).toContain('Open Remote Hosts settings')
  })
})
