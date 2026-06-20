import { describe, expect, it } from 'vitest'

import { makeProject } from './feature-user-story-status-test-project.mjs'
import { main as verifyFeatureUserStoryStatus } from './verify-feature-user-story-status.mjs'

function makeRequiredCsvRow(id) {
  const kind = id.split(':')[0] ?? 'feature'
  return `${id},${kind},${id},"As a user, I can use ${id}.",The code-backed inventory includes ${id} and the app can expose it.,code,manual,Documented,2026-06-19,`
}

const COMPLETE_FIXTURE_IDS = [
  'interaction:workspace-board',
  'interaction:browser',
  'feature-wall:tile-01',
  'feature-wall:tile-02',
  'feature-tip:janus-cli',
  'feature-tip:voice-dictation',
  'contextual-tour:workspace-board',
  'contextual-tour:workspace-agent-sessions',
  'contextual-tour:browser',
  'contextual-tour:tasks',
  'contextual-tour:automations',
  'contextual-tour:floating-workspace',
  'contextual-tour:workspace-creation',
  'right-sidebar:explorer-files',
  'right-sidebar:explorer-search',
  'right-sidebar:vault',
  'right-sidebar:checks',
  'source-control-action:commitMessage',
  'source-control-action:pullRequest',
  'source-control-action:fixChecks',
  'source-control-action:resolveComments',
  'browser-viewport-preset:mobile-s',
  'browser-viewport-preset:desktop',
  'app-icon:classic',
  'app-icon:blue',
  'setup-script-import-provider:superset',
  'setup-script-import-provider:package-manager',
  'left-sidebar-appearance:default',
  'left-sidebar-appearance:tinted',
  'ai-vault-agent:claude',
  'ai-vault-agent:codex',
  'ui-locale:en',
  'ui-locale:zh',
  'github-pr-merge-method:squash',
  'github-pr-merge-method:merge',
  'browser-cookie-import-source:google-chrome',
  'browser-cookie-import-source:brave',
  'browser-cookie-import-source:firefox',
  'browser-cookie-import-source:safari',
  'resumable-agent:claude',
  'resumable-agent:codex',
  'runtime-capability:runtime.status.compat.v1',
  'runtime-capability:project-host-setup.v1',
  'runtime-capability:task-source-context.v1',
  'agent-hook-target:claude',
  'agent-hook-target:codex',
  'forge-provider:gitlab',
  'forge-provider:github',
  'settings-nav:capabilities',
  'settings-nav:setup',
  'settings-section:agents',
  'settings-section:general',
  'tui-agent:claude',
  'tui-agent:codex',
  'tui-agent-thinking-mode:quick',
  'tui-agent-thinking-mode:standard',
  'tui-agent-thinking-mode:deep',
  'task-provider:github',
  'task-provider:gitlab',
  'task-provider:linear',
  'task-provider:jira',
  'workspace-status:completed',
  'workspace-status:in-review',
  'workspace-status:in-progress',
  'workspace-status:todo',
  'worktree-card-property:status',
  'worktree-card-property:unread',
  'worktree-card-property:issue',
  'worktree-card-property:linear-issue',
  'worktree-card-property:pr',
  'worktree-card-property:comment',
  'worktree-card-property:ports',
  'worktree-card-property:inline-agents',
  'open-in-application:vscode',
  'terminal-ligature-mode:auto',
  'terminal-ligature-mode:on',
  'terminal-ligature-mode:off',
  'sidebar-project-order:manual',
  'sidebar-project-order:recent',
  'sidebar-card-layout:detailed',
  'sidebar-card-layout:compact',
  'sidebar-agent-activity-display:compact',
  'sidebar-agent-activity-display:full',
  'sidebar-workspace-group:none',
  'sidebar-workspace-group:workspace-status',
  'sidebar-workspace-group:pr-status',
  'sidebar-workspace-group:repo',
  'keybinding:worktree.quickOpen',
  'keybinding:tab.newTerminal',
  'status-bar:claude',
  'status-bar:ports',
  'onboarding-feature-setup:browserUse',
  'onboarding-feature-setup:computerUse',
  'feature-wall-setup:split-terminal',
  'feature-wall-setup:browser',
  'feature-wall-workflow:workspaces',
  'feature-wall-workflow:tasks',
  'feature-wall-agent-step:statuses',
  'feature-wall-agent-step:usage',
  'feature-wall-workbench-step:terminal',
  'feature-wall-workbench-step:browser',
  'feature-wall-review-step:notes',
  'feature-wall-review-step:ship'
]

describe('verify-feature-user-story-status', () => {
  it('accepts a canonical spreadsheet that covers code-backed feature inventories', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'contextual-tour:workspace-board,contextual-tour,Workspace board tour,"As a user, I can take the workspace board tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:workspace-agent-sessions,contextual-tour,Workspace agent sessions tour,"As a user, I can take the workspace agent sessions tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:browser,contextual-tour,Browser tour,"As a user, I can take the browser tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:tasks,contextual-tour,Tasks tour,"As a user, I can take the tasks tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:automations,contextual-tour,Automations tour,"As a user, I can take the automations tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:floating-workspace,contextual-tour,Floating Workspace tour,"As a user, I can take the Floating Workspace tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'contextual-tour:workspace-creation,contextual-tour,Workspace creation tour,"As a user, I can take the workspace creation tour.",The contextual tour registry includes the tour and persistence can mark it seen,src/shared/contextual-tours.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'source-control-action:commitMessage,source-control-action,Commit message,"As a user, I can configure the Commit message source-control action.",The source-control action registry includes the action and AI settings can resolve it,src/shared/source-control-ai-actions.ts,manual,Documented,2026-06-19,',
        'source-control-action:pullRequest,source-control-action,Pull request,"As a user, I can configure the Pull request source-control action.",The source-control action registry includes the action and AI settings can resolve it,src/shared/source-control-ai-actions.ts,manual,Documented,2026-06-19,',
        'source-control-action:fixChecks,source-control-action,Fix checks,"As a user, I can configure the Fix checks source-control action.",The source-control action registry includes the action and AI settings can resolve it,src/shared/source-control-ai-actions.ts,manual,Documented,2026-06-19,',
        'source-control-action:resolveComments,source-control-action,Resolve comments,"As a user, I can configure the Resolve comments source-control action.",The source-control action registry includes the action and AI settings can resolve it,src/shared/source-control-ai-actions.ts,manual,Documented,2026-06-19,',
        'browser-viewport-preset:mobile-s,browser-viewport-preset,Mobile S,"As a user, I can apply the Mobile S browser viewport preset.",The browser viewport preset registry includes the preset and the browser pane can apply it,src/shared/browser-viewport-presets.ts,manual,Documented,2026-06-19,',
        'browser-viewport-preset:desktop,browser-viewport-preset,Desktop,"As a user, I can apply the Desktop browser viewport preset.",The browser viewport preset registry includes the preset and the browser pane can apply it,src/shared/browser-viewport-presets.ts,manual,Documented,2026-06-19,',
        'app-icon:classic,app-icon,Classic Janus,"As a user, I can select the Classic Janus app icon.",The app icon registry includes the option and settings can persist it,src/shared/app-icon.ts,manual,Documented,2026-06-19,',
        'app-icon:blue,app-icon,Blue Janus,"As a user, I can select the Blue Janus app icon.",The app icon registry includes the option and settings can persist it,src/shared/app-icon.ts,manual,Documented,2026-06-19,',
        'setup-script-import-provider:superset,setup-script-import-provider,Superset setup script import,"As a user, I can import a setup script from a Superset config.",The setup script import provider registry includes the provider and inspection can build a candidate,src/shared/setup-script-import-providers.ts,manual,Documented,2026-06-19,',
        'setup-script-import-provider:package-manager,setup-script-import-provider,Package manager setup script import,"As a user, I can import a setup script from package manager metadata.",The setup script import provider registry includes the provider and inspection can build a candidate,src/shared/setup-script-import-providers.ts,manual,Documented,2026-06-19,',
        'left-sidebar-appearance:default,left-sidebar-appearance,Default sidebar appearance,"As a user, I can use the default left sidebar appearance.",The left sidebar appearance mode registry includes the mode and appearance settings can persist it,src/shared/left-sidebar-appearance.ts,manual,Documented,2026-06-19,',
        'left-sidebar-appearance:tinted,left-sidebar-appearance,Tinted sidebar appearance,"As a user, I can use the tinted left sidebar appearance.",The left sidebar appearance mode registry includes the mode and appearance settings can persist it,src/shared/left-sidebar-appearance.ts,manual,Documented,2026-06-19,',
        'ai-vault-agent:claude,ai-vault-agent,Claude AI Vault sessions,"As a user, I can filter Claude sessions in AI Vault.",The AI Vault agent registry includes the agent and resume commands can be built for it,src/shared/ai-vault-types.ts,manual,Documented,2026-06-19,',
        'ai-vault-agent:codex,ai-vault-agent,Codex AI Vault sessions,"As a user, I can filter Codex sessions in AI Vault.",The AI Vault agent registry includes the agent and resume commands can be built for it,src/shared/ai-vault-types.ts,manual,Documented,2026-06-19,',
        'ui-locale:en,ui-locale,English UI locale,"As a user, I can use the English UI locale.",The supported UI locale registry includes the locale and settings can resolve it,src/shared/ui-locale.ts,manual,Documented,2026-06-19,',
        'ui-locale:zh,ui-locale,Chinese UI locale,"As a user, I can use the Chinese UI locale.",The supported UI locale registry includes the locale and settings can resolve it,src/shared/ui-locale.ts,manual,Documented,2026-06-19,',
        'github-pr-merge-method:squash,github-pr-merge-method,Squash and merge,"As a user, I can squash and merge a GitHub pull request.",The GitHub PR merge-method registry includes the method and hosted review actions can present it,src/shared/github-pr-merge-methods.ts,manual,Documented,2026-06-19,',
        'github-pr-merge-method:merge,github-pr-merge-method,Create merge commit,"As a user, I can create a merge commit for a GitHub pull request.",The GitHub PR merge-method registry includes the method and hosted review actions can present it,src/shared/github-pr-merge-methods.ts,manual,Documented,2026-06-19,',
        'browser-cookie-import-source:google-chrome,browser-cookie-import-source,Google Chrome cookie import,"As a user, I can import cookies from Google Chrome.",The browser cookie import source registry includes the source and platform labels can expose it,src/shared/browser-cookie-import-sources.ts,manual,Documented,2026-06-19,',
        'browser-cookie-import-source:brave,browser-cookie-import-source,Brave cookie import,"As a user, I can import cookies from Brave.",The browser cookie import source registry includes the source and platform labels can expose it,src/shared/browser-cookie-import-sources.ts,manual,Documented,2026-06-19,',
        'browser-cookie-import-source:firefox,browser-cookie-import-source,Firefox cookie import,"As a user, I can import cookies from Firefox.",The browser cookie import labels include Firefox for supported platforms,src/shared/browser-cookie-import-sources.ts,manual,Documented,2026-06-19,',
        'browser-cookie-import-source:safari,browser-cookie-import-source,Safari cookie import,"As a user, I can import cookies from Safari.",The browser cookie import labels include Safari on macOS,src/shared/browser-cookie-import-sources.ts,manual,Documented,2026-06-19,',
        'resumable-agent:claude,resumable-agent,Claude session resume,"As a user, I can resume Claude sessions.",The resumable agent registry includes the agent and resume argv can be built safely,src/shared/agent-session-resume.ts,manual,Documented,2026-06-19,',
        'resumable-agent:codex,resumable-agent,Codex session resume,"As a user, I can resume Codex sessions.",The resumable agent registry includes the agent and resume argv can be built safely,src/shared/agent-session-resume.ts,manual,Documented,2026-06-19,',
        'runtime-capability:runtime.status.compat.v1,runtime-capability,Runtime status compatibility,"As a user, I can connect only to compatible runtimes.",The runtime capability registry advertises the capability and compatibility checks can require it,src/shared/protocol-version.ts,manual,Documented,2026-06-19,',
        'runtime-capability:project-host-setup.v1,runtime-capability,Project host setup runtime capability,"As a user, I can use project-host setup when the runtime supports it.",The runtime capability registry advertises the capability and host setup checks can require it,src/shared/protocol-version.ts,manual,Documented,2026-06-19,',
        'runtime-capability:task-source-context.v1,runtime-capability,Task source context runtime capability,"As a user, I can use task source context when the runtime supports it.",The runtime capability registry advertises the capability and task source flows can require it,src/shared/protocol-version.ts,manual,Documented,2026-06-19,',
        'agent-hook-target:claude,agent-hook-target,Claude managed hooks,"As a user, I can install managed hooks for Claude.",The agent hook target registry includes the agent and hook install telemetry accepts it,src/shared/agent-hook-types.ts,manual,Documented,2026-06-19,',
        'agent-hook-target:codex,agent-hook-target,Codex managed hooks,"As a user, I can install managed hooks for Codex.",The agent hook target registry includes the agent and hook install telemetry accepts it,src/shared/agent-hook-types.ts,manual,Documented,2026-06-19,',
        'forge-provider:gitlab,forge-provider,GitLab hosted reviews,"As a user, I can use GitLab as a hosted review provider.",The forge provider registry includes GitLab and provider detection can select it,src/main/source-control/forge-provider.ts,manual,Documented,2026-06-19,',
        'forge-provider:github,forge-provider,GitHub hosted reviews,"As a user, I can use GitHub as a hosted review provider.",The forge provider registry includes GitHub and provider detection can select it,src/main/source-control/forge-provider.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent-thinking-mode:quick,tui-agent-thinking-mode,Quick thinking mode,"As a user, I can launch a supported CLI agent with Quick thinking mode.",The TUI agent thinking mode registry includes the mode and launch args can apply it,src/shared/tui-agent-thinking.ts,manual,Documented,2026-06-19,',
        'tui-agent-thinking-mode:standard,tui-agent-thinking-mode,Standard thinking mode,"As a user, I can launch a supported CLI agent with Standard thinking mode.",The TUI agent thinking mode registry includes the mode and launch args can apply it,src/shared/tui-agent-thinking.ts,manual,Documented,2026-06-19,',
        'tui-agent-thinking-mode:deep,tui-agent-thinking-mode,Deep thinking mode,"As a user, I can launch a supported CLI agent with Deep thinking mode.",The TUI agent thinking mode registry includes the mode and launch args can apply it,src/shared/tui-agent-thinking.ts,manual,Documented,2026-06-19,',
        'task-provider:github,task-provider,GitHub task provider,"As a user, I can show GitHub in Tasks.",The task provider registry includes GitHub and settings can keep it visible,src/shared/task-providers.ts,manual,Documented,2026-06-19,',
        'task-provider:gitlab,task-provider,GitLab task provider,"As a user, I can show GitLab in Tasks.",The task provider registry includes GitLab and settings can keep it visible,src/shared/task-providers.ts,manual,Documented,2026-06-19,',
        'task-provider:linear,task-provider,Linear task provider,"As a user, I can show Linear in Tasks.",The task provider registry includes Linear and settings can keep it visible,src/shared/task-providers.ts,manual,Documented,2026-06-19,',
        'task-provider:jira,task-provider,Jira task provider,"As a user, I can show Jira in Tasks.",The task provider registry includes Jira and settings can keep it visible,src/shared/task-providers.ts,manual,Documented,2026-06-19,',
        'workspace-status:completed,workspace-status,Done workspace status,"As a user, I can use the Done workspace status.",The default workspace status registry includes Done and workspace grouping can show it,src/shared/workspace-status-defaults.ts,manual,Documented,2026-06-19,',
        'workspace-status:in-review,workspace-status,In review workspace status,"As a user, I can use the In review workspace status.",The default workspace status registry includes In review and workspace grouping can show it,src/shared/workspace-status-defaults.ts,manual,Documented,2026-06-19,',
        'workspace-status:in-progress,workspace-status,In progress workspace status,"As a user, I can use the In progress workspace status.",The default workspace status registry includes In progress and workspace grouping can show it,src/shared/workspace-status-defaults.ts,manual,Documented,2026-06-19,',
        'workspace-status:todo,workspace-status,Todo workspace status,"As a user, I can use the Todo workspace status.",The default workspace status registry includes Todo and workspace grouping can show it,src/shared/workspace-status-defaults.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:status,worktree-card-property,Status card property,"As a user, I can show status metadata on workspace cards.",The default worktree card property registry includes status and normalization preserves it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:unread,worktree-card-property,Unread card property,"As a user, I can show unread metadata on workspace cards.",The default worktree card property registry includes unread and normalization preserves it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:issue,worktree-card-property,GitHub issue card property,"As a user, I can show GitHub issue metadata on workspace cards.",The default worktree card property registry includes issue and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:linear-issue,worktree-card-property,Linear issue card property,"As a user, I can show Linear issue metadata on workspace cards.",The default worktree card property registry includes linear-issue and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:pr,worktree-card-property,Pull request card property,"As a user, I can show pull request metadata on workspace cards.",The default worktree card property registry includes pr and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:comment,worktree-card-property,Comment card property,"As a user, I can show review comment metadata on workspace cards.",The default worktree card property registry includes comment and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:ports,worktree-card-property,Ports card property,"As a user, I can show live port metadata on workspace cards.",The default worktree card property registry includes ports and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'worktree-card-property:inline-agents,worktree-card-property,Inline agents card property,"As a user, I can show inline agent activity on workspace cards.",The default worktree card property registry includes inline-agents and card rendering can expose it,src/shared/worktree-card-properties.ts,manual,Documented,2026-06-19,',
        'open-in-application:vscode,open-in-application,VS Code Open In target,"As a user, I can open a workspace in VS Code.",The default Open In application registry includes VS Code and settings can normalize it,src/shared/open-in-applications.ts,manual,Documented,2026-06-19,',
        'terminal-ligature-mode:auto,terminal-ligature-mode,Auto terminal ligatures,"As a user, I can let Janus Code auto-enable terminal ligatures for known ligature fonts.",The terminal typography settings expose Auto and the resolver enables ligatures only for known ligature fonts,src/renderer/src/components/settings/TerminalTypographyAppearanceSection.tsx,manual,Documented,2026-06-19,',
        'terminal-ligature-mode:on,terminal-ligature-mode,On terminal ligatures,"As a user, I can force terminal ligatures on.",The terminal typography settings expose On and the resolver enables ligatures regardless of font,src/renderer/src/components/settings/TerminalTypographyAppearanceSection.tsx,manual,Documented,2026-06-19,',
        'terminal-ligature-mode:off,terminal-ligature-mode,Off terminal ligatures,"As a user, I can force terminal ligatures off.",The terminal typography settings expose Off and the resolver disables ligatures regardless of font,src/renderer/src/components/settings/TerminalTypographyAppearanceSection.tsx,manual,Documented,2026-06-19,',
        'sidebar-project-order:manual,sidebar-project-order,Manual project order,"As a user, I can arrange projects manually in the sidebar.",The sidebar workspace options expose Manual project ordering and persisted UI can keep it selected,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-project-order:recent,sidebar-project-order,Recent project order,"As a user, I can order projects by recent workspace activity in the sidebar.",The sidebar workspace options expose Recent project ordering and persisted UI can keep it selected,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-card-layout:detailed,sidebar-card-layout,Detailed workspace cards,"As a user, I can show detailed workspace cards in the sidebar.",The sidebar workspace options expose Detailed card layout and persisted settings can keep compact cards disabled,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-card-layout:compact,sidebar-card-layout,Compact workspace cards,"As a user, I can show compact workspace cards in the sidebar.",The sidebar workspace options expose Compact card layout and persisted settings can keep compact cards enabled,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-agent-activity-display:compact,sidebar-agent-activity-display,Compact agent activity,"As a user, I can show compact inline agent activity on workspace cards.",The sidebar workspace options expose Compact agent activity display and persisted UI can keep it selected,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-agent-activity-display:full,sidebar-agent-activity-display,Full agent activity,"As a user, I can show full inline agent activity on workspace cards.",The sidebar workspace options expose Full agent activity display and persisted UI can keep it selected,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-workspace-group:none,sidebar-workspace-group,Ungrouped workspaces,"As a user, I can show ungrouped workspace cards.",The sidebar workspace options expose None grouping and row building emits pinned plus all sections,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-workspace-group:workspace-status,sidebar-workspace-group,Status workspace grouping,"As a user, I can group workspaces by status.",The sidebar workspace options expose Status grouping and row building emits status sections,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-workspace-group:pr-status,sidebar-workspace-group,PR workspace grouping,"As a user, I can group workspaces by PR state.",The sidebar workspace options expose PR grouping and row building keeps pinned workspaces in regular PR groups,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'sidebar-workspace-group:repo,sidebar-workspace-group,Project workspace grouping,"As a user, I can group workspaces by project.",The sidebar workspace options expose Project grouping and row building emits project sections,src/renderer/src/components/sidebar/sidebar-workspace-options-menu-options.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:usage,feature-wall-agent-step,Usage,"As a user, I can tour Usage in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workbench-step:terminal,feature-wall-workbench-step,Terminal,"As a user, I can tour Terminal in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workbench-step:browser,feature-wall-workbench-step,Browser,"As a user, I can tour Browser in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-review-step:notes,feature-wall-review-step,Notes,"As a user, I can tour Notes in the feature wall.",The review step registry includes the step and completion can track it,src/shared/review-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-review-step:ship,feature-wall-review-step,Ship with AI,"As a user, I can tour Ship with AI in the feature wall.",The review step registry includes the step and completion can track it,src/shared/review-steps.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(0)
  })

  it('rejects missing rows for persisted feature interactions', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects duplicate spreadsheet ids', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:workspace-board,interaction,Workspace board duplicate,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature education tips', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for right sidebar routes', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for settings navigation groups', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for settings sections', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for supported CLI agents', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for keyboard shortcut actions', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default status bar items', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for onboarding feature setup items', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall setup steps', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall workflows', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall agent steps', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall workbench steps', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:usage,feature-wall-agent-step,Usage,"As a user, I can tour Usage in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workbench-step:terminal,feature-wall-workbench-step,Terminal,"As a user, I can tour Terminal in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall review steps', async () => {
    const root = makeProject({
      csvRows: [
        'interaction:workspace-board,interaction,Workspace board,"As a user, I can open the workspace board.",The board opens and records interaction state,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'interaction:browser,interaction,In-app browser,"As a user, I can open the in-app browser.",The browser opens in the active workspace,src/shared/feature-interaction-catalog.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-01,feature-wall,Parallel workspace orchestration,"As a user, I can run isolated workspace tasks.",The feature wall advertises the workflow with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-wall:tile-02,feature-wall,Ghostty-class terminal,"As a user, I can use terminal splits and scrollback.",The feature wall advertises terminal behavior with media,src/shared/feature-wall-tiles.ts,manual,Documented,2026-06-19,',
        'feature-tip:janus-cli,feature-tip,Janus CLI tip,"As a user, I can discover the Janus CLI setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'feature-tip:voice-dictation,feature-tip,Voice Dictation tip,"As a user, I can discover the voice dictation setup tip.",The tip appears until completed or seen,src/shared/feature-tips.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-files,right-sidebar,Files explorer,"As a user, I can open the file explorer panel.",The files view is the default explorer route,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:explorer-search,right-sidebar,Search explorer,"As a user, I can open the search panel.",Legacy search routes normalize to the explorer search view,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:vault,right-sidebar,AI Vault,"As a user, I can open the AI Vault panel.",The vault route renders the vault panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'right-sidebar:checks,right-sidebar,Checks,"As a user, I can open the Checks panel.",The checks route renders the checks panel,src/renderer/src/store/right-sidebar-route.ts,manual,Documented,2026-06-19,',
        'settings-nav:capabilities,settings-nav,AI Capabilities settings,"As a user, I can browse AI capability settings.",The settings group appears when matching sections exist,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-nav:setup,settings-nav,Set Up settings,"As a user, I can browse setup settings.",The setup group remains available in settings navigation,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:agents,settings-section,Agents settings,"As a user, I can open Agents settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'settings-section:general,settings-section,General settings,"As a user, I can open General settings.",The settings section is rendered by Settings.tsx,src/renderer/src/components/settings/Settings.tsx,manual,Documented,2026-06-19,',
        'tui-agent:claude,tui-agent,Claude,"As a user, I can launch Claude as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'tui-agent:codex,tui-agent,Codex,"As a user, I can launch Codex as a supported CLI agent.",The agent has a detect command and launch configuration,src/shared/tui-agent-config.ts,manual,Documented,2026-06-19,',
        'keybinding:worktree.quickOpen,keybinding,Go to File,"As a user, I can trigger Go to File from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'keybinding:tab.newTerminal,keybinding,New terminal tab,"As a user, I can trigger New terminal tab from the keyboard.",The keybinding registry defines the action title group scope and defaults,src/shared/keybindings.ts,manual,Documented,2026-06-19,',
        'status-bar:claude,status-bar,Claude status bar item,"As a user, I can show Claude usage in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'status-bar:ports,status-bar,Ports status bar item,"As a user, I can show workspace ports in the status bar.",The default status bar registry includes the item and UI state can toggle it,src/shared/status-bar-defaults.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:browserUse,onboarding-feature-setup,Agent Browser Use,"As a user, I can select Agent Browser Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'onboarding-feature-setup:computerUse,onboarding-feature-setup,Computer Use,"As a user, I can select Computer Use during onboarding.",The onboarding feature setup registry includes the item and the setup runner handles selection,src/renderer/src/components/onboarding/onboarding-feature-setup.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:split-terminal,feature-wall-setup,Split a terminal,"As a user, I can complete the split terminal setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-setup:browser,feature-wall-setup,Use Janus Code browser,"As a user, I can complete the browser setup step.",The feature wall setup registry includes the step and progress can mark it complete,src/shared/feature-wall-setup-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:workspaces,feature-wall-workflow,Workspaces,"As a user, I can tour Workspaces in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-workflow:tasks,feature-wall-workflow,Tasks,"As a user, I can tour Tasks in the feature wall.",The feature wall workflow registry includes the workflow and completion can track it,src/shared/feature-wall-workflows.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:statuses,feature-wall-agent-step,Agent Visibility,"As a user, I can tour Agent Visibility in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-agent-step:usage,feature-wall-agent-step,Usage,"As a user, I can tour Usage in the feature wall.",The agents step registry includes the step and completion can track it,src/shared/agents-orchestration-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workbench-step:terminal,feature-wall-workbench-step,Terminal,"As a user, I can tour Terminal in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-workbench-step:browser,feature-wall-workbench-step,Browser,"As a user, I can tour Browser in the feature wall.",The workbench step registry includes the step and completion can track it,src/shared/workbench-steps.ts,manual,Documented,2026-06-19,',
        'feature-wall-review-step:notes,feature-wall-review-step,Notes,"As a user, I can tour Notes in the feature wall.",The review step registry includes the step and completion can track it,src/shared/review-steps.ts,manual,Documented,2026-06-19,'
      ]
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for source-control actions', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'source-control-action:resolveComments'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for browser viewport presets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'browser-viewport-preset:desktop').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for app icon options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'app-icon:blue').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for setup script import providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'setup-script-import-provider:package-manager'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for left sidebar appearance modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'left-sidebar-appearance:tinted').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for AI Vault agents', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'ai-vault-agent:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for supported UI locales', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'ui-locale:zh').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for GitHub PR merge methods', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'github-pr-merge-method:merge').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for browser cookie import sources', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'browser-cookie-import-source:brave').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for resumable agents', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'resumable-agent:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime capabilities', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'runtime-capability:project-host-setup.v1'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent hook targets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'agent-hook-target:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for forge providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'forge-provider:github').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for TUI agent thinking modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'tui-agent-thinking-mode:deep').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for task providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'task-provider:jira').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default workspace statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'workspace-status:todo').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default worktree card properties', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'worktree-card-property:inline-agents'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for default Open In applications', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'open-in-application:vscode').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for terminal ligature modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'terminal-ligature-mode:off').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar project order options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-project-order:recent').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar card layout options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-card-layout:compact').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar agent activity display options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'sidebar-agent-activity-display:full'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for sidebar workspace grouping options', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'sidebar-workspace-group:repo').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })
})
