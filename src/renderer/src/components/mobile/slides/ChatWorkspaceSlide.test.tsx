// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ChatWorkspaceSlide } from './ChatWorkspaceSlide'

describe('ChatWorkspaceSlide', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
  })

  it('renders a chat-first mobile workspace with artifact and review tabs', async () => {
    await act(async () => {
      root.render(<ChatWorkspaceSlide />)
    })

    expect(container.textContent).toContain('Fix composer chat UI')
    expect(container.textContent).toContain('Claude Opus 4.8')
    expect(container.textContent).toContain('janus-direct-download-release-handoff-2026-06-19.md')
    expect(container.textContent).toContain('Edited 5 files')
    expect(container.textContent).toContain('/review')
    expect(container.textContent).toContain('Chat')
    expect(container.textContent).toContain('Files')
    expect(container.textContent).toContain('Changes')
    expect(container.textContent).toContain('Preview')
    expect(container.textContent).toContain('Terminal')
  })
})
