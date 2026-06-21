import { describe, expect, it } from 'vitest'
import { TAB_CONTAINER_WIDTH_CLASSES } from './tab-width-rules'

describe('tab width rules', () => {
  it('keeps tab hit targets content-sized instead of flex-growing across the strip', () => {
    expect(TAB_CONTAINER_WIDTH_CLASSES).toContain('flex-[0_1_auto]')
    expect(TAB_CONTAINER_WIDTH_CLASSES).toContain('w-fit')
    expect(TAB_CONTAINER_WIDTH_CLASSES).not.toContain('flex-[1_1_180px]')
  })
})
