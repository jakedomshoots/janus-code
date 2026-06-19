// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAgentComposerModelDiscovery } from './agent-composer-model-discovery'

const mocks = vi.hoisted(() => ({
  discoverCommitMessageModels: vi.fn(),
  repos: [] as { id: string; connectionId?: string | null; executionHostId?: string | null }[]
}))

vi.mock('@/store', () => ({
  useAppStore: (selector: (state: { repos: typeof mocks.repos }) => unknown) =>
    selector({ repos: mocks.repos })
}))

function ModelDiscoveryProbe(): React.JSX.Element {
  const discovery = useAgentComposerModelDiscovery('opencode', {
    id: 'worktree-remote',
    label: 'Remote Janus',
    path: '/home/jake/janus-code',
    hostKind: 'ssh',
    agentDetectionTarget: { kind: 'ssh', connectionId: 'ssh-1' }
  })

  return <output>{discovery.options.map((option) => option.label).join(',')}</output>
}

describe('useAgentComposerModelDiscovery', () => {
  let root: Root
  let container: HTMLDivElement

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mocks.repos = []
    mocks.discoverCommitMessageModels.mockReset()
    window.api = {
      git: {
        discoverCommitMessageModels: mocks.discoverCommitMessageModels
      }
    } as never
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.replaceChildren()
    delete (window as Partial<Window>).api
  })

  it('discovers chat agent models through the selected SSH project backend context', async () => {
    mocks.discoverCommitMessageModels.mockResolvedValue({
      success: true,
      capability: {
        id: 'opencode',
        label: 'OpenCode',
        modelSource: 'dynamic',
        defaultModelId: 'opencode/auto',
        models: []
      },
      defaultModelId: 'opencode/auto',
      models: [{ id: 'opencode/remote-only', label: 'Remote Only' }]
    })

    await act(async () => {
      root.render(<ModelDiscoveryProbe />)
      await Promise.resolve()
    })

    expect(mocks.discoverCommitMessageModels).toHaveBeenCalledWith({
      agentId: 'opencode',
      worktreePath: '/home/jake/janus-code',
      connectionId: 'ssh-1'
    })
    expect(container.textContent).toContain('Remote Only')
  })
})
