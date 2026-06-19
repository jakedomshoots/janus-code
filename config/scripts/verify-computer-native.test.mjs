import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('verify-computer-native', () => {
  it.skipIf(process.platform !== 'darwin')('skips SwiftPM tests when XCTest is unavailable', () => {
    const binDir = join(tmpdir(), `janus-computer-native-bin-${process.pid}-${Date.now()}`)
    mkdirSync(binDir, { recursive: true })

    try {
      writeExecutable(
        join(binDir, 'swift'),
        [
          '#!/bin/sh',
          'echo "swift should not be invoked when XCTest is unavailable" >&2',
          'exit 99'
        ].join('\n')
      )
      writeExecutable(
        join(binDir, 'xcrun'),
        [
          '#!/bin/sh',
          'if [ "$1" = "--find" ] && [ "$2" = "xctest" ]; then exit 72; fi',
          'exit 1'
        ].join('\n')
      )
      writeExecutable(join(binDir, 'codesign'), ['#!/bin/sh', 'exit 0'].join('\n'))

      const result = spawnSync(process.execPath, ['config/scripts/verify-computer-native.mjs'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: [binDir, '/usr/bin', '/bin', '/usr/sbin', '/sbin'].join(delimiter)
        },
        encoding: 'utf8'
      })

      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain('skip macOS Swift renderer/provider tests: xctest not found')
      expect(result.stderr).not.toContain('swift should not be invoked')
    } finally {
      rmSync(binDir, { recursive: true, force: true })
    }
  })
})

function writeExecutable(path, contents) {
  writeFileSync(path, `${contents}\n`, { mode: 0o755 })
  chmodSync(path, 0o755)
}
