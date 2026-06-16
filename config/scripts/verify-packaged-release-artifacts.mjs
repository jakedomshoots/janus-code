#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

export function requiredPackagedArtifacts({
  platform = 'all',
  version = packageJson.version
} = {}) {
  const mac = [
    'janus-code-macos-arm64.dmg',
    'janus-code-macos-x64.dmg',
    `Janus-Code-${version}-arm64-mac.zip`,
    `Janus-Code-${version}-mac.zip`,
    'latest-mac.yml'
  ]
  const linux = ['janus-code-linux.AppImage', 'latest-linux.yml']
  const windows = ['janus-code-windows-setup.exe', 'latest.yml']
  if (platform === 'mac') {
    return mac
  }
  if (platform === 'linux') {
    return linux
  }
  if (platform === 'windows') {
    return windows
  }
  return [...mac, ...linux, ...windows]
}

export function verifyPackagedArtifacts(
  baseDir = 'dist',
  { platform = 'all', version = packageJson.version } = {}
) {
  return requiredPackagedArtifacts({ platform, version }).filter(
    (name) => !existsSync(join(baseDir, name))
  )
}

function readArgs(argv) {
  const args = {
    baseDir: 'dist',
    platform: 'all'
  }
  for (const arg of argv) {
    if (arg.startsWith('--platform=')) {
      args.platform = arg.slice('--platform='.length)
      continue
    }
    args.baseDir = arg
  }
  if (!['all', 'mac', 'linux', 'windows'].includes(args.platform)) {
    throw new Error(`Unsupported platform "${args.platform}"`)
  }
  return args
}

export function main() {
  const args = readArgs(process.argv.slice(2))
  const missing = verifyPackagedArtifacts(args.baseDir, { platform: args.platform })
  if (missing.length > 0) {
    console.error(`Missing packaged artifacts: ${missing.join(', ')}`)
    process.exit(1)
  }
  console.log('Verified packaged release artifacts')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
