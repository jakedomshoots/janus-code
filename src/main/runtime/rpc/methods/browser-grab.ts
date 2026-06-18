import { defineMethod, type RpcMethod } from '../core'
import { GrabAwaitSelection, GrabCaptureScreenshot, GrabSetMode } from './browser-grab-schemas'
import { BrowserTarget } from '../schemas'

export const BROWSER_GRAB_METHODS: RpcMethod[] = [
  defineMethod({
    name: 'browser.setGrabMode',
    params: GrabSetMode,
    handler: async (params, { runtime }) => runtime.browserSetGrabMode(params)
  }),
  defineMethod({
    name: 'browser.awaitGrabSelection',
    params: GrabAwaitSelection,
    handler: async (params, { runtime }) => runtime.browserAwaitGrabSelection(params)
  }),
  defineMethod({
    name: 'browser.cancelGrab',
    params: BrowserTarget,
    handler: async (params, { runtime }) => runtime.browserCancelGrab(params)
  }),
  defineMethod({
    name: 'browser.captureSelectionScreenshot',
    params: GrabCaptureScreenshot,
    handler: async (params, { runtime }) => runtime.browserCaptureSelectionScreenshot(params)
  }),
  defineMethod({
    name: 'browser.extractHoverPayload',
    params: BrowserTarget,
    handler: async (params, { runtime }) => runtime.browserExtractHoverPayload(params)
  })
]
