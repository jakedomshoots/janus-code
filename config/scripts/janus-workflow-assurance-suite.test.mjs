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
        'src/renderer/src/components/right-sidebar/source-control-primary-action.test.ts',
        'src/renderer/src/components/right-sidebar/CommitArea.test.tsx',
        'src/renderer/src/components/right-sidebar/CommitArea.generate.test.tsx',
        'src/renderer/src/components/right-sidebar/CommitArea.primary-icons.test.tsx',
        'src/renderer/src/components/right-sidebar/CommitArea.chevron-spinner.test.tsx',
        'src/renderer/src/components/right-sidebar/SourceControl.commit-drafts.test.ts',
        'src/renderer/src/components/right-sidebar/SourceControl.commit-generation-records.test.ts',
        'src/renderer/src/components/right-sidebar/SourceControl.commit-failure-recovery.test.ts',
        'src/renderer/src/components/right-sidebar/commit-failure-summary.test.ts',
        'src/renderer/src/components/right-sidebar/commit-failure-dialog-state.test.ts',
        'src/renderer/src/components/right-sidebar/source-control-ai-commit-failure-launch.test.ts',
        'src/renderer/src/components/right-sidebar/ChecksPanel.context-builders.test.ts',
        'src/renderer/src/components/right-sidebar/checks-panel-review-creation.test.ts',
        'src/renderer/src/components/right-sidebar/checks-panel-git-status-snapshot.test.ts',
        'src/renderer/src/components/sidebar/useAddRepoLocalFolderFlow.test.ts',
        'src/renderer/src/components/sidebar/useAddRepoCloneFlow.test.ts',
        'src/renderer/src/components/sidebar/SidebarHeader.test.tsx',
        'src/renderer/src/components/sidebar/SidebarToolbar.test.tsx',
        'src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx',
        'src/renderer/src/components/sidebar/WorktreeOpenInMenu.test.tsx',
        'src/renderer/src/components/sidebar/DeleteWorktreeDialog.host-context-boundary.test.ts',
        'src/renderer/src/components/sidebar/WorktreeCardAgents.send-target.test.tsx',
        'src/renderer/src/components/sidebar/WorktreeTitleInlineRename.test.tsx',
        'src/renderer/src/components/settings/SettingsSidebar.test.tsx',
        'src/renderer/src/components/settings/AgentsPane.test.tsx',
        'src/renderer/src/components/settings/GitPane.test.ts',
        'src/renderer/src/components/settings/CommitMessageAiPane.test.tsx',
        'src/renderer/src/components/settings/RepositorySourceControlAiSection.test.ts',
        'src/renderer/src/components/settings/RepositoryHostSetupsSection.test.tsx',
        'src/renderer/src/components/settings/repository-host-setup-options.test.ts',
        'src/renderer/src/components/settings/host-scoped-setting-scope.test.ts',
        'src/renderer/src/components/settings/ssh-target-draft.test.ts',
        'src/renderer/src/components/settings/ssh-target-remove.test.ts',
        'src/renderer/src/components/settings/provider-account-scope.test.ts'
      ])
    )

    expect(plan.commands).toContainEqual({
      command: 'pnpm',
      args: ['run', 'verify:direct-download-artifacts', '--', '--release-notes=RELEASE_NOTES.md']
    })
  })
})
