import { cp, mkdtemp, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

function readAppDirArg(argv) {
  const explicit = argv.find((arg) => arg.startsWith('--app-dir='))
  if (explicit) {
    return explicit.slice('--app-dir='.length)
  }
  if (process.platform === 'darwin') {
    return 'dist/mac-arm64/Janus Code.app'
  }
  if (process.platform === 'win32') {
    return 'dist/win-unpacked'
  }
  return 'dist/linux-unpacked'
}

function readAllowLegacyCliFallbackArg(argv) {
  return (
    argv.includes('--allow-legacy-cli-fallback') ||
    process.env.ORCA_PACKAGED_CLI_ALLOW_LEGACY_FALLBACK === '1'
  )
}

function getPackagedCliPath(appDir, { allowLegacyFallback }) {
  if (process.platform === 'darwin' || appDir.endsWith('.app')) {
    return resolvePrimaryPackagedCliPath({
      primary: join(appDir, 'Contents', 'Resources', 'bin', 'janus'),
      fallbacks: [
        join(appDir, 'Contents', 'Resources', 'bin', 'agent-hub'),
        join(appDir, 'Contents', 'Resources', 'bin', 'orca')
      ],
      allowLegacyFallback
    })
  }
  if (process.platform === 'win32') {
    return resolvePrimaryPackagedCliPath({
      primary: join(appDir, 'resources', 'bin', 'janus.cmd'),
      fallbacks: [
        join(appDir, 'resources', 'bin', 'agent-hub.cmd'),
        join(appDir, 'resources', 'bin', 'orca.cmd')
      ],
      allowLegacyFallback
    })
  }
  return resolvePrimaryPackagedCliPath({
    primary: join(appDir, 'resources', 'bin', 'janus'),
    fallbacks: [
      join(appDir, 'resources', 'bin', 'agent-hub'),
      join(appDir, 'resources', 'bin', 'orca-ide')
    ],
    allowLegacyFallback
  })
}

function resolvePrimaryPackagedCliPath({ primary, fallbacks, allowLegacyFallback }) {
  if (!allowLegacyFallback || existsSync(primary)) {
    return primary
  }
  for (const fallback of fallbacks) {
    if (existsSync(fallback)) {
      console.warn(`[packaged-cli-smoke] primary launcher missing; using fallback ${fallback}`)
      return fallback
    }
  }
  return primary
}

const argv = process.argv.slice(2)
const appDir = resolve(readAppDirArg(argv))
const allowLegacyFallback = readAllowLegacyCliFallbackArg(argv)
const tempRoot = await mkdtemp(join(tmpdir(), 'orca-packaged-cli-smoke-'))
const copiedAppDir = join(tempRoot, basename(appDir))

try {
  await cp(appDir, copiedAppDir, { recursive: true, verbatimSymlinks: true })
  const cliPath = getPackagedCliPath(copiedAppDir, { allowLegacyFallback })
  await execFileAsync(cliPath, ['--help'], {
    env: { ...process.env, NODE_PATH: '' }
  })
  console.log(`[packaged-cli-smoke] ${cliPath} --help succeeded outside the repo`)
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
