import { describe, expect, it, vi } from 'vitest'
import { RpcDispatcher } from '../dispatcher'
import type { RpcRequest } from '../core'
import { BROWSER_GRAB_METHODS } from './browser-grab'

function makeRequest(method: string, params?: unknown): RpcRequest {
  return { id: 'req-1', authToken: 'tok', method, params }
}

describe('browser grab RPC methods', () => {
  it('registers paired-web grab handlers on the runtime', async () => {
    const browserSetGrabMode = vi.fn(async () => ({ ok: true }))
    const runtime = {
      getRuntimeId: () => 'test-runtime',
      browserSetGrabMode,
      browserAwaitGrabSelection: vi.fn(),
      browserCancelGrab: vi.fn(() => true),
      browserCaptureSelectionScreenshot: vi.fn(),
      browserExtractHoverPayload: vi.fn()
    }
    const dispatcher = new RpcDispatcher({
      runtime: runtime as never,
      methods: BROWSER_GRAB_METHODS
    })

    const response = await dispatcher.dispatch(
      makeRequest('browser.setGrabMode', {
        worktree: 'id:wt-1',
        page: 'browser-page-1',
        enabled: true
      })
    )

    expect(response.ok).toBe(true)
    expect(browserSetGrabMode).toHaveBeenCalledWith({
      worktree: 'id:wt-1',
      page: 'browser-page-1',
      enabled: true
    })
  })
})
