import { describe, expect, it, vi } from 'vitest'

const { mergePersistedWindowsPathMock } = vi.hoisted(() => ({
  mergePersistedWindowsPathMock: vi.fn()
}))

vi.mock('../pty/windows-environment-path', () => ({
  mergePersistedWindowsPath: mergePersistedWindowsPathMock
}))

import { buildLocalPreflightEnv } from './preflight-local-env'

describe('buildLocalPreflightEnv', () => {
  it('passes only defined process environment values to Windows PATH merging', () => {
    const originalPlatform = process.platform
    const originalEnv = process.env
    Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
    Object.defineProperty(process, 'env', {
      configurable: true,
      value: {
        PATH: 'C:\\Base',
        ORCA_DEFINED: 'yes',
        ORCA_UNDEFINED: undefined
      }
    })
    mergePersistedWindowsPathMock.mockReset()

    try {
      const env = buildLocalPreflightEnv()

      expect(env).toEqual({
        PATH: 'C:\\Base',
        ORCA_DEFINED: 'yes'
      })
      expect(Object.prototype.hasOwnProperty.call(env, 'ORCA_UNDEFINED')).toBe(false)
      expect(mergePersistedWindowsPathMock).toHaveBeenCalledWith(env)
    } finally {
      Object.defineProperty(process, 'env', { configurable: true, value: originalEnv })
      Object.defineProperty(process, 'platform', { configurable: true, value: originalPlatform })
    }
  })
})
