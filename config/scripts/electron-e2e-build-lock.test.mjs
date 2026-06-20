import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

import { describe, expect, it } from 'vitest'

import {
  getElectronE2eBuildLockPath,
  runWithElectronE2eBuildLock
} from './electron-e2e-build-lock.mjs'

describe('runWithElectronE2eBuildLock', () => {
  it('waits until another process releases the same repo build lock', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'janus-e2e-build-lock-'))
    const events = []
    const lockPath = getElectronE2eBuildLockPath(root)
    mkdirSync(lockPath, { recursive: true })

    try {
      const releaser = new Worker(
        `
          const { rmSync } = require('node:fs')
          const { workerData } = require('node:worker_threads')
          setTimeout(() => rmSync(workerData.lockPath, { recursive: true, force: true }), 50)
        `,
        { eval: true, workerData: { lockPath } }
      )

      const startedAt = Date.now()
      runWithElectronE2eBuildLock(
        root,
        () => {
          events.push('callback')
        },
        { staleAfterMs: 60_000, waitTimeoutMs: 1_000, pollIntervalMs: 5 }
      )
      await releaser.terminate()

      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(40)
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(lockPath, { recursive: true, force: true })
    }

    expect(events).toEqual(['callback'])
  })
})
