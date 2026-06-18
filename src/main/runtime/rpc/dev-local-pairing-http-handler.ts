import type { IncomingMessage, RequestListener, ServerResponse } from 'http'

const DEV_LOCAL_PAIRING_PATH = '/dev/local-pairing'
const DEV_WEB_CLIENT_ORIGIN = 'http://127.0.0.1:5175'

function isLoopbackRemoteAddress(remoteAddress: string | undefined): boolean {
  return (
    remoteAddress === '127.0.0.1' || remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1'
  )
}

export function wrapWithDevLocalPairingHandler(
  inner: RequestListener | undefined,
  options: {
    enabled: boolean
    createPairingUrl: () => string | null
  }
): RequestListener {
  return (request, response) => {
    if (
      options.enabled &&
      (request.method === 'GET' || request.method === 'OPTIONS') &&
      request.url?.split('?')[0] === DEV_LOCAL_PAIRING_PATH
    ) {
      void handleDevLocalPairingRequest(request, response, options.createPairingUrl)
      return
    }
    if (inner) {
      inner(request, response)
      return
    }
    writeHttpStatus(response, 404)
  }
}

async function handleDevLocalPairingRequest(
  request: IncomingMessage,
  response: ServerResponse,
  createPairingUrl: () => string | null
): Promise<void> {
  if (!isLoopbackRemoteAddress(request.socket.remoteAddress)) {
    writeHttpStatus(response, 403)
    return
  }
  setDevLocalPairingCorsHeaders(response)
  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.end()
    return
  }
  const pairingUrl = createPairingUrl()
  if (!pairingUrl) {
    writeHttpStatus(response, 503)
    return
  }
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.statusCode = 200
  response.end(JSON.stringify({ pairingUrl }))
}

function setDevLocalPairingCorsHeaders(response: ServerResponse): void {
  // Why: the browser dev client runs on Vite's :5175 origin while the dev
  // runtime pairing endpoint is served from :6769.
  response.setHeader('Access-Control-Allow-Origin', DEV_WEB_CLIENT_ORIGIN)
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
}

function writeHttpStatus(response: ServerResponse, statusCode: number): void {
  response.statusCode = statusCode
  response.end()
}
