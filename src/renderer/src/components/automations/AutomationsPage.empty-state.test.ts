import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AutomationsPage empty state', () => {
  it('explains the project prerequisite before offering templates', () => {
    const source = readFileSync(join(import.meta.dirname, 'AutomationsPage.tsx'), 'utf8')

    expect(source).toContain('Add a project before using automation templates.')
    expect(source).toContain('Templates need a project target before Janus Code can schedule runs.')
  })
})
