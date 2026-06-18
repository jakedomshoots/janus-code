import '../assets/main.css'

import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import WebConnect from './WebConnect'
import { RecoverableRenderErrorBoundary } from '../components/error-boundaries/RecoverableRenderErrorBoundary'
import {
  clearPairingInputFromAddressBar,
  parseWebPairingInput,
  readPairingInputFromLocation
} from './web-pairing'
import {
  createStoredWebRuntimeEnvironment,
  readStoredWebRuntimeEnvironment,
  saveStoredWebRuntimeEnvironment
} from './web-runtime-environment'
import { installWebPreloadApi } from './web-preload-api'
import { isLocalDevWebHost, tryConnectLocalDevRuntime } from './web-dev-local-pairing'
import { I18nProvider } from '../i18n/I18nProvider'
import { translate } from '../i18n/i18n'

const App = lazy(() => import('../App'))

function WebRoot(): React.JSX.Element {
  const initialPairingInput = useMemo(() => readPairingInputFromLocation(window.location), [])
  // Why: UI annotation runs need the Vite localhost shell even when the desktop
  // runtime is production-style and cannot serve the dev local-pairing endpoint.
  const allowUnpairedLocalDevShell =
    import.meta.env.DEV && isLocalDevWebHost(window.location.hostname)
  const [hasEnvironment, setHasEnvironment] = useState(() => {
    const offer = initialPairingInput ? parseWebPairingInput(initialPairingInput) : null
    if (offer) {
      saveStoredWebRuntimeEnvironment(
        createStoredWebRuntimeEnvironment({ name: 'Janus Code Server', offer })
      )
      clearPairingInputFromAddressBar()
      return true
    }
    return readStoredWebRuntimeEnvironment() !== null
  })
  const [autoConnecting, setAutoConnecting] = useState(false)

  useEffect(() => {
    if (hasEnvironment || initialPairingInput || allowUnpairedLocalDevShell) {
      return
    }
    let cancelled = false
    setAutoConnecting(true)

    const attemptConnect = async (): Promise<boolean> => tryConnectLocalDevRuntime()

    void (async () => {
      // Why: the desktop runtime can still be booting when the web dev server is
      // already up. Retry local pairing briefly instead of dropping users on the
      // manual connect screen after a single failed attempt.
      const retryDelaysMs = [0, 750, 1500, 3000, 5000, 8000, 12_000]
      for (const delayMs of retryDelaysMs) {
        if (cancelled) {
          return
        }
        if (delayMs > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, delayMs))
        }
        if (cancelled) {
          return
        }
        if (await attemptConnect()) {
          if (!cancelled) {
            setHasEnvironment(true)
          }
          return
        }
      }
    })().finally(() => {
      if (!cancelled) {
        setAutoConnecting(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [allowUnpairedLocalDevShell, hasEnvironment, initialPairingInput])

  if (autoConnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        {translate('auto.web.main.connecting', 'Connecting to Janus Code…')}
      </div>
    )
  }

  if (!hasEnvironment && !allowUnpairedLocalDevShell) {
    return (
      <WebConnect
        initialPairingInput={initialPairingInput}
        onConnected={() => setHasEnvironment(true)}
      />
    )
  }

  installWebPreloadApi()
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <App />
    </Suspense>
  )
}

function WebRootBoundary(): React.JSX.Element {
  useTranslation()
  return (
    <RecoverableRenderErrorBoundary
      boundaryId="web.root"
      surface="web-root"
      title={translate('app.recoverableError.webTitle', 'Janus Code web hit a renderer error.')}
      description={translate(
        'app.recoverableError.webDescription',
        'Retry the web client or reconnect to the paired runtime.'
      )}
    >
      <WebRoot />
    </RecoverableRenderErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <I18nProvider>
    <WebRootBoundary />
  </I18nProvider>
)
