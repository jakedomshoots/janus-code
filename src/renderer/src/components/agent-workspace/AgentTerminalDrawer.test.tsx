// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentTerminalDrawer } from './AgentTerminalDrawer'

const preservedTerminal = <span>Preserved terminal workspace</span>

describe('AgentTerminalDrawer', () => {
  let root: Root | null = null

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.replaceChildren()
  })

  it('keeps terminal children mounted while the drawer is closed', () => {
    const markup = renderToStaticMarkup(
      <AgentTerminalDrawer open={false} reason={null} terminalAvailable onClose={() => undefined}>
        {preservedTerminal}
      </AgentTerminalDrawer>
    )

    expect(markup).toContain('data-state="closed"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('Preserved terminal workspace')
  })

  it('keeps the opened terminal drawer header visually quiet', () => {
    const markup = renderToStaticMarkup(
      <AgentTerminalDrawer
        open
        reason="keyboard-shortcut"
        terminalAvailable
        onClose={() => undefined}
      >
        {preservedTerminal}
      </AgentTerminalDrawer>
    )

    expect(markup).toContain('data-state="open"')
    expect(markup).toContain('aria-label="Terminal drawer"')
    expect(markup).toContain('Close terminal drawer')
    expect(markup).not.toContain('Opened from keyboard shortcut')
    expect(markup).not.toContain('Opened from composer tools')
  })

  it('labels the browser workbench distinctly from the terminal drawer', () => {
    const markup = renderToStaticMarkup(
      <AgentTerminalDrawer open reason="browser" terminalAvailable onClose={() => undefined}>
        {preservedTerminal}
      </AgentTerminalDrawer>
    )

    expect(markup).toContain('aria-label="Browser workbench"')
    expect(markup).not.toContain('Browser, grab, and annotations are available here.')
    expect(markup).toContain('Close browser workbench')
  })

  it('does not show drawer status copy for browser workbench', () => {
    const markup = renderToStaticMarkup(
      <AgentTerminalDrawer
        open
        reason="browser"
        terminalAvailable={false}
        onClose={() => undefined}
      >
        {preservedTerminal}
      </AgentTerminalDrawer>
    )

    expect(markup).toContain('aria-label="Browser workbench"')
    expect(markup).not.toContain('Browser, grab, and annotations are available here.')
    expect(markup).not.toContain('No terminal session is attached to this workspace.')
  })

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AgentTerminalDrawer open reason="right-panel" terminalAvailable onClose={onClose}>
          {preservedTerminal}
        </AgentTerminalDrawer>
      )
    })

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Close terminal drawer"]')
        ?.click()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('resizes the bottom drawer with bounded height physics', async () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 700
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AgentTerminalDrawer open reason="debug-button" terminalAvailable onClose={() => undefined}>
          {preservedTerminal}
        </AgentTerminalDrawer>
      )
    })

    const drawer = container.querySelector<HTMLElement>('[data-agent-terminal-drawer="true"]')
    const resizeHandle = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Resize terminal drawer"]'
    )
    expect(drawer?.style.height).toBe('322px')
    expect(resizeHandle).not.toBeNull()

    const pointerDown = new Event('pointerdown', { bubbles: true }) as PointerEvent
    Object.defineProperty(pointerDown, 'clientY', { value: 300 })
    const pointerMoveUp = new Event('pointermove') as PointerEvent
    Object.defineProperty(pointerMoveUp, 'clientY', { value: 0 })
    const pointerMoveDown = new Event('pointermove') as PointerEvent
    Object.defineProperty(pointerMoveDown, 'clientY', { value: 1000 })

    await act(async () => {
      resizeHandle?.dispatchEvent(pointerDown)
      window.dispatchEvent(pointerMoveUp)
    })

    expect(drawer?.style.height).toBe('580px')

    await act(async () => {
      window.dispatchEvent(pointerMoveDown)
      window.dispatchEvent(new Event('pointerup'))
    })

    expect(drawer?.style.height).toBe('224px')
  })
})
