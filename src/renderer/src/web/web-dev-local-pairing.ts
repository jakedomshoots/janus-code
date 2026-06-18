import { parseWebPairingInput } from './web-pairing'
import {
  createStoredWebRuntimeEnvironment,
  saveStoredWebRuntimeEnvironment,
  updateStoredEnvironmentRuntimeId
} from './web-runtime-environment'
import { WebRuntimeClient } from './web-runtime-client'

// Why: dev Electron pins its runtime WS port to 6769; production Orca uses 6768.
const LOCAL_DEV_RUNTIME_HTTP_PORTS = [6769, 6768] as const

export function isLocalDevWebHost(hostname: string): boolean {
  return hostname === '127.0.0.1' || hostname === 'localhost'
}

export async function tryConnectLocalDevRuntime(): Promise<boolean> {
  if (!import.meta.env.DEV || !isLocalDevWebHost(window.location.hostname)) {
    return false
  }

  for (const port of LOCAL_DEV_RUNTIME_HTTP_PORTS) {
    const pairingUrl = await fetchLocalDevPairingUrl(port)
    if (!pairingUrl) {
      continue
    }
    const offer = parseWebPairingInput(pairingUrl)
    if (!offer) {
      continue
    }
    const environment = createStoredWebRuntimeEnvironment({
      name: 'Janus Code Dev',
      offer
    })
    const client = new WebRuntimeClient(offer)
    try {
      const response = await client.call('status.get', undefined, { timeoutMs: 15_000 })
      if (!response.ok) {
        continue
      }
      saveStoredWebRuntimeEnvironment(
        updateStoredEnvironmentRuntimeId(environment, response._meta.runtimeId)
      )
      return true
    } catch {
      // Try the next local runtime port.
    } finally {
      client.close()
    }
  }

  return false
}

async function fetchLocalDevPairingUrl(port: number): Promise<string | null> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/dev/local-pairing`)
    if (!response.ok) {
      return null
    }
    const payload = (await response.json()) as { pairingUrl?: unknown }
    return typeof payload.pairingUrl === 'string' && payload.pairingUrl.length > 0
      ? payload.pairingUrl
      : null
  } catch {
    return null
  }
}
