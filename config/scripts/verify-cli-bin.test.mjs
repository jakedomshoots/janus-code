import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyPackageCliBin } from './verify-cli-bin.mjs'

function makeProjectWithCli(content, mode = 0o755, packageJson = null) {
  const projectDir = mkdtempSync(path.join(tmpdir(), 'orca-cli-bin-'))
  const cliPath = path.join(projectDir, 'out', 'cli', 'index.js')
  mkdirSync(path.dirname(cliPath), { recursive: true })
  writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(
      packageJson ?? {
        bin: {
          'agent-hub': './out/cli/index.js',
          orca: './out/cli/index.js'
        }
      }
    ),
    'utf8'
  )
  writeFileSync(cliPath, content, 'utf8')
  if (process.platform !== 'win32') {
    chmodSync(cliPath, mode)
  }
  return { projectDir, cliPath }
}

describe('verifyPackageCliBin', () => {
  it('accepts a non-empty Node entrypoint and can run help through Node', () => {
    const { projectDir, cliPath } = makeProjectWithCli(
      '#!/usr/bin/env node\nif (process.argv.includes("--help")) process.exit(0)\n'
    )

    expect(verifyPackageCliBin({ projectDir, runHelp: true })).toMatchObject({
      binPath: cliPath,
      primaryName: 'agent-hub',
      aliases: ['orca']
    })
  })

  it('rejects a missing primary agent-hub bin entry', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: { orca: './out/cli/index.js' }
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.agent-hub')
  })

  it('rejects a missing orca compatibility alias', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: { 'agent-hub': './out/cli/index.js' }
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.orca compatibility alias')
  })

  it('rejects an orca compatibility alias that points somewhere else', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: {
        'agent-hub': './out/cli/index.js',
        orca: './out/cli/legacy.js'
      }
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.orca compatibility alias')
  })

  it('rejects an empty package bin target', () => {
    const { projectDir } = makeProjectWithCli('')

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.agent-hub target is empty')
  })

  it('rejects package bin targets without a Node shebang', () => {
    const { projectDir } = makeProjectWithCli('console.log("orca")\n')

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('Node shebang')
  })

  it.skipIf(process.platform === 'win32')('can repair the POSIX executable bit', () => {
    const { projectDir, cliPath } = makeProjectWithCli(
      '#!/usr/bin/env node\nconsole.log("orca")\n',
      0o644
    )

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('not executable')
    verifyPackageCliBin({ projectDir, fixExecutable: true })
    expect(statSync(cliPath).mode & 0o111).not.toBe(0)
    expect(readFileSync(cliPath, 'utf8')).toContain('#!/usr/bin/env node')
  })
})
