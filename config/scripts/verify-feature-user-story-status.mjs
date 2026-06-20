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

async function collectExpectedRows(root) {
  const [
    interactionsText,
    featureWallText,
    featureTipsText,
    rightSidebarRouteText,
    settingsText,
    tuiAgentConfigText,
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
    fs.readFile(
      path.join(root, 'src', 'renderer', 'src', 'store', 'right-sidebar-route.ts'),
      'utf8'
    ),
    fs.readFile(
      path.join(root, 'src', 'renderer', 'src', 'components', 'settings', 'Settings.tsx'),
      'utf8'
    ),
    fs.readFile(path.join(root, 'src', 'shared', 'tui-agent-config.ts'), 'utf8'),
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
    ...collectRightSidebarRouteIds(rightSidebarRouteText),
    ...collectSettingsNavGroupIds(settingsText),
    ...collectSettingsSectionIds(settingsText),
    ...collectTuiAgentIds(tuiAgentConfigText),
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
