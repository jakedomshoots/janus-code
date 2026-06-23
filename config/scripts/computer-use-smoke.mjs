#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const repoRoot = resolve(import.meta.dirname, '..', '..')
const cliPath =
  process.env.ORCA_COMPUTER_SMOKE_CLI_PATH ?? resolve(repoRoot, 'out', 'cli', 'index.js')
const args = new Set(process.argv.slice(2))
const requestedApps = valueFlag('--apps')
const includeScreenshot = args.has('--screenshot')
const janusWorkflow = args.has('--janus-workflow')
const launchRuntime = args.has('--launch')
const requireTarget = args.has('--require-target')
const session = valueFlag('--session') ?? `computer-smoke-${process.pid}`
const janusApp =
  valueFlag('--janus-app') ?? process.env.JANUS_COMPUTER_SMOKE_APP ?? 'com.jakedom.januscode'
const preferredApps = (
  requestedApps ??
  process.env.ORCA_COMPUTER_SMOKE_APPS ??
  'Finder,TextEdit,Text Editor,gedit,Notepad,Calculator,Microsoft Edge,Google Chrome,Safari,Slack,Spotify'
)
  .split(',')
  .map((app) => app.trim())
  .filter(Boolean)

if (!existsSync(cliPath)) {
  fail(`Missing built CLI at ${cliPath}. Run pnpm build:cli first.`)
}

if (launchRuntime) {
  const opened = unwrapResult(runCli(['open', '--json']))
  console.log(
    `computer-use smoke: runtime ${opened.runtime?.state ?? 'unknown'} (${opened.runtime?.runtimeId ?? 'unknown'})`
  )
}

if (janusWorkflow) {
  runJanusWorkflowSmoke()
  process.exit(0)
}

const list = unwrapResult(runCli(['computer', 'list-apps', '--json']))
const apps = Array.isArray(list.apps) ? list.apps : []
const availableNames = new Set(apps.map((app) => String(app.name ?? '').toLowerCase()))
const availableBundles = new Set(
  apps.map((app) => String(app.bundleId ?? '').toLowerCase()).filter(Boolean)
)
const targets = preferredApps.filter(
  (app) => availableNames.has(app.toLowerCase()) || availableBundles.has(app.toLowerCase())
)

console.log(`computer-use smoke: ${apps.length} apps listed`)
if (targets.length === 0) {
  const message = `no preferred apps are running (${preferredApps.join(', ')})`
  if (requireTarget) {
    fail(message)
  }
  console.log(`computer-use smoke: ${message}`)
  process.exit(0)
}

let failures = 0
let successes = 0
for (const app of targets) {
  const result = runSnapshotSmoke(app)

  if (!result.ok) {
    if (result.skipped) {
      console.log(`computer-use smoke: ${app}: skipped (${result.reason})`)
      continue
    }
    failures += 1
    console.log(`computer-use smoke: ${app}: failed: ${result.error}`)
    continue
  }
  successes += 1

  const state = unwrapResult(result.value)
  const snapshot = state.snapshot
  const treeText = String(snapshot.treeText ?? '')
  const lineCount = treeText.split('\n').filter(Boolean).length
  const secondaryActions = (treeText.match(/Secondary Actions:/g) ?? []).length
  const settable = (treeText.match(/\bsettable\b/g) ?? []).length
  const screenshotState = state.screenshot
    ? `${state.screenshot.width}x${state.screenshot.height}`
    : 'missing'
  console.log(
    [
      `computer-use smoke: ${snapshot.app.name}`,
      `${snapshot.elementCount} elements`,
      `${lineCount} lines`,
      `${secondaryActions} secondary-action lines`,
      `${settable} settable elements`,
      `screenshot=${screenshotState}`
    ].join(' | ')
  )
}

if (failures > 0) {
  fail(`${failures} app snapshot smoke check(s) failed`)
}
if (requireTarget && successes === 0) {
  fail('no preferred app snapshots succeeded')
}

function runSnapshotSmoke(app) {
  const baseArgs = [
    'computer',
    'get-app-state',
    '--session',
    session,
    '--app',
    app,
    '--restore-window',
    ...(includeScreenshot ? [] : ['--no-screenshot']),
    '--json'
  ]
  const initial = runCli(baseArgs, { allowFailure: true })
  if (initial.ok) {
    return initial
  }
  const error = parseCliFailure(initial.error)
  if (error?.code === 'window_not_found') {
    return { ok: false, skipped: true, reason: error.message }
  }
  return initial
}

function runJanusWorkflowSmoke() {
  let state = ensureAgentChat(getAppState(janusApp))
  expectTree(state, ['Agent chat composer', 'Message agent'])

  state = ensureTreeTermsVisible(state, ['Settings'], ['Toggle sidebar'])
  state = clickElement(janusApp, findElementIndex(state, ['Settings']))
  const settingsSearchIndex = findElementIndex(state, ['Search settings'])
  state = setElementValue(janusApp, settingsSearchIndex, 'voice')
  expectTree(state, ['Voice', 'Shortcuts', 'macOS Permissions'])

  state = clickElement(janusApp, findElementIndex(state, ['Back to app']))
  expectTree(state, ['Agent chat composer', 'Message agent'])

  state = clickElement(janusApp, findElementIndex(state, ['Open browser workbench']))
  expectTree(state, ['Back to chat', 'New Tab', 'about:blank'])

  state = clickElement(janusApp, findElementIndex(state, ['Back to chat']))
  expectTree(state, ['Agent chat composer', 'Message agent'])

  const outputTabIndex = findOptionalElementIndex(state, ['Output'])
  if (outputTabIndex) {
    state = clickElement(janusApp, outputTabIndex)
    expectTree(state, ['selected) Output'])

    const changesTabIndex = findOptionalElementIndex(state, ['Changes'])
    const diffTabIndex = changesTabIndex ?? findElementIndex(state, ['Diff'])
    state = clickElement(janusApp, diffTabIndex)
    expectAnyTree(state, ['selected) Changes', 'selected) Diff'])
    state = runJanusSourceControlSmoke(state)

    state = clickElement(janusApp, findElementIndex(state, ['Review']))
    expectTree(state, ['selected) Review'])
  }

  const composerIndex = findElementIndex(state, ['Message agent'])
  state = setElementValue(janusApp, composerIndex, '/')
  expectTree(state, ['Slash commands', '/commands'])

  const slashComposerIndex = findElementIndex(state, ['Message agent'])
  state = setElementValueFromStdin(janusApp, slashComposerIndex, '')
  expectTree(state, ['Agent chat composer', 'Message agent'])

  console.log('computer-use smoke: Janus workflow gate passed')
}

function ensureTreeTermsVisible(state, targetTerms, revealTerms) {
  if (findOptionalElementIndex(state, targetTerms)) {
    return state
  }
  const revealIndex = findOptionalElementIndex(state, revealTerms)
  if (!revealIndex) {
    return state
  }
  return clickElement(janusApp, revealIndex)
}

function ensureAgentChat(state) {
  if (treeTextForState(state).includes('Agent chat composer')) {
    return state
  }

  for (const label of ['Back to chat', 'Back to app']) {
    const backIndex = findOptionalElementIndex(state, [label])
    if (backIndex) {
      return clickElement(janusApp, backIndex)
    }
  }

  return state
}

function runJanusSourceControlSmoke(state) {
  const changedRowIndex = findSourceControlChangedRowIndex(state)
  if (!changedRowIndex) {
    expectAnyTree(state, ['No changes', 'No uncommitted changes', 'No changes on this branch'])
    return state
  }

  expectTree(state, ['More commit and remote actions'])
  const selectedState = clickElement(janusApp, changedRowIndex)
  expectTree(selectedState, ['selected', 'Stage ('])

  const menuState = clickElement(
    janusApp,
    findElementIndex(selectedState, ['More commit and remote actions'])
  )
  expectTree(menuState, ['Fetch'])
  return menuState
}

function findSourceControlChangedRowIndex(state) {
  const statusPattern = /\b(modified|added|deleted|renamed|untracked|copied|M|A|D|R|U|C)\b/
  for (const line of treeTextForState(state).split('\n')) {
    if (!/\brow\b/.test(line) || !statusPattern.test(line)) {
      continue
    }
    const match = line.trim().match(/^(\d+)\b/)
    if (match) {
      return match[1]
    }
  }
  return null
}

function getAppState(app) {
  return unwrapResult(
    runCli([
      'computer',
      'get-app-state',
      '--session',
      session,
      '--app',
      app,
      '--restore-window',
      ...(includeScreenshot ? [] : ['--no-screenshot']),
      '--json'
    ])
  )
}

function clickElement(app, elementIndex) {
  return unwrapResult(
    runCli([
      'computer',
      'click',
      '--session',
      session,
      '--app',
      app,
      '--element-index',
      elementIndex,
      '--restore-window',
      ...(includeScreenshot ? [] : ['--no-screenshot']),
      '--json'
    ])
  )
}

function setElementValue(app, elementIndex, value) {
  return unwrapResult(
    runCli([
      'computer',
      'set-value',
      '--session',
      session,
      '--app',
      app,
      '--element-index',
      elementIndex,
      '--value',
      value,
      '--restore-window',
      ...(includeScreenshot ? [] : ['--no-screenshot']),
      '--json'
    ])
  )
}

function setElementValueFromStdin(app, elementIndex, value) {
  return unwrapResult(
    runCli(
      [
        'computer',
        'set-value',
        '--session',
        session,
        '--app',
        app,
        '--element-index',
        elementIndex,
        '--value-stdin',
        '--restore-window',
        ...(includeScreenshot ? [] : ['--no-screenshot']),
        '--json'
      ],
      { input: value }
    )
  )
}

function findElementIndex(state, terms) {
  const index = findOptionalElementIndex(state, terms)
  if (index) {
    return index
  }
  fail(`Janus workflow missing element matching: ${terms.join(' + ')}`)
}

function findOptionalElementIndex(state, terms) {
  const treeText = treeTextForState(state)
  for (const line of treeText.split('\n')) {
    if (!terms.every((term) => line.includes(term))) {
      continue
    }
    const match = line.trim().match(/^(\d+)\b/)
    if (match) {
      return match[1]
    }
  }
  return null
}

function expectTree(state, terms) {
  const treeText = treeTextForState(state)
  for (const term of terms) {
    if (!treeText.includes(term)) {
      fail(`Janus workflow expected tree text to include: ${term}`)
    }
  }
}

function expectAnyTree(state, terms) {
  const treeText = treeTextForState(state)
  if (!terms.some((term) => treeText.includes(term))) {
    fail(`Janus workflow expected tree text to include one of: ${terms.join(', ')}`)
  }
}

function treeTextForState(state) {
  return String(state?.snapshot?.treeText ?? '')
}

function parseCliFailure(raw) {
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw)
    return parsed.error ?? null
  } catch {
    return { code: 'runtime_error', message: String(raw) }
  }
}

function valueFlag(name) {
  const index = process.argv.indexOf(name)
  if (index === -1) {
    return null
  }
  return process.argv[index + 1] ?? null
}

function runCli(cliArgs, options = {}) {
  const userDataPath = smokeUserDataPath()
  const child = spawnSync(process.execPath, [cliPath, ...cliArgs], {
    cwd: repoRoot,
    encoding: 'utf8',
    input: options.input,
    env: {
      ...process.env,
      JANUS_USER_DATA_PATH: userDataPath,
      ORCA_USER_DATA_PATH: userDataPath
    }
  })
  if (child.status !== 0) {
    const error = (child.stderr || child.stdout || `exit ${child.status}`).trim()
    if (options.allowFailure) {
      return { ok: false, error }
    }
    fail(error)
  }
  try {
    return options.allowFailure
      ? { ok: true, value: JSON.parse(child.stdout) }
      : JSON.parse(child.stdout)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    fail(`Could not parse CLI JSON for ${cliArgs.join(' ')}: ${detail}\n${child.stdout}`)
  }
}

function smokeUserDataPath() {
  return (
    nonEmptyEnv('JANUS_COMPUTER_SMOKE_USER_DATA_PATH') ??
    nonEmptyEnv('ORCA_COMPUTER_SMOKE_USER_DATA_PATH') ??
    (janusWorkflow ? defaultInstalledUserDataPath() : defaultDevUserDataPath())
  )
}

function nonEmptyEnv(name) {
  const value = process.env[name]?.trim()
  return value ? value : null
}

function defaultInstalledUserDataPath() {
  if (process.platform === 'darwin') {
    return resolve(homedir(), 'Library', 'Application Support', 'janus-code')
  }
  if (process.platform === 'win32') {
    return resolve(process.env.APPDATA ?? resolve(homedir(), 'AppData', 'Roaming'), 'janus-code')
  }
  return resolve(process.env.XDG_CONFIG_HOME ?? resolve(homedir(), '.config'), 'janus-code')
}

function defaultDevUserDataPath() {
  if (process.platform === 'darwin') {
    return resolve(homedir(), 'Library', 'Application Support', 'janus-dev')
  }
  if (process.platform === 'win32') {
    return resolve(process.env.APPDATA ?? resolve(homedir(), 'AppData', 'Roaming'), 'janus-dev')
  }
  return resolve(process.env.XDG_CONFIG_HOME ?? resolve(homedir(), '.config'), 'janus-dev')
}

function unwrapResult(value) {
  if (value && typeof value === 'object' && 'result' in value) {
    return value.result
  }
  return value
}

function fail(message) {
  const recovery = permissionRecoveryHint(message)
  console.error(`computer-use smoke: ${message}${recovery ? `\n${recovery}` : ''}`)
  process.exit(1)
}

function permissionRecoveryHint(message) {
  const error = parseCliFailure(message)
  const code = String(error?.code ?? '')
  const detail = String(error?.message ?? message)
  if (
    code !== 'permission_denied' &&
    code !== 'accessibility_error' &&
    !/Accessibility|Screen Recording|permission/i.test(detail)
  ) {
    return ''
  }

  return [
    'computer-use smoke: macOS permission recovery:',
    '  janus computer permissions --id accessibility --json',
    '  janus computer permissions --id screenshots --json',
    '  janus computer permissions --json',
    'computer-use smoke: after granting both permissions, rerun `pnpm run smoke:janus-workflow`.'
  ].join('\n')
}
