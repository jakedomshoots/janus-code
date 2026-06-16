import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  requiredPackagedArtifacts,
  verifyPackagedArtifacts
} from './verify-packaged-release-artifacts.mjs'

function withTempDir(callback) {
  const dir = join(tmpdir(), `janus-code-artifacts-${process.pid}-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  try {
    callback(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('verifyPackagedArtifacts', () => {
  it('reports missing artifacts', () => {
    withTempDir((dir) => {
      writeFileSync(join(dir, 'latest-mac.yml'), '')

      expect(verifyPackagedArtifacts(dir)).toContain('janus-code-macos-arm64.dmg')
    })
  })

  it('passes when all required artifacts exist', () => {
    withTempDir((dir) => {
      for (const name of requiredPackagedArtifacts({ version: '1.2.3' })) {
        writeFileSync(join(dir, name), '')
      }

      expect(verifyPackagedArtifacts(dir, { version: '1.2.3' })).toEqual([])
    })
  })

  it('can verify only local macOS artifacts', () => {
    withTempDir((dir) => {
      for (const name of requiredPackagedArtifacts({ platform: 'mac', version: '1.2.3' })) {
        writeFileSync(join(dir, name), '')
      }

      expect(verifyPackagedArtifacts(dir, { platform: 'mac', version: '1.2.3' })).toEqual([])
    })
  })
})
