import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

describe('packaged Windows CLI launcher asset', () => {
  it('keeps the Janus launcher wired to Janus Code.exe', () => {
    const launcherPath = join(process.cwd(), 'resources', 'win32', 'bin', 'janus.cmd')
    const launcher = readFileSync(launcherPath, 'utf8')

    expect(launcher).toContain('for %%I in ("%RESOURCES_DIR%\\..") do set "APP_DIR=%%~fI"')
    expect(launcher).toContain('set "ELECTRON=%APP_DIR%\\Janus Code.exe"')
    expect(launcher).not.toContain('set "ELECTRON=%APP_DIR%\\Orca.exe"')
    expect(launcher).not.toContain('for %%I in ("%RESOURCES_DIR%..") do set "APP_DIR=%%~fI"')
  })

  it('walks from resources/bin back to the app root before locating Janus Code.exe', () => {
    const launcherPath = join(process.cwd(), 'resources', 'win32', 'bin', 'agent-hub.cmd')
    const launcher = readFileSync(launcherPath, 'utf8')

    expect(launcher).toContain('for %%I in ("%RESOURCES_DIR%\\..") do set "APP_DIR=%%~fI"')
    expect(launcher).toContain('set "ELECTRON=%APP_DIR%\\Janus Code.exe"')
    expect(launcher).not.toContain('set "ELECTRON=%APP_DIR%\\Orca.exe"')
  })
})
