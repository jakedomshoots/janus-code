#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const vitestFiles = [
  'config/scripts/computer-use-smoke.test.mjs',
  'config/scripts/computer-e2e-workflow.test.mjs',
  'config/scripts/janus-workflow-assurance-suite.test.mjs',
  'config/scripts/verify-direct-download-artifacts.test.mjs',
  'src/renderer/src/components/agent-workspace/AgentComposer.test.tsx',
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
]

function pnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

function commandPlan() {
  return [
    {
      command: 'pnpm',
      args: ['exec', 'vitest', 'run', '--config', 'config/vitest.config.ts', ...vitestFiles]
    },
    {
      command: 'pnpm',
      args: ['run', 'verify:direct-download-artifacts', '--', '--release-notes=RELEASE_NOTES.md']
    }
  ]
}

function runnableCommand(command) {
  return command === 'pnpm' ? pnpmCommand() : command
}

function printPlan() {
  console.log(
    JSON.stringify(
      {
        vitestFiles,
        commands: commandPlan()
      },
      null,
      2
    )
  )
}

function runPlan() {
  for (const step of commandPlan()) {
    const result = spawnSync(runnableCommand(step.command), step.args, {
      cwd: repoRoot,
      shell: false,
      stdio: 'inherit'
    })

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }
}

if (process.argv.includes('--print-plan')) {
  printPlan()
} else {
  runPlan()
}
