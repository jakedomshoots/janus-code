import { describe, expect, it } from 'vitest'
import {
  beginTabActivationGesture,
  cancelTabActivationGesture,
  createTabActivationGesture,
  finishTabActivationGesture,
  updateTabActivationGesture
} from './tab-activation-gesture'

describe('tab activation gesture', () => {
  it('commits activation for a pointer release without drag travel', () => {
    const gesture = createTabActivationGesture()

    beginTabActivationGesture(gesture, { button: 0, clientX: 10, clientY: 10, pointerId: 1 })

    expect(finishTabActivationGesture(gesture, { clientX: 12, clientY: 12, pointerId: 1 })).toBe(
      true
    )
  })

  it('suppresses activation after drag travel crosses the tab threshold', () => {
    const gesture = createTabActivationGesture()

    beginTabActivationGesture(gesture, { button: 0, clientX: 10, clientY: 10, pointerId: 1 })
    updateTabActivationGesture(gesture, { clientX: 16, clientY: 10, pointerId: 1 })

    expect(finishTabActivationGesture(gesture, { clientX: 16, clientY: 10, pointerId: 1 })).toBe(
      false
    )
  })

  it('cancels stale gestures without activating another pointer', () => {
    const gesture = createTabActivationGesture()

    beginTabActivationGesture(gesture, { button: 0, clientX: 10, clientY: 10, pointerId: 1 })
    cancelTabActivationGesture(gesture)

    expect(finishTabActivationGesture(gesture, { clientX: 10, clientY: 10, pointerId: 1 })).toBe(
      false
    )
  })
})
