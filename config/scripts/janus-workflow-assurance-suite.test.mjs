import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(import.meta.dirname, '../..')

function readPackageJson() {
  return JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'))
}

function readAssurancePlan() {
  const output = execFileSync(
    process.execPath,
    [resolve(repoRoot, 'config/scripts/run-janus-workflow-assurance.mjs'), '--print-plan'],
    { cwd: repoRoot, encoding: 'utf8' }
  )

  return JSON.parse(output)
}

describe('Janus workflow assurance suite', () => {
  it('exposes a single repo-side workflow assurance command', () => {
    const packageJson = readPackageJson()

    expect(packageJson.scripts['verify:janus-workflow-assurance']).toBe(
      'node config/scripts/run-janus-workflow-assurance.mjs'
    )
  })

  it('keeps the critical composer, source-control, workflow smoke, and direct-download gates together', () => {
    const plan = readAssurancePlan()

    expect(plan.vitestFiles).toEqual(
      expect.arrayContaining([
        'config/scripts/computer-use-smoke.test.mjs',
        'config/scripts/computer-e2e-workflow.test.mjs',
        'config/scripts/janus-workflow-assurance-suite.test.mjs',
        'config/scripts/verify-direct-download-artifacts.test.mjs',
        'src/renderer/src/components/agent-workspace/AgentComposer.test.tsx',
        'src/renderer/src/components/agent-workspace/AgentComposer.draft-agent.test.tsx',
        'src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx',
        'src/renderer/src/components/agent-workspace/AgentComposer.permission-mode.test.tsx',
        'src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx',
        'src/renderer/src/components/agent-workspace/agent-composer-submit.test.ts',
        'src/renderer/src/components/right-sidebar/source-control-workflow-context.test.ts',
        'src/renderer/src/components/right-sidebar/SourceControl.host-context-boundary.test.ts',
        'src/renderer/src/components/right-sidebar/SourceControl.preview-open.test.tsx',
        'src/renderer/src/components/right-sidebar/discard-all-sequence.test.ts',
        'src/renderer/src/components/right-sidebar/source-control-dropdown-items.test.ts',
        'src/renderer/src/components/right-sidebar/ChecksPanel.context-builders.test.ts',
        'src/renderer/src/components/right-sidebar/checks-panel-review-creation.test.ts',
        'src/renderer/src/components/right-sidebar/checks-panel-git-status-snapshot.test.ts',
        'src/renderer/src/components/sidebar/useAddRepoLocalFolderFlow.test.ts',
        'src/renderer/src/components/sidebar/SidebarHeader.test.tsx',
        'src/renderer/src/components/settings/SettingsSidebar.test.tsx'
      ])
    )

    expect(plan.commands).toContainEqual({
      command: 'pnpm',
      args: ['run', 'verify:direct-download-artifacts', '--', '--release-notes=RELEASE_NOTES.md']
    })
  })
})
