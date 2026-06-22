// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PhoneCarousel } from './PhoneCarousel'

vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string) => fallback
}))

let container: HTMLDivElement
let root: Root
let originalMatchMedia: typeof window.matchMedia | undefined

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers()
  originalMatchMedia = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  })
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.useRealTimers()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia
  })
  globalThis.IS_REACT_ACT_ENVIRONMENT = false
})

describe('PhoneCarousel', () => {
  it('removes inactive phone slides from keyboard and screen reader navigation', () => {
    act(() => {
      root.render(<PhoneCarousel />)
    })

    const slides = Array.from(container.querySelectorAll('.mp-screen-slide'))

    expect(slides).toHaveLength(4)
    expect(slides[0]?.hasAttribute('aria-hidden')).toBe(false)
    expect(slides[0]?.hasAttribute('inert')).toBe(false)
    for (const slide of slides.slice(1)) {
      expect(slide.getAttribute('aria-hidden')).toBe('true')
      expect(slide.hasAttribute('inert')).toBe(true)
    }
  })
})
