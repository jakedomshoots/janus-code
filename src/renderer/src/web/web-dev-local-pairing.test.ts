import { describe, expect, it } from 'vitest'
import { isLocalDevWebHost } from './web-dev-local-pairing'

describe('isLocalDevWebHost', () => {
  it('accepts localhost dev hosts', () => {
    expect(isLocalDevWebHost('127.0.0.1')).toBe(true)
    expect(isLocalDevWebHost('localhost')).toBe(true)
  })

  it('rejects remote hosts', () => {
    expect(isLocalDevWebHost('example.com')).toBe(false)
  })
})
