import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function makeProject({ csvRows }) {
  const root = mkdtempSync(path.join(tmpdir(), 'janus-feature-story-status-'))
  const sharedDir = path.join(root, 'src', 'shared')
  const settingsDir = path.join(root, 'src', 'renderer', 'src', 'components', 'settings')
  const onboardingDir = path.join(root, 'src', 'renderer', 'src', 'components', 'onboarding')
  const storeDir = path.join(root, 'src', 'renderer', 'src', 'store')
  const referenceDir = path.join(root, 'docs', 'reference')
  mkdirSync(sharedDir, { recursive: true })
  mkdirSync(settingsDir, { recursive: true })
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
