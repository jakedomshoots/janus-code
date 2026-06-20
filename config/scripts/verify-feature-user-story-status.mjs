import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SPREADSHEET_RELATIVE_PATH = path.join(
  'docs',
  'reference',
  'janus-feature-user-story-status.csv'
)
const REQUIRED_COLUMNS = [
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
]

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }
    if (char === ',' && !quoted) {
      cells.push(cell)
      cell = ''
      continue
    }
    cell += char
  }

  cells.push(cell)
  return cells
}

function parseCsv(text) {
  const lines = text.trimEnd().split(/\r?\n/)
  const headers = parseCsvLine(lines[0] ?? '')
  return {
    headers,
    rows: lines.slice(1).map((line, index) => {
      const values = parseCsvLine(line)
      return {
        line: index + 2,
        values,
        record: Object.fromEntries(
          headers.map((header, valueIndex) => [header, values[valueIndex] ?? ''])
        )
      }
    })
  }
}

function collectIds(sourceText) {
  return [...sourceText.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1])
}

function collectRightSidebarRouteIds(sourceText) {
  const tabs = new Set(
    [...sourceText.matchAll(/\btab\s*===\s*'([^']+)'/g)].map((match) => match[1])
  )
  const routeIds = []
  if (tabs.has('explorer')) {
    routeIds.push('right-sidebar:explorer-files')
  }
  if (tabs.has('search')) {
    routeIds.push('right-sidebar:explorer-search')
  }
  for (const tab of [...tabs].sort()) {
    if (tab !== 'explorer' && tab !== 'search') {
      routeIds.push(`right-sidebar:${tab}`)
    }
  }
  return routeIds
}

function collectSettingsNavGroupIds(sourceText) {
  const match = sourceText.match(/const SETTINGS_NAV_GROUPS = \[([\s\S]*?)\]\s+as const/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `settings-nav:${id}`)
}

function collectSettingsSectionIds(sourceText) {
  return [...sourceText.matchAll(/<SettingsSection\s+id="([^"]+)"/g)].map(
    (match) => `settings-section:${match[1]}`
  )
}

function collectTuiAgentIds(sourceText) {
  const match = sourceText.match(/export const TUI_AGENT_CONFIG[\s\S]*?= \{([\s\S]*?)\n\}/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/^\s{2}(?:'([^']+)'|([A-Za-z][\w-]*)):\s*\{/gm)].map(
    (entry) => `tui-agent:${entry[1] ?? entry[2]}`
  )
}

function collectTuiAgentThinkingModeIds(sourceText) {
  const match = sourceText.match(/export const TUI_AGENT_THINKING_MODES[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `tui-agent-thinking-mode:${entry[1]}`)
}

function collectTaskProviderIds(sourceText) {
  const match = sourceText.match(/export const TASK_PROVIDERS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `task-provider:${entry[1]}`)
}

function collectWorkspaceStatusIds(sourceText) {
  const match = sourceText.match(
    /export const DEFAULT_WORKSPACE_STATUSES[\s\S]*?= \[([\s\S]*?)\n\]/
  )
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `workspace-status:${id}`)
}

function collectWorktreeCardPropertyIds(sourceText) {
  const ids = []
  for (const constantName of [
    'FIXED_WORKTREE_CARD_PROPERTIES',
    'DEFAULT_WORKTREE_CARD_PROPERTIES'
  ]) {
    const match = sourceText.match(
      new RegExp(`(?:const|export const) ${constantName}[\\s\\S]*?= \\[([\\s\\S]*?)\\]`)
    )
    if (match) {
      ids.push(...[...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]))
    }
  }
  return [...new Set(ids)].map((id) => `worktree-card-property:${id}`)
}

function collectOpenInApplicationIds(sourceText) {
  const match = sourceText.match(
    /export const DEFAULT_OPEN_IN_APPLICATIONS[\s\S]*?= \[([\s\S]*?)\n\]/
  )
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `open-in-application:${id}`)
}

function collectTerminalLigatureModeIds(sourceText) {
  const match = sourceText.match(
    /updateSettings\(\{\s*terminalLigatures:\s*option\s*\}\)[\s\S]*?options=\{\[([\s\S]*?)\]\}/
  )
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/\bvalue:\s*'([^']+)'/g)].map(
    (entry) => `terminal-ligature-mode:${entry[1]}`
  )
}

function collectSidebarProjectOrderIds(sourceText) {
  const match = sourceText.match(/export const PROJECT_ORDER_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `sidebar-project-order:${id}`)
}

function collectSidebarCardLayoutIds(sourceText) {
  const match = sourceText.match(/export const CARD_LAYOUT_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `sidebar-card-layout:${id}`)
}

function collectSidebarAgentActivityDisplayIds(sourceText) {
  const match = sourceText.match(
    /export const AGENT_ACTIVITY_DISPLAY_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/
  )
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `sidebar-agent-activity-display:${id}`)
}

function collectSidebarWorkspaceGroupIds(sourceText) {
  const match = sourceText.match(/export const GROUP_BY_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `sidebar-workspace-group:${id}`)
}

function collectKeybindingActionIds(sourceText) {
  const match = sourceText.match(/export const KEYBINDING_DEFINITIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `keybinding:${id}`)
}

function collectStatusBarItemIds(sourceText) {
  const match = sourceText.match(/export const DEFAULT_STATUS_BAR_ITEMS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `status-bar:${entry[1]}`)
}

function collectOnboardingFeatureSetupIds(sourceText) {
  const match = sourceText.match(
    /export const ONBOARDING_FEATURE_SETUP_IDS[\s\S]*?= \[([\s\S]*?)\]/
  )
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `onboarding-feature-setup:${entry[1]}`)
}

function collectFeatureWallSetupStepIds(sourceText) {
  const match = sourceText.match(/export const FEATURE_WALL_SETUP_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `feature-wall-setup:${id}`)
}

function collectFeatureWallWorkflowIds(sourceText) {
  const match = sourceText.match(/export const FEATURE_WALL_WORKFLOWS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `feature-wall-workflow:${id}`)
}

function collectFeatureWallAgentStepIds(sourceText) {
  const match = sourceText.match(/export const AGENTS_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `feature-wall-agent-step:${id}`)
}

function collectFeatureWallWorkbenchStepIds(sourceText) {
  const match = sourceText.match(/export const WORKBENCH_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `feature-wall-workbench-step:${id}`)
}

function collectFeatureWallReviewStepIds(sourceText) {
  const match = sourceText.match(/export const REVIEW_STEPS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `feature-wall-review-step:${id}`)
}

function collectContextualTourIds(sourceText) {
  const match = sourceText.match(/export const CONTEXTUAL_TOURS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `contextual-tour:${id}`)
}

function collectSourceControlActionIds(sourceText) {
  const ids = []
  for (const constantName of [
    'SOURCE_CONTROL_TEXT_ACTION_IDS',
    'SOURCE_CONTROL_LAUNCH_ACTION_IDS'
  ]) {
    const match = sourceText.match(
      new RegExp(`export const ${constantName}[\\s\\S]*?= \\[([\\s\\S]*?)\\]`)
    )
    if (match) {
      ids.push(...[...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]))
    }
  }
  return ids.map((id) => `source-control-action:${id}`)
}

function collectBrowserViewportPresetIds(sourceText) {
  const match = sourceText.match(/export const BROWSER_VIEWPORT_PRESETS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `browser-viewport-preset:${id}`)
}

function collectAppIconOptionIds(sourceText) {
  const match = sourceText.match(/export const APP_ICON_OPTIONS[\s\S]*?= \[([\s\S]*?)\n\]/)
  if (!match) {
    return []
  }
  return collectIds(match[1]).map((id) => `app-icon:${id}`)
}

function collectSetupScriptImportProviderIds(sourceText) {
  const match = sourceText.match(
    /export const SETUP_SCRIPT_IMPORT_PROVIDERS[\s\S]*?= \[([\s\S]*?)\]/
  )
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map(
    (entry) => `setup-script-import-provider:${entry[1]}`
  )
}

function collectLeftSidebarAppearanceModeIds(sourceText) {
  const match = sourceText.match(
    /export const LEFT_SIDEBAR_APPEARANCE_MODES[\s\S]*?= \[([\s\S]*?)\]/
  )
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `left-sidebar-appearance:${entry[1]}`)
}

function collectAiVaultAgentIds(sourceText) {
  const match = sourceText.match(/export const AI_VAULT_AGENTS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `ai-vault-agent:${entry[1]}`)
}

function collectSupportedUiLocaleIds(sourceText) {
  const match = sourceText.match(/export const SUPPORTED_UI_LOCALES[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `ui-locale:${entry[1]}`)
}

function collectGitHubPrMergeMethodIds(sourceText) {
  const match = sourceText.match(/export const GITHUB_PR_MERGE_METHODS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `github-pr-merge-method:${entry[1]}`)
}

function toFeatureIdSlug(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function collectBrowserCookieImportSourceIds(sourceText) {
  const match = sourceText.match(/CHROMIUM_COOKIE_IMPORT_SOURCES[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  const labels = [...match[1].matchAll(/\blabel:\s*'([^']+)'/g)].map((entry) => entry[1])
  return [...labels, 'Firefox', 'Safari'].map(
    (label) => `browser-cookie-import-source:${toFeatureIdSlug(label)}`
  )
}

function collectResumableAgentIds(sourceText) {
  const match = sourceText.match(/export const RESUMABLE_TUI_AGENTS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `resumable-agent:${entry[1]}`)
}

function collectExportedStringConstants(sourceText) {
  return new Map(
    [...sourceText.matchAll(/export const ([A-Z0-9_]+) = '([^']+)' as const/g)].map((entry) => [
      entry[1],
      entry[2]
    ])
  )
}

function collectRuntimeCapabilityIds(sourceText) {
  const match = sourceText.match(/export const RUNTIME_CAPABILITIES[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  const constants = collectExportedStringConstants(sourceText)
  const capabilities = []
  for (const entry of match[1].split(',')) {
    const value = entry.trim()
    const literal = value.match(/^'([^']+)'$/)
    if (literal) {
      capabilities.push(literal[1])
      continue
    }
    const resolved = constants.get(value)
    if (resolved) {
      capabilities.push(resolved)
    }
  }
  return capabilities.map((capability) => `runtime-capability:${capability}`)
}

function collectAgentHookTargetIds(sourceText) {
  const match = sourceText.match(/export const AGENT_HOOK_TARGETS[\s\S]*?= \[([\s\S]*?)\]/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => `agent-hook-target:${entry[1]}`)
}

function collectForgeProviderIds(sourceText) {
  const match = sourceText.match(/([\s\S]*?)export const FORGE_PROVIDERS/)
  if (!match) {
    return []
  }
  return [...match[1].matchAll(/\bid:\s*'([^']+)'/g)].map((entry) => `forge-provider:${entry[1]}`)
}

async function collectExpectedRows(root) {
  const [
    interactionsText,
    featureWallText,
    featureTipsText,
    contextualToursText,
    sourceControlAiActionsText,
    browserViewportPresetsText,
    appIconText,
    setupScriptImportProvidersText,
    leftSidebarAppearanceText,
    aiVaultTypesText,
    uiLocaleText,
    githubPrMergeMethodsText,
    browserCookieImportSourcesText,
    agentSessionResumeText,
    protocolVersionText,
    agentHookTypesText,
    forgeProviderText,
    rightSidebarRouteText,
    settingsText,
    terminalTypographyAppearanceText,
    sidebarWorkspaceOptionsText,
    tuiAgentConfigText,
    tuiAgentThinkingText,
    taskProvidersText,
    workspaceStatusDefaultsText,
    worktreeCardPropertiesText,
    openInApplicationsText,
    keybindingsText,
    statusBarDefaultsText,
    onboardingFeatureSetupText,
    featureWallSetupStepsText,
    featureWallWorkflowsText,
    agentsOrchestrationStepsText,
    workbenchStepsText,
    reviewStepsText
  ] = await Promise.all([
    fs.readFile(path.join(root, 'src', 'shared', 'feature-interaction-catalog.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'feature-wall-tiles.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'feature-tips.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'contextual-tours.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'source-control-ai-actions.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'browser-viewport-presets.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'app-icon.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'setup-script-import-providers.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'left-sidebar-appearance.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'ai-vault-types.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'ui-locale.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'github-pr-merge-methods.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'browser-cookie-import-sources.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'agent-session-resume.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'protocol-version.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'agent-hook-types.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'main', 'source-control', 'forge-provider.ts'), 'utf8'),
    fs.readFile(
      path.join(root, 'src', 'renderer', 'src', 'store', 'right-sidebar-route.ts'),
      'utf8'
    ),
    fs.readFile(
      path.join(root, 'src', 'renderer', 'src', 'components', 'settings', 'Settings.tsx'),
      'utf8'
    ),
    fs.readFile(
      path.join(
        root,
        'src',
        'renderer',
        'src',
        'components',
        'settings',
        'TerminalTypographyAppearanceSection.tsx'
      ),
      'utf8'
    ),
    fs.readFile(
      path.join(
        root,
        'src',
        'renderer',
        'src',
        'components',
        'sidebar',
        'sidebar-workspace-options-menu-options.ts'
      ),
      'utf8'
    ),
    fs.readFile(path.join(root, 'src', 'shared', 'tui-agent-config.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'tui-agent-thinking.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'task-providers.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'workspace-status-defaults.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'worktree-card-properties.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'open-in-applications.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'keybindings.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'status-bar-defaults.ts'), 'utf8'),
    fs.readFile(
      path.join(
        root,
        'src',
        'renderer',
        'src',
        'components',
        'onboarding',
        'onboarding-feature-setup.ts'
      ),
      'utf8'
    ),
    fs.readFile(path.join(root, 'src', 'shared', 'feature-wall-setup-steps.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'feature-wall-workflows.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'agents-orchestration-steps.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'workbench-steps.ts'), 'utf8'),
    fs.readFile(path.join(root, 'src', 'shared', 'review-steps.ts'), 'utf8')
  ])

  return [
    ...collectIds(interactionsText).map((id) => `interaction:${id}`),
    ...collectIds(featureWallText).map((id) => `feature-wall:${id}`),
    ...collectIds(featureTipsText).map((id) => `feature-tip:${id}`),
    ...collectContextualTourIds(contextualToursText),
    ...collectSourceControlActionIds(sourceControlAiActionsText),
    ...collectBrowserViewportPresetIds(browserViewportPresetsText),
    ...collectAppIconOptionIds(appIconText),
    ...collectSetupScriptImportProviderIds(setupScriptImportProvidersText),
    ...collectLeftSidebarAppearanceModeIds(leftSidebarAppearanceText),
    ...collectAiVaultAgentIds(aiVaultTypesText),
    ...collectSupportedUiLocaleIds(uiLocaleText),
    ...collectGitHubPrMergeMethodIds(githubPrMergeMethodsText),
    ...collectBrowserCookieImportSourceIds(browserCookieImportSourcesText),
    ...collectResumableAgentIds(agentSessionResumeText),
    ...collectRuntimeCapabilityIds(protocolVersionText),
    ...collectAgentHookTargetIds(agentHookTypesText),
    ...collectForgeProviderIds(forgeProviderText),
    ...collectRightSidebarRouteIds(rightSidebarRouteText),
    ...collectSettingsNavGroupIds(settingsText),
    ...collectSettingsSectionIds(settingsText),
    ...collectTerminalLigatureModeIds(terminalTypographyAppearanceText),
    ...collectSidebarProjectOrderIds(sidebarWorkspaceOptionsText),
    ...collectSidebarCardLayoutIds(sidebarWorkspaceOptionsText),
    ...collectSidebarAgentActivityDisplayIds(sidebarWorkspaceOptionsText),
    ...collectSidebarWorkspaceGroupIds(sidebarWorkspaceOptionsText),
    ...collectTuiAgentIds(tuiAgentConfigText),
    ...collectTuiAgentThinkingModeIds(tuiAgentThinkingText),
    ...collectTaskProviderIds(taskProvidersText),
    ...collectWorkspaceStatusIds(workspaceStatusDefaultsText),
    ...collectWorktreeCardPropertyIds(worktreeCardPropertiesText),
    ...collectOpenInApplicationIds(openInApplicationsText),
    ...collectKeybindingActionIds(keybindingsText),
    ...collectStatusBarItemIds(statusBarDefaultsText),
    ...collectOnboardingFeatureSetupIds(onboardingFeatureSetupText),
    ...collectFeatureWallSetupStepIds(featureWallSetupStepsText),
    ...collectFeatureWallWorkflowIds(featureWallWorkflowsText),
    ...collectFeatureWallAgentStepIds(agentsOrchestrationStepsText),
    ...collectFeatureWallWorkbenchStepIds(workbenchStepsText),
    ...collectFeatureWallReviewStepIds(reviewStepsText)
  ]
}

function validateRequiredColumns(headers) {
  const headerSet = new Set(headers)
  return REQUIRED_COLUMNS.filter((column) => !headerSet.has(column))
}

function validateRows(rows) {
  const errors = []
  const seen = new Map()

  for (const row of rows) {
    const id = row.record.id
    if (!id) {
      errors.push(`Line ${row.line} is missing id.`)
      continue
    }
    if (seen.has(id)) {
      errors.push(`Duplicate spreadsheet id ${id} on lines ${seen.get(id)} and ${row.line}.`)
    } else {
      seen.set(id, row.line)
    }

    for (const column of REQUIRED_COLUMNS.filter((name) => name !== 'defects')) {
      if (!row.record[column]) {
        errors.push(`Line ${row.line} is missing ${column}.`)
      }
    }
  }

  return { errors, ids: new Set(seen.keys()) }
}

export async function main(root = process.cwd()) {
  const spreadsheetPath = path.join(root, SPREADSHEET_RELATIVE_PATH)
  let text
  try {
    text = await fs.readFile(spreadsheetPath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(
        `Missing canonical feature user-story spreadsheet: ${SPREADSHEET_RELATIVE_PATH}`
      )
      return 1
    }
    throw error
  }

  const { headers, rows } = parseCsv(text)
  const errors = []
  const missingColumns = validateRequiredColumns(headers)
  if (missingColumns.length > 0) {
    errors.push(`Missing spreadsheet column(s): ${missingColumns.join(', ')}`)
  }

  const rowValidation = validateRows(rows)
  errors.push(...rowValidation.errors)

  const expectedIds = await collectExpectedRows(root)
  const missingIds = expectedIds.filter((id) => !rowValidation.ids.has(id))
  if (missingIds.length > 0) {
    errors.push(`Missing code-backed feature row(s): ${missingIds.join(', ')}`)
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    return 1
  }

  console.log(`Verified ${rows.length} canonical feature user-story row(s).`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main())
}
