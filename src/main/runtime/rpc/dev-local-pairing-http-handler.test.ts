import type { IncomingMessage, ServerResponse } from 'http'
import { describe, expect, it, vi } from 'vitest'
import { wrapWithDevLocalPairingHandler } from './dev-local-pairing-http-handler'

function createMockResponse(): ServerResponse & { statusCode: number; body: string } {
  const response = {
    statusCode: 200,
    body: '',
    setHeader: vi.fn(),
    end: vi.fn((body?: string) => {
      if (typeof body === 'string') {
        response.body = body
      }
    })
  }
  return response as unknown as ServerResponse & { statusCode: number; body: string }
}

function createLoopbackRequest(method: string, url: string): IncomingMessage {
  return {
    method,
    url,
    socket: { remoteAddress: '127.0.0.1' }
  } as IncomingMessage
}

describe('wrapWithDevLocalPairingHandler', () => {
  it('returns local pairing JSON for loopback requests', async () => {
    const handler = wrapWithDevLocalPairingHandler(undefined, {
      enabled: true,
      createPairingUrl: () => 'janus://pair?code=abc'
    })
    const response = createMockResponse()
    const request = createLoopbackRequest('GET', '/dev/local-pairing')

    handler(request, response)

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify({ pairingUrl: 'janus://pair?code=abc' }))
  })

  it('allows browser dev origins to read local pairing JSON', () => {
    const handler = wrapWithDevLocalPairingHandler(undefined, {
      enabled: true,
      createPairingUrl: () => 'janus://pair?code=abc'
    })
    const response = createMockResponse()

    handler(createLoopbackRequest('GET', '/dev/local-pairing'), response)

    expect(response.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://127.0.0.1:5175'
    )
  })

  it('handles browser preflight for local pairing requests', () => {
    const handler = wrapWithDevLocalPairingHandler(undefined, {
      enabled: true,
      createPairingUrl: () => 'janus://pair?code=abc'
    })
    const response = createMockResponse()

    handler(createLoopbackRequest('OPTIONS', '/dev/local-pairing'), response)

    expect(response.statusCode).toBe(204)
    expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS')
  })

  it('rejects non-loopback pairing requests', () => {
    const handler = wrapWithDevLocalPairingHandler(undefined, {
      enabled: true,
      createPairingUrl: () => 'janus://pair?code=abc'
    })
    const response = createMockResponse()
    const request = {
      method: 'GET',
      url: '/dev/local-pairing',
      socket: { remoteAddress: '10.0.0.4' }
    } as IncomingMessage

    handler(request, response)

    expect(response.statusCode).toBe(403)
  })
})
