#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

export function requiredDirectDownloadArtifacts({ version = packageJson.version } = {}) {
  return [
    'janus-code-macos-arm64.dmg',
    'janus-code-macos-x64.dmg',
    `Janus-Code-${version}-arm64-mac.zip`,
    `Janus-Code-${version}-x64-mac.zip`
  ]
}

export function parseSha256Sums(content) {
  const entries = new Map()
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/)
    if (!match) {
      continue
    }
    entries.set(basename(match[2].trim()), match[1].toLowerCase())
  }
  return entries
}

export function verifyDirectDownloadArtifacts(
  baseDir = 'dist',
  { version = packageJson.version } = {}
) {
  const requiredArtifacts = requiredDirectDownloadArtifacts({ version })
  const missingArtifacts = requiredArtifacts.filter((name) => !existsSync(join(baseDir, name)))
  const sumsPath = join(baseDir, 'SHA256SUMS.txt')
  const missingChecksums = []
  if (!existsSync(sumsPath)) {
    missingChecksums.push('SHA256SUMS.txt')
  } else {
    const sums = parseSha256Sums(readFileSync(sumsPath, 'utf8'))
    for (const name of requiredArtifacts) {
      if (!sums.has(name)) {
        missingChecksums.push(`SHA256SUMS.txt:${name}`)
      }
    }
  }
  return { missingArtifacts, missingChecksums }
}

function readArgs(argv) {
  const args = {
    baseDir: 'dist',
    version: packageJson.version
  }
  for (const arg of argv) {
    if (arg.startsWith('--version=')) {
      args.version = arg.slice('--version='.length)
      continue
    }
    args.baseDir = arg
  }
  return args
}

export function main() {
  const args = readArgs(process.argv.slice(2))
  const result = verifyDirectDownloadArtifacts(args.baseDir, { version: args.version })
  if (result.missingArtifacts.length > 0 || result.missingChecksums.length > 0) {
    if (result.missingArtifacts.length > 0) {
      console.error(`Missing direct-download artifacts: ${result.missingArtifacts.join(', ')}`)
    }
    if (result.missingChecksums.length > 0) {
      console.error(`Missing direct-download checksums: ${result.missingChecksums.join(', ')}`)
    }
    process.exit(1)
  }
  console.log('Verified direct-download artifacts and checksums')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
