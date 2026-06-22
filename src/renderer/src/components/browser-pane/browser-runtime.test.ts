import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearLiveBrowserUrl,
  getLiveBrowserUrl,
  getLiveBrowserUrlRevision,
  rememberLiveBrowserUrl,
  subscribeLiveBrowserUrls
} from './browser-runtime'

describe('browser runtime live URL cache', () => {
  beforeEach(() => {
    clearLiveBrowserUrl('page-1')
  })

  it('remembers and clears the last live URL for a browser page', () => {
    rememberLiveBrowserUrl('page-1', 'https://example.com/')

    expect(getLiveBrowserUrl('page-1')).toBe('https://example.com/')

    clearLiveBrowserUrl('page-1')

    expect(getLiveBrowserUrl('page-1')).toBeNull()
  })

  it('notifies subscribers when a live URL changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeLiveBrowserUrls(listener)
    const initialRevision = getLiveBrowserUrlRevision()

    rememberLiveBrowserUrl('page-1', 'https://example.com/')
    rememberLiveBrowserUrl('page-1', 'https://example.com/')
    clearLiveBrowserUrl('page-1')
    unsubscribe()
    rememberLiveBrowserUrl('page-1', 'https://example.com/again')

    expect(listener).toHaveBeenCalledTimes(2)
    expect(getLiveBrowserUrlRevision()).toBe(initialRevision + 3)
  })
})
