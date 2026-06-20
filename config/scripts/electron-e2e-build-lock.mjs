import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

const DEFAULT_STALE_AFTER_MS = 10 * 60_000
const DEFAULT_WAIT_TIMEOUT_MS = 12 * 60_000
const DEFAULT_POLL_INTERVAL_MS = 100

export function getElectronE2eBuildLockPath(root) {
  const digest = createHash('sha256').update(path.resolve(root)).digest('hex').slice(0, 16)
  return path.join(tmpdir(), `janus-electron-e2e-build-${digest}.lock`)
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function isStale(lockPath, staleAfterMs) {
  if (staleAfterMs <= 0) {
    return true
  }
  try {
    return Date.now() - statSync(lockPath).mtimeMs > staleAfterMs
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function acquireLock(lockPath, options) {
  const startedAt = Date.now()
  while (true) {
    try {
      mkdirSync(lockPath)
      writeFileSync(
        path.join(lockPath, 'owner.json'),
        `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`
      )
      return
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error
      }
      if (isStale(lockPath, options.staleAfterMs)) {
        rmSync(lockPath, { recursive: true, force: true })
        continue
      }
      if (Date.now() - startedAt > options.waitTimeoutMs) {
        throw new Error(`Timed out waiting for Electron E2E build lock at ${lockPath}`)
      }
      sleepSync(options.pollIntervalMs)
    }
  }
}

export function runWithElectronE2eBuildLock(root, callback, options = {}) {
  const lockOptions = {
    staleAfterMs: options.staleAfterMs ?? DEFAULT_STALE_AFTER_MS,
    waitTimeoutMs: options.waitTimeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS,
    pollIntervalMs: options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS
  }
  const lockPath = getElectronE2eBuildLockPath(root)
  acquireLock(lockPath, lockOptions)
  try {
    return callback()
  } finally {
    rmSync(lockPath, { recursive: true, force: true })
  }
}
