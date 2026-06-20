import { describe, expect, it } from 'vitest'
import { AUTO_RESTORE_FIT_OPTIONS, autoRestoreValueFromMs } from './mobile-auto-restore-options'

describe('mobile auto-restore fit options', () => {
  it('maps persisted restore delays to select option values', () => {
    expect(AUTO_RESTORE_FIT_OPTIONS.map((option) => [option.value, option.ms])).toEqual([
      ['indefinite', null],
      ['60s', 60_000],
      ['5m', 5 * 60_000],
      ['30m', 30 * 60_000]
    ])
    expect(autoRestoreValueFromMs(null)).toBe('indefinite')
    expect(autoRestoreValueFromMs(undefined)).toBe('indefinite')
    expect(autoRestoreValueFromMs(60_000)).toBe('60s')
    expect(autoRestoreValueFromMs(5 * 60_000)).toBe('5m')
    expect(autoRestoreValueFromMs(30 * 60_000)).toBe('30m')
    expect(autoRestoreValueFromMs(42)).toBe('indefinite')
  })
})
