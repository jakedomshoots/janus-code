import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildReleasePerfScorecard, formatReleasePerfScorecard } from './release-perf-scorecard.mjs'

describe('release perf scorecard', () => {
  it('fails when the initial renderer chunk is over budget', () => {
    const root = makeFixtureRoot([
      ['index-small.js', 1024],
      ['index-large.js', 9 * 1024 * 1024],
      ['scroll-cache-test.js', 1024]
    ])

    const report = buildReleasePerfScorecard({ repoRoot: root })

    expect(report.status).toBe('fail')
    expect(report.checks).toContainEqual(
      expect.objectContaining({ id: 'renderer.initial-js', status: 'fail' })
    )
  })

  it('parses optional terminal reports that contain build logs before JSON', () => {
    const root = makeFixtureRoot([
      ['index-test.js', 1024],
      ['scroll-cache-test.js', 1024]
    ])
    const reportPath = path.join(root, 'terminal-report.json')
    writeFileSync(
      reportPath,
      [
        '[e2e] build log before JSON',
        JSON.stringify({
          suites: [
            {
              specs: [
                {
                  tests: [
                    {
                      annotations: [
                        {
                          type: 'opencode-typing',
                          description: 'worst=24.5ms restore=649.9ms'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        })
      ].join('\n')
    )

    const report = buildReleasePerfScorecard({ repoRoot: root, terminalReportPath: reportPath })

    expect(report.checks).toContainEqual(
      expect.objectContaining({ id: 'terminal-scale.worst-typing', status: 'pass' })
    )
    expect(report.checks).toContainEqual(
      expect.objectContaining({ id: 'terminal-scale.restore', status: 'pass' })
    )
  })

  it('formats a readable report', () => {
    const output = formatReleasePerfScorecard({
      status: 'pass',
      checks: [
        {
          id: 'renderer.initial-js',
          status: 'pass',
          actual: '7.59 MiB',
          budget: '8.50 MiB',
          detail: 'index-test.js'
        }
      ]
    })

    expect(output).toContain('release perf scorecard: pass')
    expect(output).toContain('renderer.initial-js')
  })
})

function makeFixtureRoot(assets) {
  const root = mkdtempSync(path.join(tmpdir(), 'janus-perf-scorecard-'))
  const assetsDir = path.join(root, 'out', 'renderer', 'assets')
  mkdirSync(assetsDir, { recursive: true })
  for (const [name, size] of assets) {
    writeFileSync(path.join(assetsDir, name), 'x'.repeat(size))
  }
  return root
}
