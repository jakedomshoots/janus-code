// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import Landing from './Landing'

const storeMocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  repos: []
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: typeof storeMocks) => unknown) => selector(storeMocks)
}))

vi.mock('@/hooks/useShortcutLabel', () => ({
  useShortcutKeys: (id: string) => {
    switch (id) {
      case 'workspace.create':
        return ['⌘', 'N']
      case 'worktree.navigateUp':
        return ['⌘', '⇧', '↑']
      case 'worktree.navigateDown':
        return ['⌘', '⇧', '↓']
      default:
        return []
    }
  }
}))

vi.mock('../../../../resources/janus-logo.png', () => ({
  default: 'janus-logo.png'
}))

describe('Landing', () => {
  it('presents first-run setup as an ordered path when no project exists', () => {
    const markup = renderToStaticMarkup(<Landing />)

    expect(markup).toContain('Start with a project')
    expect(markup).toContain('Connect Janus Code')
    expect(markup).toContain('Install required Git')
    expect(markup).toContain('Start an agent')
    expect(markup).toContain('Add a project before creating a workspace.')
  })
})
