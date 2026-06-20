import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export function writeFeatureUserStoryStatusProjectCoreFiles({ root, csvRows }) {
  const sharedDir = path.join(root, 'src', 'shared')
  const componentsDir = path.join(root, 'src', 'renderer', 'src', 'components')
  const agentWorkspaceDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'agent-workspace'
  )
  const automationsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'automations')
  const browserPaneDir = path.join(root, 'src', 'renderer', 'src', 'components', 'browser-pane')
  const cmdJDir = path.join(root, 'src', 'renderer', 'src', 'components', 'cmd-j')
  const editorDir = path.join(root, 'src', 'renderer', 'src', 'components', 'editor')
  const githubDir = path.join(root, 'src', 'renderer', 'src', 'components', 'github')
  const settingsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'settings')
  const sidebarDir = path.join(root, 'src', 'renderer', 'src', 'components', 'sidebar')
  const terminalQuickCommandsDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'terminal-quick-commands'
  )
  const onboardingDir = path.join(root, 'src', 'renderer', 'src', 'components', 'onboarding')
  const storeDir = path.join(root, 'src', 'renderer', 'src', 'store')
  const mainAmpDir = path.join(root, 'src', 'main', 'amp')
  const mainAntigravityDir = path.join(root, 'src', 'main', 'antigravity')
  const mainClaudeDir = path.join(root, 'src', 'main', 'claude')
  const mainCodexDir = path.join(root, 'src', 'main', 'codex')
  const mainCommandCodeDir = path.join(root, 'src', 'main', 'command-code')
  const mainCopilotDir = path.join(root, 'src', 'main', 'copilot')
  const mainCursorDir = path.join(root, 'src', 'main', 'cursor')
  const mainDroidDir = path.join(root, 'src', 'main', 'droid')
  const mainGeminiDir = path.join(root, 'src', 'main', 'gemini')
  const mainGrokDir = path.join(root, 'src', 'main', 'grok')
  const mainHermesDir = path.join(root, 'src', 'main', 'hermes')
  const mainOpenCodeDir = path.join(root, 'src', 'main', 'opencode')
  const mainGitDir = path.join(root, 'src', 'main', 'git')
  const sourceControlDir = path.join(root, 'src', 'main', 'source-control')
  const gitlabDir = path.join(root, 'src', 'main', 'gitlab')
  const referenceDir = path.join(root, 'docs', 'reference')
  mkdirSync(sharedDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })
  mkdirSync(agentWorkspaceDir, { recursive: true })
  mkdirSync(automationsDir, { recursive: true })
  mkdirSync(browserPaneDir, { recursive: true })
  mkdirSync(cmdJDir, { recursive: true })
  mkdirSync(editorDir, { recursive: true })
  mkdirSync(githubDir, { recursive: true })
  mkdirSync(settingsDir, { recursive: true })
  mkdirSync(sidebarDir, { recursive: true })
  mkdirSync(terminalQuickCommandsDir, { recursive: true })
  mkdirSync(onboardingDir, { recursive: true })
  mkdirSync(storeDir, { recursive: true })
  mkdirSync(mainAmpDir, { recursive: true })
  mkdirSync(mainAntigravityDir, { recursive: true })
  mkdirSync(mainClaudeDir, { recursive: true })
  mkdirSync(mainCodexDir, { recursive: true })
  mkdirSync(mainCommandCodeDir, { recursive: true })
  mkdirSync(mainCopilotDir, { recursive: true })
  mkdirSync(mainCursorDir, { recursive: true })
  mkdirSync(mainDroidDir, { recursive: true })
  mkdirSync(mainGeminiDir, { recursive: true })
  mkdirSync(mainGrokDir, { recursive: true })
  mkdirSync(mainHermesDir, { recursive: true })
  mkdirSync(mainOpenCodeDir, { recursive: true })
  mkdirSync(mainGitDir, { recursive: true })
  mkdirSync(sourceControlDir, { recursive: true })
  mkdirSync(gitlabDir, { recursive: true })
  mkdirSync(referenceDir, { recursive: true })

  writeFileSync(
    path.join(sharedDir, 'feature-interaction-catalog.ts'),
    `
export type FeatureInteractionId = 'workspace-board' | 'browser'
export const FEATURE_INTERACTIONS = [
  { id: 'workspace-board', interaction: 'workspace board opened' },
  { id: 'browser', interaction: 'in-app browser opened' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(agentWorkspaceDir, 'agent-terminal-visibility.ts'),
    `
export const AGENT_TERMINAL_REVEAL_REASONS = [
  'right-panel',
  'debug-button',
  'failure',
  'keyboard-shortcut',
  'browser',
  'workbench',
  'approval'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-wall-tiles.ts'),
    `
export const FEATURE_WALL_TILES = [
  { id: 'tile-01', title: 'Parallel workspace orchestration' },
  { id: 'tile-02', title: 'Ghostty-class terminal' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'contextual-tours.ts'),
    `
export const CONTEXTUAL_TOURS = [
  { id: 'workspace-board', steps: [] },
  { id: 'workspace-agent-sessions', steps: [] },
  { id: 'browser', steps: [] },
  { id: 'tasks', steps: [] },
  { id: 'automations', steps: [] },
  { id: 'floating-workspace', steps: [] },
  { id: 'workspace-creation', steps: [] }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-wall-workflows.ts'),
    `
export const FEATURE_WALL_WORKFLOWS = [
  { id: 'workspaces', title: 'Workspaces' },
  { id: 'tasks', title: 'Tasks' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'workbench-steps.ts'),
    `
export const WORKBENCH_STEPS = [
  { id: 'terminal', name: 'Terminal' },
  { id: 'browser', name: 'Browser' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'workspace-source.ts'),
    `
export const WORKSPACE_SOURCE_VALUES = [
  'command_palette',
  'sidebar',
  'shortcut',
  'drag_drop',
  'onboarding',
  'terminal_context_menu',
  'unknown'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'app-icon.ts'),
    `
export const APP_ICON_OPTIONS = [
  { id: 'classic', label: 'Classic Janus' },
  { id: 'blue', label: 'Blue Janus' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(automationsDir, 'AutomationCustomCronPanel.tsx'),
    `
export const AUTOMATION_CRON_FIELD_LABELS = ['Minute', 'Hour', 'Day', 'Month', 'Weekday'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'SettingsConstants.ts'),
    `
export const SCROLLBACK_PRESETS_MB = [10, 25, 50, 100, 250] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'mobile-auto-restore-options.ts'),
    `
export const AUTO_RESTORE_FIT_OPTIONS = [
  { value: 'indefinite', ms: null },
  { value: '60s', ms: 60_000 },
  { value: '5m', ms: 5 * 60_000 },
  { value: '30m', ms: 30 * 60_000 }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(editorDir, 'markdown-preview-controls.ts'),
    `
const MARKDOWN_EDIT_VIEW_MODES = ['source', 'rich'] as const
const CODE_EDIT_TOGGLE_MODES = ['edit', 'changes'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'ai-vault-types.ts'),
    `
export const AI_VAULT_AGENTS = [
  'claude',
  'codex'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'execution-host-registry.ts'),
    `
export type ExecutionHostHealth =
  | 'local'
  | 'available'
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'star-nag-telemetry.ts'),
    `
export const STAR_NAG_OUTCOMES = [
  'shown',
  'dismissed',
  'disabled',
  'star_attempted',
  'star_succeeded',
  'star_failed',
  'opened_web',
  'already_starred_suppressed'
] as const
export const STAR_NAG_PROMPT_SOURCES = ['threshold', 'force_show'] as const
export const STAR_NAG_PROMPT_MODES = ['gh', 'web'] as const
export const STAR_NAG_AGENT_BUCKETS = ['0-34', '35-69', '70-139', '140-279', '280+'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(githubDir, 'github-issue-close-reasons.tsx'),
    `
export const CLOSE_ISSUE_REASONS = [
  { reason: 'completed', label: 'Close as completed' },
  { reason: 'not_planned', label: 'Close as not planned' },
  { reason: 'duplicate', label: 'Close as duplicate' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agent-name-token-match.ts'),
    `
export const AGENT_NAMES = [
  'claude',
  'codex'
]
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainGitDir, 'huge-folder-ignore.ts'),
    `
const KNOWN_HUGE_FOLDER_NAMES = ['node_modules', '.next'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainClaudeDir, 'hook-settings.ts'),
    `
export const CLAUDE_EVENTS = [
  { eventName: 'UserPromptSubmit', definition: { hooks: [{ type: 'command', command: '' }] } },
  { eventName: 'Stop', definition: { hooks: [{ type: 'command', command: '' }] } }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainCopilotDir, 'hook-service.ts'),
    `
const COPILOT_EVENTS = [
  'SessionStart',
  // Why: Copilot's docs can include apostrophes near this list.
  'Stop'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainGeminiDir, 'hook-service.ts'),
    `
const GEMINI_EVENTS = ['BeforeAgent', 'AfterAgent'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainOpenCodeDir, 'hook-service.ts'),
    `
function getOpenCodePluginSource(): string {
  return [
    'if (event.type === "message.updated") {}',
    'if (event.type === "session.idle" || event.type === "session.error") {}'
  ].join('\\n')
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agent-hook-endpoint-file.ts'),
    `
export const AGENT_HOOK_ENDPOINT_FILE_NAMES = ['endpoint.env', 'endpoint.cmd'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'runtime-porting-domains.ts'),
    `
export const RUNTIME_PORTING_DOMAINS = [
  { id: 'runtime-status-diagnostics', boundary: 'runtime-rpc', disposition: 'first-slice' },
  { id: 'pty-lifecycle', boundary: 'host-service', disposition: 'native-candidate' },
  { id: 'process-supervision', boundary: 'host-service', disposition: 'native-candidate' },
  { id: 'filesystem-workspace-scanning', boundary: 'host-service', disposition: 'native-candidate' },
  { id: 'browser-workbench', boundary: 'electron-host', disposition: 'retain-electron' },
  { id: 'app-shell', boundary: 'electron-host', disposition: 'retain-electron' },
  { id: 'provider-review-integrations', boundary: 'runtime-rpc', disposition: 'retain-electron' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sourceControlDir, 'forge-provider.ts'),
    `
const gitLabForgeProvider = { id: 'gitlab' }
const gitHubForgeProvider = { id: 'github' }

export const FORGE_PROVIDERS = [
  gitLabForgeProvider,
  gitHubForgeProvider
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'task-providers.ts'),
    `
export const TASK_PROVIDERS = [
  'github',
  'gitlab',
  'linear',
  'jira'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'open-in-applications.ts'),
    `
export const DEFAULT_OPEN_IN_APPLICATIONS = [
  { id: 'vscode', label: 'VS Code', command: 'code' }
]
`,
    'utf8'
  )
  writeFileSync(
    path.join(onboardingDir, 'onboarding-feature-setup.ts'),
    `
export const ONBOARDING_FEATURE_SETUP_IDS = [
  'browserUse',
  'computerUse'
]
`,
    'utf8'
  )
  writeFileSync(
    path.join(sidebarDir, 'sidebar-workspace-options-menu-options.ts'),
    `
export const PROJECT_ORDER_OPTIONS = [
  { id: 'manual', label: 'Manual' },
  { id: 'recent', label: 'Recent' }
] as const

export const CARD_LAYOUT_OPTIONS = [
  { id: 'detailed', label: 'Detailed' },
  { id: 'compact', label: 'Compact' }
] as const

export const AGENT_ACTIVITY_DISPLAY_OPTIONS = [
  { id: 'compact', label: 'Compact' },
  { id: 'full', label: 'Full list' }
] as const

export const GROUP_BY_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'workspace-status', label: 'Status' },
  { id: 'pr-status', label: 'PR' },
  { id: 'repo', label: 'Project' }
] as const

export const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'smart', label: 'Agent Activity' },
  { id: 'recent', label: 'Recent' },
  { id: 'repo', label: 'Project' },
  { id: 'manual', label: 'Manual' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(referenceDir, 'janus-feature-user-story-status.csv'),
    `${[
      [
        'id',
        'kind',
        'feature',
        'user_story',
        'expected_behavior',
        'code_evidence',
        'test_evidence',
        'status',
        'last_tested',
        'defects'
      ].join(','),
      ...csvRows
    ].join('\n')}\n`,
    'utf8'
  )
}
