#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { accessSync, constants, existsSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = realpathSync(fileURLToPath(import.meta.url))
const scriptDir = path.dirname(scriptPath)
const repoRoot = path.resolve(scriptDir, '..', '..')
const cliEntry =
  process.env.JANUS_DEV_CLI_ENTRY_PATH ??
  process.env.ORCA_DEV_CLI_ENTRY_PATH ??
  path.join(repoRoot, 'out', 'cli', 'index.js')

if (!existsSync(cliEntry)) {
  console.error("janus-dev: CLI not built yet. Run 'pnpm run build:cli' first.")
  process.exit(1)
}

process.env.JANUS_USER_DATA_PATH =
  process.env.JANUS_DEV_USER_DATA_PATH ??
  process.env.ORCA_DEV_USER_DATA_PATH ??
  getDefaultDevUserDataPath()
process.env.ORCA_USER_DATA_PATH ??= process.env.JANUS_USER_DATA_PATH
if (process.env.JANUS_APP_EXECUTABLE) {
  process.env.ORCA_APP_EXECUTABLE ??= process.env.JANUS_APP_EXECUTABLE
}
if (process.env.JANUS_APP_EXECUTABLE_NEEDS_APP_ROOT) {
  process.env.ORCA_APP_EXECUTABLE_NEEDS_APP_ROOT ??= process.env.JANUS_APP_EXECUTABLE_NEEDS_APP_ROOT
}

const electronExecutable = getElectronExecutable()
if (
  !process.env.JANUS_APP_EXECUTABLE &&
  !process.env.ORCA_APP_EXECUTABLE &&
  isRunnableFile(electronExecutable)
) {
  process.env.JANUS_APP_EXECUTABLE = electronExecutable
  process.env.ORCA_APP_EXECUTABLE = electronExecutable
  process.env.JANUS_APP_EXECUTABLE_NEEDS_APP_ROOT = '1'
  process.env.ORCA_APP_EXECUTABLE_NEEDS_APP_ROOT = '1'
}

const result = spawnSync(process.execPath, [cliEntry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
})

if (result.signal) {
  process.kill(process.pid, result.signal)
}
process.exit(result.status ?? (result.error ? 1 : 0))

function getDefaultDevUserDataPath() {
  if (process.platform === 'darwin') {
    return path.join(process.env.HOME ?? '', 'Library', 'Application Support', 'janus-dev')
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA ?? path.join(process.env.USERPROFILE ?? '', 'AppData', 'Roaming'),
      'janus-dev'
    )
  }
  return path.join(
    process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME ?? '', '.config'),
    'janus-dev'
  )
}

function getElectronExecutable() {
  if (process.platform === 'win32') {
    return path.join(repoRoot, 'node_modules', 'electron', 'dist', 'electron.exe')
  }
  return path.join(repoRoot, 'node_modules', '.bin', 'electron')
}

function isRunnableFile(candidate) {
  try {
    const stats = statSync(candidate)
    if (!stats.isFile()) {
      return false
    }
    if (process.platform === 'win32') {
      return true
    }
    accessSync(candidate, constants.X_OK)
    return true
  } catch {
    return false
  }
}
