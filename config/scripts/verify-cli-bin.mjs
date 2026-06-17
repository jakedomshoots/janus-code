#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { chmodSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const REQUIRED_PACKAGED_LAUNCHERS = [
  {
    platform: 'mac',
    from: 'resources/darwin/bin/janus',
    to: 'bin/janus',
    executable: true
  },
  {
    platform: 'linux',
    from: 'resources/linux/bin/janus',
    to: 'bin/janus',
    executable: true
  },
  {
    platform: 'win',
    from: 'resources/win32/bin/janus.cmd',
    to: 'bin/janus.cmd',
    executable: false
  }
]

export function verifyPackageCliBin({
  projectDir = path.resolve(import.meta.dirname, '..', '..'),
  fixExecutable = false,
  runHelp = false
} = {}) {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const primaryName = 'janus'
  const aliases = ['agent-hub']
  const warnings = []
  const binTarget = packageJson.bin?.[primaryName]
  if (typeof binTarget !== 'string' || binTarget.length === 0) {
    throw new Error('package.json must declare bin.janus')
  }
  for (const alias of aliases) {
    const aliasTarget = packageJson.bin?.[alias]
    if (typeof aliasTarget !== 'string' || aliasTarget.length === 0) {
      warnings.push(`package.json does not declare optional bin.${alias} compatibility alias`)
    } else if (aliasTarget !== binTarget) {
      warnings.push(
        `bin.${alias} compatibility alias points to ${aliasTarget} instead of ${binTarget}`
      )
    }
  }

  const binPath = path.resolve(projectDir, binTarget)
  let stats
  try {
    stats = statSync(binPath)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`bin.janus target is not a file: ${binTarget}`)
    }
    throw error
  }
  if (!stats.isFile()) {
    throw new Error(`bin.janus target is not a file: ${binTarget}`)
  }
  if (stats.size === 0) {
    throw new Error(`bin.janus target is empty: ${binTarget}`)
  }

  const content = readFileSync(binPath, 'utf8')
  if (!content.startsWith('#!/usr/bin/env node\n')) {
    throw new Error(`bin.janus target must start with a Node shebang: ${binTarget}`)
  }

  if (process.platform !== 'win32' && (stats.mode & 0o111) === 0) {
    if (!fixExecutable) {
      throw new Error(`bin.janus target is not executable: ${binTarget}`)
    }
    chmodSync(binPath, stats.mode | 0o755)
  }

  if (runHelp) {
    execFileSync(process.execPath, [binPath, '--help'], {
      cwd: projectDir,
      stdio: 'ignore'
    })
  }

  verifyPackagedLauncherResources(projectDir)

  return { binPath, primaryName, aliases, warnings, size: statSync(binPath).size }
}

function verifyPackagedLauncherResources(projectDir) {
  for (const launcher of REQUIRED_PACKAGED_LAUNCHERS) {
    const launcherPath = path.join(projectDir, launcher.from)
    let stats
    try {
      stats = statSync(launcherPath)
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Missing packaged janus launcher resource: ${launcher.from}`)
      }
      throw error
    }
    if (!stats.isFile()) {
      throw new Error(`Packaged janus launcher resource is not a file: ${launcher.from}`)
    }
    if (stats.size === 0) {
      throw new Error(`Packaged janus launcher resource is empty: ${launcher.from}`)
    }
    if (launcher.executable && process.platform !== 'win32' && (stats.mode & 0o111) === 0) {
      throw new Error(`Packaged janus launcher resource is not executable: ${launcher.from}`)
    }
  }

  const builderConfigPath = path.join(projectDir, 'config', 'electron-builder.config.cjs')
  const requireFromProject = createRequire(pathToFileURL(path.join(projectDir, 'package.json')))
  const builderConfig = requireFromProject(builderConfigPath)
  for (const launcher of REQUIRED_PACKAGED_LAUNCHERS) {
    const resources = builderConfig[launcher.platform]?.extraResources ?? []
    const hasMapping = resources.some(
      (resource) => resource?.from === launcher.from && resource?.to === launcher.to
    )
    if (!hasMapping) {
      throw new Error(
        `electron-builder ${launcher.platform}.extraResources must map ` +
          `${launcher.from} to ${launcher.to}`
      )
    }
  }
}

function main() {
  const args = new Set(process.argv.slice(2))
  const result = verifyPackageCliBin({
    fixExecutable: args.has('--fix-executable'),
    runHelp: args.has('--run-help')
  })
  const relativeBinPath = path.relative(process.cwd(), result.binPath)
  console.log(
    `[cli-bin] verified ${result.primaryName} at ${relativeBinPath} ` +
      `(${result.size} bytes); aliases: ${result.aliases.join(', ')}`
  )
  for (const warning of result.warnings) {
    console.warn(`[cli-bin] warning: ${warning}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
