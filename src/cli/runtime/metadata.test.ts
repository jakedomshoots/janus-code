import { join } from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { getDefaultUserDataPath } from './metadata'

const originalAppData = process.env.APPDATA
const originalJanusUserDataPath = process.env.JANUS_USER_DATA_PATH
const originalOrcaUserDataPath = process.env.ORCA_USER_DATA_PATH

afterEach(() => {
  if (originalAppData === undefined) {
    delete process.env.APPDATA
  } else {
    process.env.APPDATA = originalAppData
  }
  if (originalJanusUserDataPath === undefined) {
    delete process.env.JANUS_USER_DATA_PATH
  } else {
    process.env.JANUS_USER_DATA_PATH = originalJanusUserDataPath
  }
  if (originalOrcaUserDataPath === undefined) {
    delete process.env.ORCA_USER_DATA_PATH
  } else {
    process.env.ORCA_USER_DATA_PATH = originalOrcaUserDataPath
  }
})

describe('getDefaultUserDataPath', () => {
  it('targets Janus Code packaged user data by default on macOS', () => {
    delete process.env.JANUS_USER_DATA_PATH
    delete process.env.ORCA_USER_DATA_PATH

    expect(getDefaultUserDataPath('darwin', '/Users/alice')).toBe(
      join('/Users/alice', 'Library', 'Application Support', 'janus-code')
    )
  })

  it('allows Janus Code user data to be overridden without the legacy Orca env var', () => {
    process.env.JANUS_USER_DATA_PATH = '/tmp/janus-user-data'
    process.env.ORCA_USER_DATA_PATH = '/tmp/orca-user-data'

    expect(getDefaultUserDataPath('darwin', '/Users/alice')).toBe('/tmp/janus-user-data')
  })
})
