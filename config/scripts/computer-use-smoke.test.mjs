import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectDir = path.resolve(import.meta.dirname, '../..')
const smokeScript = path.join(projectDir, 'config', 'scripts', 'computer-use-smoke.mjs')

describe('computer-use smoke script', () => {
  it('drives the Janus workflow gate without sending a prompt', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root)
    const callsPath = path.join(root, 'calls.jsonl')

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: '',
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: '',
        JANUS_USER_DATA_PATH: '',
        ORCA_USER_DATA_PATH: ''
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
    expect(
      readFileSync(callsPath, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
    ).toEqual([
      [
        'computer',
        'get-app-state',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '33',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'set-value',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '7',
        '--value',
        'voice',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '6',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '76',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '62',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '89',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '90',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '96',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '84',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '91',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'set-value',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '74',
        '--value',
        '/',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'set-value',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '141',
        '--value-stdin',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ]
    ])
    expect(path.basename(readFileSync(path.join(root, 'user-data-path.txt'), 'utf8'))).toBe(
      'janus-code'
    )
  })

  it('returns from an open browser tab before driving the Janus workflow gate', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root, { initialState: 'browser' })
    const callsPath = path.join(root, 'calls.jsonl')

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
    const calls = readFileSync(callsPath, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
    expect(calls.slice(0, 2)).toEqual([
      [
        'computer',
        'get-app-state',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ],
      [
        'computer',
        'click',
        '--session',
        expect.any(String),
        '--app',
        'com.jakedom.januscode',
        '--element-index',
        '62',
        '--restore-window',
        '--no-screenshot',
        '--json'
      ]
    ])
  })

  it('accepts an existing browser page when checking the browser workbench', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root, { existingBrowserPage: true })

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
  })

  it('returns from Settings before driving the Janus workflow gate', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root, { initialState: 'settings' })

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
    const calls = readJsonl(path.join(root, 'calls.jsonl'))
    expect(calls[0].slice(0, 2)).toEqual(['computer', 'get-app-state'])
    expect(calls[1]).toEqual(expect.arrayContaining(['click', '--element-index', '6']))
  })

  it('opens the sidebar before entering Settings when the workspace sidebar is collapsed', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root, { initialState: 'workspace-collapsed' })

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
    const calls = readJsonl(path.join(root, 'calls.jsonl'))
    expect(calls[0].slice(0, 2)).toEqual(['computer', 'get-app-state'])
    expect(calls[1]).toEqual(expect.arrayContaining(['click', '--element-index', '6']))
    expect(calls[2]).toEqual(expect.arrayContaining(['click', '--element-index', '33']))
  })

  it('accepts the selected Changes panel when source control has no changed rows', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeJanusWorkflowCli(root, { noChanges: true })

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Janus workflow gate passed')
  })

  it('prints targeted macOS permission recovery when the Janus workflow gate is blocked', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writePermissionDeniedJanusWorkflowCli(root)

    const result = spawnSync(process.execPath, [smokeScript, '--janus-workflow'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        JANUS_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Accessibility permission is required')
    expect(result.stderr).toContain('janus computer permissions --id accessibility --json')
    expect(result.stderr).toContain('janus computer permissions --id screenshots --json')
    expect(result.stderr).toContain('pnpm run smoke:janus-workflow')
  })

  it('can launch a runtime before checking apps', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = path.join(root, 'fake-cli.cjs')
    const callsPath = path.join(root, 'calls.jsonl')
    writeFileSync(
      cliPath,
      [
        'const fs = require("node:fs");',
        `fs.appendFileSync(${JSON.stringify(callsPath)}, JSON.stringify(process.argv.slice(2)) + "\\n");`,
        'const args = process.argv.slice(2);',
        'if (args[0] === "open") {',
        '  console.log(JSON.stringify({ result: { runtime: { state: "ready", runtimeId: "runtime-test" } } }));',
        '} else if (args.join(" ") === "computer list-apps --json") {',
        '  console.log(JSON.stringify({ result: { apps: [] } }));',
        '} else {',
        '  console.error("unexpected args: " + args.join(" "));',
        '  process.exit(1);',
        '}'
      ].join('\n'),
      'utf8'
    )
    chmodSync(cliPath, 0o755)

    const output = execFileSync(process.execPath, [smokeScript, '--launch'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(output).toContain('computer-use smoke: runtime ready (runtime-test)')
    expect(
      readFileSync(callsPath, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
    ).toEqual([
      ['open', '--json'],
      ['computer', 'list-apps', '--json']
    ])
  })

  it('fails closed when a target app is required but none are available', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeListAppsCli(root, [])

    const result = spawnSync(process.execPath, [smokeScript, '--require-target'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data'),
        ORCA_COMPUTER_SMOKE_APPS: 'TestApp'
      }
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('computer-use smoke: no preferred apps are running (TestApp)')
  })

  it('keeps no-target smoke permissive by default for local probing', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeListAppsCli(root, [])

    const result = spawnSync(process.execPath, [smokeScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data'),
        ORCA_COMPUTER_SMOKE_APPS: 'TestApp'
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: no preferred apps are running (TestApp)')
  })

  it('skips background apps that report window_not_found instead of failing smoke', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeSnapshotCli(
      root,
      [
        { name: 'Edge', bundleId: 'com.microsoft.edgemac' },
        { name: 'Notepad', bundleId: null }
      ],
      {
        windowNotFoundApps: ['Edge']
      }
    )

    const result = spawnSync(process.execPath, [smokeScript, '--require-target'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data'),
        ORCA_COMPUTER_SMOKE_APPS: 'Edge,Notepad'
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Edge: skipped')
    expect(result.stdout).toContain('computer-use smoke: Notepad')
  })

  it('uses cross-platform default app targets for smoke snapshots', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'orca-computer-smoke-test-'))
    const cliPath = writeFakeSnapshotCli(root, [{ name: 'Notepad', bundleId: null }])

    const result = spawnSync(process.execPath, [smokeScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCA_COMPUTER_SMOKE_CLI_PATH: cliPath,
        ORCA_COMPUTER_SMOKE_USER_DATA_PATH: path.join(root, 'user-data')
      }
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('computer-use smoke: Notepad')
  })
})

function writeFakeJanusWorkflowCli(root, options = {}) {
  const cliPath = path.join(root, 'fake-cli.cjs')
  const callsPath = path.join(root, 'calls.jsonl')
  const statePath = path.join(root, 'state.txt')
  writeFileSync(statePath, options.initialState ?? 'workspace', 'utf8')
  writeFileSync(
    cliPath,
    [
      'const fs = require("node:fs");',
      `const callsPath = ${JSON.stringify(callsPath)};`,
      `const statePath = ${JSON.stringify(statePath)};`,
      'const args = process.argv.slice(2);',
      'fs.appendFileSync(callsPath, JSON.stringify(args) + "\\n");',
      'const command = args.slice(0, 2).join(" ");',
      'const elementIndex = readFlag("--element-index");',
      `const noChanges = ${JSON.stringify(Boolean(options.noChanges))};`,
      `const browserState = ${JSON.stringify(options.existingBrowserPage ? 'browser-existing' : 'browser')};`,
      `fs.writeFileSync(${JSON.stringify(path.join(root, 'user-data-path.txt'))}, process.env.ORCA_USER_DATA_PATH || "");`,
      'if (command === "computer get-app-state") {',
      '  printState(fs.readFileSync(statePath, "utf8"));',
      '} else if (command === "computer click") {',
      '  if (elementIndex === "33") fs.writeFileSync(statePath, "settings");',
      '  if (elementIndex === "6") fs.writeFileSync(statePath, "workspace");',
      '  if (elementIndex === "76") fs.writeFileSync(statePath, browserState);',
      '  if (elementIndex === "62") fs.writeFileSync(statePath, "workspace");',
      '  if (elementIndex === "89") fs.writeFileSync(statePath, "output");',
      '  if (elementIndex === "90") fs.writeFileSync(statePath, noChanges ? "changes-empty" : "changes");',
      '  if (elementIndex === "96") fs.writeFileSync(statePath, "changes-selected");',
      '  if (elementIndex === "84") fs.writeFileSync(statePath, "actions-menu");',
      '  if (elementIndex === "91") fs.writeFileSync(statePath, "review");',
      '  printState(fs.readFileSync(statePath, "utf8"));',
      '} else if (command === "computer set-value") {',
      '  if (elementIndex === "7") fs.writeFileSync(statePath, "settings-search");',
      '  if (elementIndex === "74") fs.writeFileSync(statePath, "slash");',
      '  if (elementIndex === "141") fs.writeFileSync(statePath, "workspace");',
      '  printState(fs.readFileSync(statePath, "utf8"));',
      '} else {',
      '  console.error("unexpected args: " + args.join(" "));',
      '  process.exit(1);',
      '}',
      'function readFlag(name) {',
      '  const index = args.indexOf(name);',
      '  return index === -1 ? null : args[index + 1];',
      '}',
      'function printState(state) {',
      '  console.log(JSON.stringify({ result: { snapshot: { app: { name: "Janus Code" }, elementCount: 20, treeText: treeText(state), window: { title: "Janus Code" } }, screenshot: null } }));',
      '}',
      'function treeText(state) {',
      '  const states = {',
      '    workspace: ["33 button Settings", "72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "76 button Open browser workbench", "78 button Open terminal drawer", "79 text Completed thread Codex", "80 button disabled Send", "89 tab Output", "90 tab Changes", "91 tab Review", "92 tab Context", "102 container Terminal drawer"].join("\\n"),',
      '    "workspace-collapsed": ["6 button Toggle sidebar", "72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "76 button Open browser workbench", "89 tab Output", "90 tab Changes", "91 tab Review"].join("\\n"),',
      '    settings: ["6 button Back to app", "7 text field Placeholder: Search settings", "12 button Voice Not installed"].join("\\n"),',
      '    "settings-search": ["6 button Back to app", "7 text field Value: voice, Placeholder: Search settings", "23 heading Voice", "40 heading Shortcuts", "72 heading macOS Permissions"].join("\\n"),',
      '    browser: ["62 button Back to chat", "68 combo box about:blank", "76 text New Tab Type a URL above to start browsing.", "106 container"].join("\\n"),',
      '    "browser-existing": ["62 button Back to chat", "68 combo box Value: http://localhost:5173/home", "76 text ChemCheck - Pool Service", "106 container"].join("\\n"),',
      '    output: ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "89 tab (selected) Output", "90 tab Changes", "91 tab Review", "94 container Outputs"].join("\\n"),',
      '    changes: ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "84 button More commit and remote actions", "85 button disabled Commit", "89 tab Output", "90 tab (selected) Changes", "91 tab Review", "94 heading Changes", "96 row src/app.ts modified"].join("\\n"),',
      '    "changes-empty": ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "89 tab Output", "90 tab (selected) Changes", "91 tab Review", "94 heading Changes", "96 text No changes"].join("\\n"),',
      '    "changes-selected": ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "84 button More commit and remote actions", "85 button disabled Commit", "89 tab Output", "90 tab (selected) Changes", "91 tab Review", "94 heading Changes", "96 row selected src/app.ts modified", "120 toolbar 1 selected", "121 button Stage (1)", "122 button Clear selection"].join("\\n"),',
      '    "actions-menu": ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "84 button More commit and remote actions expanded", "85 button disabled Commit", "89 tab Output", "90 tab (selected) Changes", "91 tab Review", "100 menu", "101 menu item Fetch", "102 menu item Pull", "103 menu item Push", "104 menu item Sync"].join("\\n"),',
      '    review: ["72 container Agent chat composer", "74 text entry area Description: Message agent, Placeholder: Ask a follow-up in this thread...", "89 tab Output", "90 tab Changes", "91 tab (selected) Review", "94 container Review", "97 text None"].join("\\n"),',
      '    slash: ["78 list box Slash commands", "89 /commands Commands Refresh the live slash-command list from the selected agent.", "141 text entry area Description: Message agent, Value: /, Placeholder: Ask a follow-up in this thread..."].join("\\n")',
      '  };',
      '  return states[state] || states.workspace;',
      '}'
    ].join('\n'),
    'utf8'
  )
  chmodSync(cliPath, 0o755)
  return cliPath
}

function readJsonl(filePath) {
  return readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
}

function writePermissionDeniedJanusWorkflowCli(root) {
  const cliPath = path.join(root, 'fake-cli.cjs')
  writeFileSync(
    cliPath,
    [
      'const args = process.argv.slice(2);',
      'if (args[0] === "computer" && args[1] === "get-app-state") {',
      '  console.log(JSON.stringify({ error: { code: "permission_denied", message: "Accessibility permission is required for Janus Computer Use." } }));',
      '  process.exit(1);',
      '}',
      'console.error("unexpected args: " + args.join(" "));',
      'process.exit(1);'
    ].join('\n'),
    'utf8'
  )
  chmodSync(cliPath, 0o755)
  return cliPath
}

function writeFakeListAppsCli(root, apps) {
  const cliPath = path.join(root, 'fake-cli.cjs')
  writeFileSync(
    cliPath,
    [
      'const args = process.argv.slice(2);',
      'if (args.join(" ") === "computer list-apps --json") {',
      `  console.log(JSON.stringify({ result: { apps: ${JSON.stringify(apps)} } }));`,
      '} else {',
      '  console.error("unexpected args: " + args.join(" "));',
      '  process.exit(1);',
      '}'
    ].join('\n'),
    'utf8'
  )
  chmodSync(cliPath, 0o755)
  return cliPath
}

function writeFakeSnapshotCli(root, apps, options = {}) {
  const cliPath = path.join(root, 'fake-cli.cjs')
  writeFileSync(
    cliPath,
    [
      'const args = process.argv.slice(2);',
      `const windowNotFoundApps = new Set(${JSON.stringify(options.windowNotFoundApps ?? [])});`,
      'if (args.join(" ") === "computer list-apps --json") {',
      `  console.log(JSON.stringify({ result: { apps: ${JSON.stringify(apps)} } }));`,
      '} else if (args[0] === "computer" && args[1] === "get-app-state") {',
      '  const appIndex = args.indexOf("--app");',
      '  const app = appIndex >= 0 ? args[appIndex + 1] : "Unknown";',
      '  if (windowNotFoundApps.has(app)) {',
      '    console.log(JSON.stringify({ ok: false, error: { code: "window_not_found", message: `app \'${app}\' has no on-screen window` } }));',
      '    process.exit(1);',
      '  }',
      '  console.log(JSON.stringify({ result: {',
      '    snapshot: {',
      '      app: { name: app },',
      '      elementCount: 1,',
      '      treeText: "[1] text area settable",',
      '      window: { title: "Untitled" }',
      '    },',
      '    screenshot: null',
      '  } }));',
      '} else {',
      '  console.error("unexpected args: " + args.join(" "));',
      '  process.exit(1);',
      '}'
    ].join('\n'),
    'utf8'
  )
  chmodSync(cliPath, 0o755)
  return cliPath
}
