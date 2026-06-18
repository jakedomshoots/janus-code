#!/usr/bin/env node
// Symlinks the janus-dev wrapper into the first writable command directory so
// the dev CLI is available after `pnpm run build:cli`.
import { accessSync, constants, existsSync, lstatSync, mkdirSync, readlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(scriptDir, 'janus-dev.mjs')

const commandPaths =
  process.platform === 'darwin' || process.platform === 'linux'
    ? ['/usr/local/bin/janus-dev', path.join(os.homedir(), '.local', 'bin', 'janus-dev')]
    : []

if (commandPaths.length === 0) {
  console.log('[janus-dev] Skipping global symlink (unsupported platform).')
  process.exit(0)
}

function isOwnedByUs(target) {
  try {
    if (!lstatSync(target).isSymbolicLink()) {
      return false
    }
    return readlinkSync(target) === source
  } catch {
    return false
  }
}

function canWriteDirectory(directory) {
  try {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true })
    }
    accessSync(directory, constants.W_OK)
    return true
  } catch {
    return false
  }
}

function selectCommandPath() {
  for (const candidate of commandPaths) {
    if (existsSync(candidate)) {
      if (isOwnedByUs(candidate)) {
        return candidate
      }
      continue
    }
    if (canWriteDirectory(path.dirname(candidate))) {
      return candidate
    }
  }
  return null
}

const commandPath = selectCommandPath()

if (!commandPath) {
  console.log(
    '[janus-dev] Skipping dev CLI symlink because no writable command directory was found.'
  )
  process.exit(0)
}

if (existsSync(commandPath)) {
  if (isOwnedByUs(commandPath)) {
    console.log(`[janus-dev] ${commandPath} already points to dev CLI.`)
    process.exit(0)
  }
  console.error(
    `[janus-dev] ${commandPath} exists but is not our symlink. Remove it manually if you want the dev CLI installed globally.`
  )
  process.exit(0)
}

try {
  execFileSync('ln', ['-s', source, commandPath], { stdio: 'inherit' })
  console.log(`[janus-dev] Symlinked ${commandPath} → ${source}`)
} catch {
  console.log(
    `[janus-dev] Could not create ${commandPath}. Add this symlink manually if you need it:\n` +
      `  ln -s ${source} ${commandPath}`
  )
}
