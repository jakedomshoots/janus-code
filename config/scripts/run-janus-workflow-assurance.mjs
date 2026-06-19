#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const vitestFiles = [
  'config/scripts/computer-use-smoke.test.mjs',
  'config/scripts/computer-e2e-workflow.test.mjs',
  'config/scripts/electron-vite-renderer-chunks.test.mjs',
  'config/scripts/janus-workflow-assurance-suite.test.mjs',
  'config/scripts/release-perf-scorecard.test.mjs',
  'config/scripts/verify-direct-download-artifacts.test.mjs',
  'src/main/computer/macos-native-provider-transport.test.ts',
  'src/main/startup/configure-process.test.ts',
  'src/renderer/src/components/agent-workspace/AgentComposer.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentComposer.draft-agent.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentComposer.permission-mode.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx',
  'src/renderer/src/components/agent-workspace/agent-composer-submit.test.ts',
  'src/renderer/src/components/agent-workspace/agent-composer-model-discovery.test.tsx',
  'src/renderer/src/components/agent-workspace/agent-composer-slash-command-model.test.ts',
  'src/renderer/src/lib/agent-picker-search.test.ts',
  'src/renderer/src/lib/launch-agent-in-new-tab.test.ts',
  'src/renderer/src/components/tab-bar/QuickLaunchButton.test.ts',
  'src/renderer/src/components/status-bar/status-bar-provider-visibility.test.ts',
  'src/renderer/src/components/status-bar/status-bar-provider-menu-focus.test.tsx',
  'src/renderer/src/components/agent-workspace/agent-terminal-visibility.test.ts',
  'src/renderer/src/components/agent-workspace/AgentTerminalDrawer.test.tsx',
  'src/renderer/src/components/agent-workspace/agent-workspace-browser-tab-session.test.ts',
  'src/renderer/src/components/agent-workspace/agent-browser-workbench-tabs.test.ts',
  'src/renderer/src/components/agent-workspace/AgentBrowserWorkbenchSurface.test.tsx',
  'src/renderer/src/components/browser-pane/BrowserPaneOverlayLayer.test.tsx',
  'src/renderer/src/components/browser-pane/BrowserAddressBar.test.tsx',
  'src/renderer/src/components/tab-bar/BrowserTab.test.tsx',
  'src/renderer/src/components/terminal-pane/focus-terminal-pane-event.test.ts',
  'src/renderer/src/components/terminal-pane/terminal-quick-command-dispatch.test.ts',
  'src/renderer/src/components/right-sidebar/FileExplorer.test.tsx',
  'src/renderer/src/components/right-sidebar/file-explorer-runtime-owner-boundary.test.ts',
  'src/renderer/src/components/right-sidebar/FileExplorerVirtualRowsAddProject.test.tsx',
  'src/renderer/src/components/right-sidebar/SearchResultItems.test.tsx',
  'src/renderer/src/components/quick-open-search.test.ts',
  'src/renderer/src/components/quick-open-file-list.test.ts',
  'src/renderer/src/lib/worktree-palette-search.test.ts',
  'src/renderer/src/lib/browser-palette-search.test.ts',
  'src/renderer/src/components/cmd-j/palette-results.test.ts',
  'src/renderer/src/components/worktree-jump-palette-source-context-boundary.test.ts',
  'src/renderer/src/components/editor/EditorContent.test.tsx',
  'src/renderer/src/components/editor/NotesSendMenu.test.tsx',
  'src/renderer/src/components/tab-bar/EditorFileTab.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentReviewPanel.test.tsx',
  'src/renderer/src/components/agent-workspace/AgentDiffPanel.test.tsx',
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
  'src/renderer/src/components/sidebar/SidebarNav.test.tsx',
  'src/renderer/src/components/sidebar/SidebarToolbar.test.tsx',
  'src/renderer/src/components/sidebar/AddRepoHostSelector.test.tsx',
  'src/renderer/src/components/sidebar/WorktreeCard.quick-actions.test.tsx',
  'src/renderer/src/components/sidebar/WorktreeOpenInMenu.test.tsx',
  'src/renderer/src/components/sidebar/DeleteWorktreeDialog.host-context-boundary.test.ts',
  'src/renderer/src/components/sidebar/WorktreeCardAgents.send-target.test.tsx',
  'src/renderer/src/components/sidebar/WorktreeTitleInlineRename.test.tsx',
  'src/renderer/src/components/sidebar/useAddRepoServerPathFlow.test.ts',
  'src/renderer/src/components/sidebar/useWorkspaceBoardPanel.test.tsx',
  'src/renderer/src/components/sidebar/smart-sort.test.ts',
  'src/renderer/src/components/sidebar/visible-worktrees.test.ts',
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
