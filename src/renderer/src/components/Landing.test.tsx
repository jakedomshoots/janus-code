// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Landing from './Landing'
import type { CliInstallStatus } from '../../../shared/cli-install-types'
import { getPreflightIssues, isWebClientPreflightFallback } from './landing-preflight'

const storeMocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  repos: [] as { kind?: 'git' | 'folder' }[]
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
  beforeEach(() => {
    storeMocks.openModal.mockReset()
    storeMocks.repos = []
  })

  it('presents first-run setup as an ordered path when no project exists', () => {
    const markup = renderToStaticMarkup(<Landing />)

    expect(markup).toContain('Start with a project')
    expect(markup).toContain('Connect Janus Code')
    expect(markup).toContain('Install required Git')
    expect(markup).toContain('Start an agent')
    expect(markup).toContain('Add a project before creating a workspace.')
  })

  it('separates Create from the workspace target label', () => {
    storeMocks.repos = [{ kind: 'folder' }]

    const markup = renderToStaticMarkup(<Landing />)

    expect(markup).toContain('Create Workspace')
    expect(markup).not.toContain('CreateWorkspace')
  })

  it('reports web pairing instead of missing Git for unpaired web fallback preflight', () => {
    const issues = getPreflightIssues(
      {
        git: { installed: false },
        gh: { installed: false, authenticated: false }
      },
      { webClientDisconnected: true }
    )

    expect(issues).toEqual([
      expect.objectContaining({
        id: 'web-client-runtime',
        title: 'Web client is not paired',
        required: true
      })
    ])
    expect(issues[0]?.description).toContain('Pair this browser with Janus Code')
  })

  it('keeps desktop missing-Git copy when preflight is not a web fallback', () => {
    const issues = getPreflightIssues(
      {
        git: { installed: false },
        gh: { installed: true, authenticated: true }
      },
      { webClientDisconnected: false }
    )

    expect(issues).toEqual([
      expect.objectContaining({
        id: 'git',
        title: 'Git is not installed',
        fixLabel: 'Install Git'
      })
    ])
  })

  it('detects the unpaired web client fallback from CLI and websocket state', () => {
    const cliStatus = {
      state: 'unsupported',
      unsupportedReason: 'launch_mode_unavailable',
      detail: 'CLI registration is managed on the Janus Code server, not in the web browser.'
    } as CliInstallStatus

    expect(isWebClientPreflightFallback({ cliStatus, webSocketReady: false })).toBe(true)
    expect(isWebClientPreflightFallback({ cliStatus, webSocketReady: true })).toBe(false)
  })
})
