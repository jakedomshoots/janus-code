import { writeFileSync } from 'node:fs'
import path from 'node:path'

export function writeFeatureUserStoryStatusProjectRuntimeFiles({ root, csvRows: _csvRows }) {
  const sharedDir = path.join(root, 'src', 'shared')
  const _componentsDir = path.join(root, 'src', 'renderer', 'src', 'components')
  const _agentWorkspaceDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'agent-workspace'
  )
  const automationsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'automations')
  const _browserPaneDir = path.join(root, 'src', 'renderer', 'src', 'components', 'browser-pane')
  const cmdJDir = path.join(root, 'src', 'renderer', 'src', 'components', 'cmd-j')
  const _editorDir = path.join(root, 'src', 'renderer', 'src', 'components', 'editor')
  const _githubDir = path.join(root, 'src', 'renderer', 'src', 'components', 'github')
  const settingsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'settings')
  const _sidebarDir = path.join(root, 'src', 'renderer', 'src', 'components', 'sidebar')
  const terminalQuickCommandsDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'terminal-quick-commands'
  )
  const _onboardingDir = path.join(root, 'src', 'renderer', 'src', 'components', 'onboarding')
  const storeDir = path.join(root, 'src', 'renderer', 'src', 'store')
  const _mainAmpDir = path.join(root, 'src', 'main', 'amp')
  const mainAntigravityDir = path.join(root, 'src', 'main', 'antigravity')
  const _mainClaudeDir = path.join(root, 'src', 'main', 'claude')
  const _mainCodexDir = path.join(root, 'src', 'main', 'codex')
  const mainCommandCodeDir = path.join(root, 'src', 'main', 'command-code')
  const _mainCopilotDir = path.join(root, 'src', 'main', 'copilot')
  const _mainCursorDir = path.join(root, 'src', 'main', 'cursor')
  const mainDroidDir = path.join(root, 'src', 'main', 'droid')
  const _mainGeminiDir = path.join(root, 'src', 'main', 'gemini')
  const _mainGrokDir = path.join(root, 'src', 'main', 'grok')
  const mainHermesDir = path.join(root, 'src', 'main', 'hermes')
  const _mainOpenCodeDir = path.join(root, 'src', 'main', 'opencode')
  const _mainGitDir = path.join(root, 'src', 'main', 'git')
  const _sourceControlDir = path.join(root, 'src', 'main', 'source-control')
  const gitlabDir = path.join(root, 'src', 'main', 'gitlab')
  const _referenceDir = path.join(root, 'docs', 'reference')

  writeFileSync(
    path.join(sharedDir, 'feature-interaction-usage-buckets.ts'),
    `
export const FEATURE_INTERACTION_USAGE_BUCKETS = [
  'count_1',
  'count_2',
  'count_3_4',
  'count_5_9',
  'count_10_19',
  'count_20_49',
  'count_50_99',
  'count_100_199',
  'count_200_499',
  'count_500_999',
  'count_1000_plus'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'constants.ts'),
    `
export const REPO_COLORS = [
  '#737373',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#8b5cf6',
  '#ec4899'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-education-telemetry.ts'),
    `
export const FEATURE_EDUCATION_SOURCES = [
  'workspace_board_visible',
  'workspace_agent_sessions_visible',
  'browser_visible',
  'tasks_open',
  'automations_open',
  'floating_workspace_visible',
  'workspace_creation_visible',
  'workspace_creation_modal',
  'setup_guide_parallel_work',
  'unknown'
] as const

export const CONTEXTUAL_TOUR_OUTCOMES = ['completed', 'skipped', 'cancelled'] as const

export const TERMINAL_PANE_SPLIT_SOURCES = [
  'contextual_tour',
  'keyboard',
  'context_menu',
  'command',
  'unknown'
] as const

export const SETUP_GUIDE_SOURCES = [
  'sidebar',
  'contextual_tour',
  'settings',
  'feature_wall',
  'help_menu',
  'unknown'
] as const

export const SETUP_GUIDE_CLOSE_OUTCOMES = ['completed', 'dismissed', 'interrupted'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-wall-setup-steps.ts'),
    `
export const FEATURE_WALL_SETUP_STEPS = [
  { id: 'split-terminal', name: 'Split a terminal' },
  { id: 'browser', name: 'Use Janus Code browser' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agents-orchestration-steps.ts'),
    `
export const AGENTS_STEPS = [
  { id: 'statuses', name: 'Visibility' },
  { id: 'usage', name: 'Usage' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'source-control-ai-actions.ts'),
    `
export const SOURCE_CONTROL_TEXT_ACTION_IDS = [
  'commitMessage',
  'pullRequest'
] as const

export const SOURCE_CONTROL_LAUNCH_ACTION_IDS = [
  'fixChecks',
  'resolveComments'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'browser-viewport-presets.ts'),
    `
export const BROWSER_VIEWPORT_PRESETS = [
  { id: 'mobile-s', label: 'Mobile S', width: 320, height: 568 },
  { id: 'desktop', label: 'Desktop', width: 1920, height: 1080 }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(automationsDir, 'AutomationSchedulePicker.tsx'),
    `
export const AUTOMATION_SCHEDULE_PRESET_OPTIONS = [
  ['hourly', 'Hourly'],
  ['daily', 'Daily'],
  ['weekdays', 'Weekdays'],
  ['weekly', 'Weekly'],
  ['custom', 'Custom cron']
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(cmdJDir, 'palette-results.ts'),
    `
const EMPTY_STATE_ACTION_IDS = ['add-project', 'create-workspace'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'VoiceDictationSettingsSection.tsx'),
    `
const voiceDictationModes = ['toggle', 'hold'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(terminalQuickCommandsDir, 'terminal-quick-command-agent-options.ts'),
    `
const QUICK_COMMAND_AGENT_PRESENTATION_ORDER = [
  'claude',
  'codex',
  'gemini',
  'copilot',
  'opencode',
  'pi',
  'omp',
  'cursor',
  'droid',
  'command-code',
  'openclaude'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'left-sidebar-appearance.ts'),
    `
export const LEFT_SIDEBAR_APPEARANCE_MODES = [
  'default',
  'tinted'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'execution-host.ts'),
    `
export type ExecutionHostKind = 'local' | 'ssh' | 'runtime'
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'nested-repo-telemetry.ts'),
    `
export const NESTED_REPO_TELEMETRY_SURFACES = ['onboarding', 'sidebar'] as const
export const NESTED_REPO_TELEMETRY_RUNTIME_KINDS = ['local', 'runtime', 'ssh'] as const
export const NESTED_REPO_SCAN_RESULTS = [
  'review_shown',
  'git_repo',
  'no_nested_repos',
  'scan_failed'
] as const
export const NESTED_REPO_IMPORT_ACTIONS = ['import_group', 'import_separate', 'back'] as const
export const NESTED_REPO_IMPORT_OUTCOMES = ['success', 'partial_failure', 'failed'] as const
export const NESTED_REPO_COUNT_BUCKETS = ['0', '1', '2-3', '4-7', '8-15', '16+'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'github-pr-merge-methods.ts'),
    `
export const GITHUB_PR_MERGE_METHODS = [
  'squash',
  'merge'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'browser-screencast-protocol.ts'),
    `
const METADATA_KEYS = [
  'offsetTop',
  'pageScaleFactor'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'base-ref-search-result.ts'),
    `
const LEGACY_REMOTE_REF_PREFIXES = ['origin/', 'upstream/']
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainAntigravityDir, 'hook-service.ts'),
    `
const ANTIGRAVITY_EVENTS = [
  {
    eventName: 'PreInvocation',
    schema: 'direct',
    windowsWrapperFileName: 'antigravity-pre-invocation.cmd'
  },
  { eventName: 'Stop', schema: 'direct', windowsWrapperFileName: 'antigravity-stop.cmd' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainCommandCodeDir, 'hook-service.ts'),
    `
const COMMAND_CODE_EVENTS = [
  { eventName: 'PreToolUse', definition: { matcher: '.*', hooks: [{ type: 'command', command: '' }] } },
  { eventName: 'Stop', definition: { hooks: [{ type: 'command', command: '' }] } }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainDroidDir, 'hook-service.ts'),
    `
const DROID_EVENTS = [
  { eventName: 'SessionStart', definition: { hooks: [{ type: 'command', command: '' }] } },
  { eventName: 'Stop', definition: { hooks: [{ type: 'command', command: '' }] } }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainHermesDir, 'hook-service.ts'),
    `
const HERMES_EVENTS = [
  'on_session_start',
  'on_session_end'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'linear-agent-access.ts'),
    `
export const LINEAR_ERROR_CODES = [
  'linear_not_connected',
  'linear_issue_required',
  'linear_no_linked_issue',
  'linear_current_ambiguous',
  'linear_issue_not_found',
  'linear_workspace_ambiguous',
  'linear_invalid_workspace',
  'linear_invalid_state',
  'linear_invalid_assignee',
  'linear_invalid_label',
  'linear_invalid_parent',
  'linear_invalid_project',
  'linear_team_required',
  'linear_invalid_url',
  'linear_body_too_large',
  'linear_invalid_write_id',
  'linear_write_failed',
  'linear_write_unconfirmed',
  'linear_rate_limited',
  'linear_timeout',
  'linear_permission_denied',
  'linear_auth_expired',
  'linear_network_error',
  'linear_partial'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'runtime-status-enum-values.ts'),
    `
export const VALID_RUNTIME_GRAPH_STATUSES = ['ready', 'reloading', 'unavailable'] as const
export const VALID_RUNTIME_HOST_PLATFORMS = ['darwin', 'linux', 'win32'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(gitlabDir, 'project-ref-parser.ts'),
    `
export const DEFAULT_GITLAB_HOSTS = ['gitlab.com'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'tui-agent-thinking.ts'),
    `
export const TUI_AGENT_THINKING_MODES = [
  'quick',
  'standard',
  'deep'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'worktree-card-properties.ts'),
    `
const FIXED_WORKTREE_CARD_PROPERTIES = ['status', 'unread']

export const DEFAULT_WORKTREE_CARD_PROPERTIES = [
  ...FIXED_WORKTREE_CARD_PROPERTIES,
  'issue',
  'linear-issue',
  'pr',
  'comment',
  'ports',
  'inline-agents'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'status-bar-defaults.ts'),
    `
export const DEFAULT_STATUS_BAR_ITEMS = [
  'claude',
  'ports'
]
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'TerminalTypographyAppearanceSection.tsx'),
    `
export function TerminalTypographyAppearanceSection({ settings, updateSettings }) {
  return (
    <SettingsSegmentedControl
      value={settings.terminalLigatures ?? 'auto'}
      onChange={(option) => updateSettings({ terminalLigatures: option })}
      options={[
        { value: 'auto', label: 'Auto' },
        { value: 'on', label: 'On' },
        { value: 'off', label: 'Off' }
      ]}
    />
  )
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(storeDir, 'right-sidebar-route.ts'),
    `
export function normalizeRightSidebarRoute(tab) {
  if (tab === 'search') {
    return { rightSidebarTab: 'explorer', rightSidebarExplorerView: 'search' }
  }
  if (tab === 'explorer' || tab === 'vault' || tab === 'checks') {
    return { rightSidebarTab: tab, rightSidebarExplorerView: 'files' }
  }
  return { rightSidebarTab: 'explorer', rightSidebarExplorerView: 'files' }
}
`,
    'utf8'
  )
}
