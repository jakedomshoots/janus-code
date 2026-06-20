import { describe, expect, it } from 'vitest'
import type { ProviderRateLimits } from '../../../../shared/rate-limit-types'
import {
  getFeatureWallUsageProviderConnection,
  hasFeatureWallUsageTracking
} from './feature-wall-usage-tracking'

function rateLimits(overrides: Partial<ProviderRateLimits> = {}): ProviderRateLimits {
  return {
    provider: 'codex',
    session: null,
    weekly: null,
    updatedAt: 1,
    error: null,
    status: 'ok',
    ...overrides
  }
}

describe('feature wall usage tracking state', () => {
  it('treats local CLI Codex rate limit data as connected', () => {
    expect(
      getFeatureWallUsageProviderConnection({
        managedAccountCount: 0,
        provider: rateLimits({
          session: {
            usedPercent: 10,
            windowMinutes: 300,
            resetsAt: null,
            resetDescription: null
          }
        })
      })
    ).toEqual({ connected: true, label: 'Connected · local CLI login' })
  })

  it('keeps managed accounts connected even before live quota data arrives', () => {
    expect(
      getFeatureWallUsageProviderConnection({
        managedAccountCount: 2,
        provider: null
      })
    ).toEqual({ connected: true, label: 'Connected · 2' })
  })

  it('returns not set up when there are no accounts or quota signals', () => {
    expect(
      getFeatureWallUsageProviderConnection({
        managedAccountCount: 0,
        provider: null
      })
    ).toEqual({ connected: false, label: 'Tracking not set up' })
  })

  it('marks the usage step complete from local CLI provider data', () => {
    expect(
      hasFeatureWallUsageTracking({
        claudeManagedAccountCount: 0,
        codexManagedAccountCount: 0,
        claudeRateLimits: null,
        codexRateLimits: rateLimits()
      })
    ).toBe(true)
  })
})
