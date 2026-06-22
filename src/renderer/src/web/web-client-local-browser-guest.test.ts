// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import {
  awaitWebClientLocalGrabSelection,
  registerWebClientLocalBrowserGuest,
  setWebClientLocalGrabMode,
  unregisterWebClientLocalBrowserGuest
} from './web-client-local-browser-guest'

;(globalThis as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__ = true

afterEach(() => {
  document.body.innerHTML = ''
})

describe('web-client-local-browser-guest', () => {
  it('captures clicks on a parent shield instead of the guest iframe', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const iframe = document.createElement('iframe')
    container.appendChild(iframe)

    const doc = iframe.contentDocument
    expect(doc).not.toBeNull()
    doc!.body.innerHTML = '<button id="target">Save</button>'

    registerWebClientLocalBrowserGuest('page-1', iframe)

    const enabled = await setWebClientLocalGrabMode({
      browserPageId: 'page-1',
      enabled: true
    })
    expect(enabled).toEqual({ ok: true })
    expect(iframe.style.pointerEvents).toBe('none')

    const selection = awaitWebClientLocalGrabSelection({
      browserPageId: 'page-1',
      opId: 'grab-test-1'
    })

    const button = doc!.getElementById('target')
    expect(button).not.toBeNull()
    button!.getBoundingClientRect = () => ({
      x: 40,
      y: 60,
      width: 80,
      height: 24,
      top: 60,
      left: 40,
      right: 120,
      bottom: 84,
      toJSON: () => ({})
    })
    iframe.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
      toJSON: () => ({})
    })

    const guestWindow = iframe.contentWindow!
    Object.defineProperties(guestWindow, {
      scrollX: { configurable: true, value: 0 },
      scrollY: { configurable: true, value: 0 },
      innerWidth: { configurable: true, value: 800 },
      innerHeight: { configurable: true, value: 600 },
      devicePixelRatio: { configurable: true, value: 1 }
    })
    guestWindow.getComputedStyle = () =>
      ({
        display: 'inline-block',
        position: 'static',
        width: '80px',
        height: '24px',
        margin: '0px',
        padding: '0px',
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        border: '0px',
        borderRadius: '0px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
        textAlign: 'center',
        zIndex: 'auto'
      }) as CSSStyleDeclaration

    doc!.elementFromPoint = () => button

    const overlay = container.querySelector('[data-orca-web-grab-host="true"]')
    expect(overlay).not.toBeNull()
    overlay!.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: 80,
        clientY: 72
      })
    )

    const result = await selection
    expect(result.kind).toBe('selected')
    if (result.kind === 'selected') {
      expect(result.payload.target.selector).toBe('#target')
      expect(result.payload.target.textSnippet).toBe('Save')
    }

    unregisterWebClientLocalBrowserGuest('page-1')
  })
})
