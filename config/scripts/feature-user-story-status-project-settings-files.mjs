import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export function writeFeatureUserStoryStatusProjectSettingsFiles({ root, csvRows: _csvRows }) {
  const sharedDir = path.join(root, 'src', 'shared')
  const componentsDir = path.join(root, 'src', 'renderer', 'src', 'components')
  const _agentWorkspaceDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'agent-workspace'
  )
  const _automationsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'automations')
  const browserPaneDir = path.join(root, 'src', 'renderer', 'src', 'components', 'browser-pane')
  const _cmdJDir = path.join(root, 'src', 'renderer', 'src', 'components', 'cmd-j')
  const _editorDir = path.join(root, 'src', 'renderer', 'src', 'components', 'editor')
  const _githubDir = path.join(root, 'src', 'renderer', 'src', 'components', 'github')
  const settingsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'settings')
  const sidebarDir = path.join(root, 'src', 'renderer', 'src', 'components', 'sidebar')
  const _terminalQuickCommandsDir = path.join(
    root,
    'src',
    'renderer',
    'src',
    'components',
    'terminal-quick-commands'
  )
  const onboardingDir = path.join(root, 'src', 'renderer', 'src', 'components', 'onboarding')
  const _storeDir = path.join(root, 'src', 'renderer', 'src', 'store')
  const mainAmpDir = path.join(root, 'src', 'main', 'amp')
  const _mainAntigravityDir = path.join(root, 'src', 'main', 'antigravity')
  const _mainClaudeDir = path.join(root, 'src', 'main', 'claude')
  const mainCodexDir = path.join(root, 'src', 'main', 'codex')
  const _mainCommandCodeDir = path.join(root, 'src', 'main', 'command-code')
  const _mainCopilotDir = path.join(root, 'src', 'main', 'copilot')
  const mainCursorDir = path.join(root, 'src', 'main', 'cursor')
  const _mainDroidDir = path.join(root, 'src', 'main', 'droid')
  const _mainGeminiDir = path.join(root, 'src', 'main', 'gemini')
  const mainGrokDir = path.join(root, 'src', 'main', 'grok')
  const _mainHermesDir = path.join(root, 'src', 'main', 'hermes')
  const _mainOpenCodeDir = path.join(root, 'src', 'main', 'opencode')
  const _mainGitDir = path.join(root, 'src', 'main', 'git')
  const _referenceDir = path.join(root, 'docs', 'reference')

  writeFileSync(
    path.join(sharedDir, 'feature-interaction-categories.ts'),
    `
export const FEATURE_INTERACTION_CATEGORIES = [
  'workspace',
  'agent',
  'browser',
  'launcher',
  'task_management',
  'notes',
  'review',
  'setup',
  'settings',
  'automation',
  'terminal',
  'collaboration',
  'resource_management',
  'voice',
  'source_control'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'computer-use-permission-definitions.tsx'),
    `
export const COMPUTER_USE_PERMISSIONS = [
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'screenshots', label: 'Screenshots' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-tips.ts'),
    `
export const FEATURE_TIPS = [
  { id: 'janus-cli', title: 'Let agents drive Janus Code with the Janus CLI' },
  { id: 'voice-dictation', title: 'Voice Dictation is here' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(onboardingDir, 'use-onboarding-flow-types.ts'),
    `
export const STEPS = [
  { id: 'agent', stepNumber: 1, valueKind: 'agent' },
  { id: 'theme', stepNumber: 2, valueKind: 'theme' },
  { id: 'integrations', stepNumber: 3, valueKind: 'integrations' },
  { id: 'notifications', stepNumber: 4, valueKind: 'notifications' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'feature-wall-tour-depth.ts'),
    `
export const FEATURE_WALL_TOUR_DEPTH_STEPS = [
  'workspaces',
  'tasks',
  'agents_statuses',
  'agents_usage',
  'agents_orchestration',
  'workbench_terminal',
  'workbench_editor',
  'workbench_browser',
  'review_notes',
  'review_pr_view',
  'review_ship'
] as const

export const FEATURE_WALL_EXIT_ACTIONS = ['done', 'dismissed', 'onboarding_continue'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'review-steps.ts'),
    `
export const REVIEW_STEPS = [
  { id: 'notes', name: 'Notes' },
  { id: 'ship', name: 'Ship with AI' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'workspace-statuses.ts'),
    `
export const WORKSPACE_STATUS_COLOR_IDS = [
  'neutral',
  'blue',
  'sky',
  'violet',
  'amber',
  'emerald',
  'rose',
  'zinc',
  'conductor-done',
  'conductor-review',
  'conductor-progress'
] as const

export const WORKSPACE_STATUS_ICON_IDS = [
  'circle',
  'circle-dot',
  'circle-progress',
  'circle-dashed',
  'circle-ellipsis',
  'git-pull-request',
  'timer',
  'flag',
  'circle-alert',
  'circle-pause',
  'circle-play',
  'circle-check',
  'ban',
  'conductor-done',
  'conductor-review',
  'conductor-progress'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(componentsDir, 'LinearItemDrawer.tsx'),
    `
const LINEAR_ESTIMATE_PRESETS = [1, 2, 3, 5, 8] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(browserPaneDir, 'BrowserPane.tsx'),
    `
const BROWSER_ANNOTATION_INTENT_OPTIONS = [
  { value: 'change', label: 'Change' },
  { value: 'question', label: 'Question' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'GitPane.tsx'),
    `
const branchPrefixOptions = ['git-username', 'custom', 'none'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'RepositoryHooksSection.tsx'),
    `
const LOCAL_HOOK_NAMES = ['setup', 'archive'] as const

function getSetupRunPolicyOptions() {
  return [
    { policy: 'ask', label: 'Ask every time' },
    { policy: 'run-by-default', label: 'Run by default' },
    { policy: 'skip-by-default', label: 'Skip by default' }
  ]
}

function getCommandSourcePolicyOptions() {
  return [
    { policy: 'shared-only', label: 'orca.yaml only' },
    { policy: 'local-only', label: 'Local only' },
    { policy: 'run-both', label: 'Run both' }
  ]
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'setup-script-import-providers.ts'),
    `
export const SETUP_SCRIPT_IMPORT_PROVIDERS = [
  'superset',
  'package-manager'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agent-status-types.ts'),
    `
export const AGENT_STATUS_STATES = ['working', 'blocked', 'waiting', 'done'] as const
export const AGENT_STATUS_PLAN_STEP_STATUSES = ['pending', 'in-progress', 'completed'] as const
export const AGENT_STATUS_TOOL_EVENT_STATUSES = ['running', 'completed', 'failed'] as const
export const AGENT_STATUS_FAILURE_SOURCES = ['hook', 'terminal', 'orchestration'] as const
export const AGENT_STATUS_APPROVAL_STATUSES = [
  'requested',
  'approved',
  'denied',
  'expired'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'protocol-compat.ts'),
    `
export type RuntimeCompatVerdict =
  | { kind: 'ok' }
  | { kind: 'blocked'; reason: 'client-too-old' | 'server-too-old' }

export type CompatVerdict =
  | { kind: 'ok' }
  | { kind: 'blocked'; reason: 'mobile-too-old' | 'desktop-too-old' }
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'ui-locale.ts'),
    `
export const SUPPORTED_UI_LOCALES = [
  'en',
  'zh'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'browser-cookie-import-sources.ts'),
    `
const CHROMIUM_COOKIE_IMPORT_SOURCES = [
  { label: 'Google Chrome', mac: true, win: true, linux: true },
  { label: 'Brave', mac: true, win: true, linux: true }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'network-proxy.ts'),
    `
const PROXY_ENV_KEYS = [
  'HTTPS_PROXY',
  'http_proxy'
] as const

const NO_PROXY_ENV_KEYS = ['NO_PROXY', 'no_proxy'] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainAmpDir, 'hook-service.ts'),
    `
function getAmpPluginSource(): string {
  return [
    "amp.on('session.start', () => {})",
    "amp.on('agent.end', () => {})"
  ].join('\\n')
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainCodexDir, 'hook-service.ts'),
    `
const CODEX_EVENTS = [
  'SessionStart',
  'Stop'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainCursorDir, 'hook-service.ts'),
    `
const CURSOR_EVENTS = [
  'beforeSubmitPrompt',
  'stop'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(mainGrokDir, 'hook-service.ts'),
    `
const GROK_EVENTS = [
  { eventName: 'SessionStart', definition: { hooks: [{ type: 'command', command: '' }] } },
  { eventName: 'Stop', definition: { hooks: [{ type: 'command', command: '' }] } }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agent-session-resume.ts'),
    `
export const RESUMABLE_TUI_AGENTS = [
  'claude',
  'codex'
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'protocol-version.ts'),
    `
export const PROJECT_HOST_SETUP_RUNTIME_CAPABILITY = 'project-host-setup.v1' as const
export const TASK_SOURCE_CONTEXT_RUNTIME_CAPABILITY = 'task-source-context.v1' as const

export const RUNTIME_CAPABILITIES = [
  'runtime.status.compat.v1',
  PROJECT_HOST_SETUP_RUNTIME_CAPABILITY,
  TASK_SOURCE_CONTEXT_RUNTIME_CAPABILITY
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'agent-hook-types.ts'),
    `
export const AGENT_HOOK_TARGETS = [
  'claude',
  'codex'
] as const
`,
    'utf8'
  )
  const sourceControlDir = path.join(root, 'src', 'main', 'source-control')
  const gitlabDir = path.join(root, 'src', 'main', 'gitlab')
  mkdirSync(sourceControlDir, { recursive: true })
  mkdirSync(gitlabDir, { recursive: true })
  writeFileSync(
    path.join(sharedDir, 'tui-agent-config.ts'),
    `
export const TUI_AGENT_CONFIG = {
  claude: { detectCmd: 'claude' },
  codex: { detectCmd: 'codex' }
}

export function isTuiAgent(value) {
  return value in TUI_AGENT_CONFIG
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'workspace-status-defaults.ts'),
    `
export const DEFAULT_WORKSPACE_STATUSES = [
  { id: 'completed', label: 'Done' },
  { id: 'in-review', label: 'In review' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'todo', label: 'Todo' }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(sharedDir, 'keybindings.ts'),
    `
export const KEYBINDING_DEFINITIONS = [
  {
    id: 'worktree.quickOpen',
    title: 'Go to File',
    group: 'Global',
    scope: 'global'
  },
  {
    id: 'tab.newTerminal',
    title: 'New terminal tab',
    group: 'Tabs',
    scope: 'tabs'
  }
] as const
`,
    'utf8'
  )
  writeFileSync(
    path.join(settingsDir, 'Settings.tsx'),
    `
const SETTINGS_NAV_GROUPS = [
  { id: 'capabilities', titleDefault: 'AI Capabilities' },
  { id: 'setup', titleDefault: 'Set Up' }
] as const

export function Settings() {
  return (
    <>
      <SettingsSection id="agents" title="Agents" />
      <SettingsSection id="general" title="General" />
    </>
  )
}
`,
    'utf8'
  )
  writeFileSync(
    path.join(sidebarDir, 'host-header-menu-items.ts'),
    `
export type HostHeaderMenuAction =
  | 'rename'
  | 'manage'
`,
    'utf8'
  )
}
