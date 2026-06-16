import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyPackageCliBin } from './verify-cli-bin.mjs'

const requiredPackagedResources = [
  ['mac', 'resources/darwin/bin/agent-hub', 'bin/agent-hub'],
  ['linux', 'resources/linux/bin/agent-hub', 'bin/agent-hub'],
  ['win', 'resources/win32/bin/agent-hub.cmd', 'bin/agent-hub.cmd']
]

function writePackagedCliResources(
  projectDir,
  { missingResource = null, missingMapping = null } = {}
) {
  for (const [, from] of requiredPackagedResources) {
    if (from === missingResource) {
      continue
    }
    const resourcePath = path.join(projectDir, from)
    mkdirSync(path.dirname(resourcePath), { recursive: true })
    writeFileSync(
      resourcePath,
      from.endsWith('.cmd') ? '@echo off\n' : '#!/usr/bin/env bash\n',
      'utf8'
    )
    if (process.platform !== 'win32' && !from.endsWith('.cmd')) {
      chmodSync(resourcePath, 0o755)
    }
  }

  const resourceConfig = Object.fromEntries(
    requiredPackagedResources.map(([platform, from, to]) => [
      platform,
      {
        extraResources:
          platform === missingMapping
            ? []
            : [
                {
                  from,
                  to
                }
              ]
      }
    ])
  )
  mkdirSync(path.join(projectDir, 'config'), { recursive: true })
  writeFileSync(
    path.join(projectDir, 'config', 'electron-builder.config.cjs'),
    `module.exports = ${JSON.stringify(resourceConfig, null, 2)}\n`,
    'utf8'
  )
}

function makeProjectWithCli(content, mode = 0o755, packageJson = null, resourceOptions = {}) {
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
  writePackagedCliResources(projectDir, resourceOptions)
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
      aliases: ['orca'],
      warnings: []
    })
  })

  it('rejects a missing primary agent-hub bin entry', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: { orca: './out/cli/index.js' }
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.agent-hub')
  })

  it('warns when the orca compatibility alias is absent', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: { 'agent-hub': './out/cli/index.js' }
    })

    expect(verifyPackageCliBin({ projectDir }).warnings).toContain(
      'package.json does not declare optional bin.orca compatibility alias'
    )
  })

  it('warns when the orca compatibility alias points somewhere else', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, {
      bin: {
        'agent-hub': './out/cli/index.js',
        orca: './out/cli/legacy.js'
      }
    })

    expect(verifyPackageCliBin({ projectDir }).warnings).toContain(
      'bin.orca compatibility alias points to ./out/cli/legacy.js instead of ./out/cli/index.js'
    )
  })

  it('rejects an empty package bin target', () => {
    const { projectDir } = makeProjectWithCli('')

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('bin.agent-hub target is empty')
  })

  it('rejects package bin targets without a Node shebang', () => {
    const { projectDir } = makeProjectWithCli('console.log("orca")\n')

    expect(() => verifyPackageCliBin({ projectDir })).toThrow('Node shebang')
  })

  it('rejects missing packaged agent-hub launcher resources', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, null, {
      missingResource: 'resources/linux/bin/agent-hub'
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow(
      'Missing packaged agent-hub launcher resource: resources/linux/bin/agent-hub'
    )
  })

  it('rejects missing electron-builder agent-hub launcher resource mappings', () => {
    const { projectDir } = makeProjectWithCli('#!/usr/bin/env node\n', 0o755, null, {
      missingMapping: 'win'
    })

    expect(() => verifyPackageCliBin({ projectDir })).toThrow(
      'electron-builder win.extraResources must map ' +
        'resources/win32/bin/agent-hub.cmd to bin/agent-hub.cmd'
    )
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
