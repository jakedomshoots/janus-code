// @vitest-environment happy-dom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AgentWorkspaceMemoryInspector } from './AgentWorkspaceMemoryInspector'
import type { AgentWorkspaceProject } from './agent-workspace-types'
import type { MemorySnapshot } from '../../../../shared/types'

const project: AgentWorkspaceProject = {
  id: 'worktree-1',
  repoId: 'repo-janus',
  label: 'Janus Code',
  path: '/repo/janus-code',
  hostKind: 'local',
  branchName: 'main'
}

function memorySnapshot(overrides: Partial<MemorySnapshot> = {}): MemorySnapshot {
  return {
    app: {
      cpu: 2,
      memory: 2048,
      main: { cpu: 1, memory: 1024 },
      renderer: { cpu: 1, memory: 512 },
      other: { cpu: 0, memory: 512 },
      history: [2048]
    },
    worktrees: [
      {
        worktreeId: 'worktree-1',
        worktreeName: 'Janus Code',
        repoId: 'repo-janus',
        repoName: 'Janus',
        cpu: 4,
        memory: 4096,
        sessions: [
          {
            sessionId: 'session-1',
            paneKey: 'pane-1',
            pid: 123,
            cpu: 4,
            memory: 4096
          }
        ],
        history: [4096]
      }
    ],
    host: {
      totalMemory: 8192,
      freeMemory: 4096,
      usedMemory: 4096,
      memoryUsagePercent: 50,
      cpuCoreCount: 8,
      loadAverage1m: 1
    },
    totalCpu: 6,
    totalMemory: 6144,
    collectedAt: Date.UTC(2026, 5, 21, 16, 0),
    ...overrides
  }
}

describe('AgentWorkspaceMemoryInspector', () => {
  it('shows an unsupported state when no observable memory snapshot exists', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceMemoryInspector project={project} snapshot={null} error={null} />
    )

    expect(markup).toContain('Memory inspector')
    expect(markup).toContain('Agent memory not observed')
    expect(markup).toContain('Agent-internal memory and rule files may contain sensitive context.')
  })

  it('shows partial state when the snapshot fetch failed', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceMemoryInspector
        project={project}
        snapshot={null}
        error="Resource daemon unavailable"
      />
    )

    expect(markup).toContain('Memory snapshot unavailable')
    expect(markup).toContain('Resource daemon unavailable')
  })

  it('shows source scope and freshness for an observed workspace snapshot', () => {
    const markup = renderToStaticMarkup(
      <AgentWorkspaceMemoryInspector project={project} snapshot={memorySnapshot()} error={null} />
    )

    expect(markup).toContain('Janus resource snapshot')
    expect(markup).toContain('Workspace sessions')
    expect(markup).toContain('Janus Code')
    expect(markup).toContain('2026-06-21T16:00:00.000Z')
  })
})
