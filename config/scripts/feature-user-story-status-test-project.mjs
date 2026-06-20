import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function makeProject({ csvRows }) {
  const root = mkdtempSync(path.join(tmpdir(), 'janus-feature-story-status-'))
  const sharedDir = path.join(root, 'src', 'shared')
  const settingsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'settings')
  const sidebarDir = path.join(root, 'src', 'renderer', 'src', 'components', 'sidebar')
  const onboardingDir = path.join(root, 'src', 'renderer', 'src', 'components', 'onboarding')
  const storeDir = path.join(root, 'src', 'renderer', 'src', 'store')
  const referenceDir = path.join(root, 'docs', 'reference')
  mkdirSync(sharedDir, { recursive: true })
  mkdirSync(settingsDir, { recursive: true })
  mkdirSync(sidebarDir, { recursive: true })
  mkdirSync(onboardingDir, { recursive: true })
  mkdirSync(storeDir, { recursive: true })
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
  mkdirSync(sourceControlDir, { recursive: true })
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
    path.join(sharedDir, 'open-in-applications.ts'),
    `
export const DEFAULT_OPEN_IN_APPLICATIONS = [
  { id: 'vscode', label: 'VS Code', command: 'code' }
]
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

  return root
}
