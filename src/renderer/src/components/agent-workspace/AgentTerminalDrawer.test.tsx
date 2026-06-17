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

  it('labels an opened drawer with the reveal reason', () => {
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
    expect(markup).toContain('Terminal drawer')
    expect(markup).toContain('Opened from keyboard shortcut')
  })

  it('labels the browser workbench distinctly from the terminal drawer', () => {
    const markup = renderToStaticMarkup(
      <AgentTerminalDrawer open reason="browser" terminalAvailable onClose={() => undefined}>
        {preservedTerminal}
      </AgentTerminalDrawer>
    )

    expect(markup).toContain('Browser workbench')
    expect(markup).toContain('Browser, grab, and annotations are available here.')
    expect(markup).toContain('Close browser workbench')
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
})
