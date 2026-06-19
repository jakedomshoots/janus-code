# Release Perf Scorecard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable release performance scorecard that turns existing Janus perf evidence into one pass/fail report and highlights the biggest startup and interaction risks.

**Architecture:** Keep the first slice read-only and script-based. The scorecard reads built renderer assets and existing perf report JSON, runs only cheap local analysis by default, and leaves heavier Playwright benchmarks as explicit prereqs so releases can run them when needed.

**Tech Stack:** Node.js ESM scripts, Vitest tests, existing `test-results` perf JSON, existing `pnpm` script wiring.

---

### Task 1: Add Scorecard Parser And Budget Tests

**Files:**
- Create: `config/scripts/release-perf-scorecard.mjs`
- Create: `config/scripts/release-perf-scorecard.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildReleasePerfScorecard } from './release-perf-scorecard.mjs'

describe('release perf scorecard', () => {
  it('fails when the initial renderer chunk is over budget', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'janus-perf-scorecard-'))
    const assetsDir = path.join(root, 'out', 'renderer', 'assets')
    mkdirSync(assetsDir, { recursive: true })
    writeFileSync(path.join(assetsDir, 'index-test.js'), 'x'.repeat(9 * 1024 * 1024))

    const report = buildReleasePerfScorecard({ repoRoot: root })

    expect(report.status).toBe('fail')
    expect(report.checks.some((check) => check.id === 'renderer.initial-js')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --config config/vitest.config.ts config/scripts/release-perf-scorecard.test.mjs`

Expected: FAIL because `config/scripts/release-perf-scorecard.mjs` does not exist.

- [ ] **Step 3: Implement the scorecard**

```js
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_BUDGETS = {
  initialRendererJsBytes: 8 * 1024 * 1024,
  largestRendererAssetBytes: 12 * 1024 * 1024,
  idleMeanCpuPercent: 2,
  terminalWorstTypingMs: 25,
  terminalRestoreMs: 900
}

export function buildReleasePerfScorecard({ repoRoot = defaultRepoRoot(), budgets = {} } = {}) {
  const effectiveBudgets = { ...DEFAULT_BUDGETS, ...budgets }
  const checks = [
    ...buildAssetChecks(repoRoot, effectiveBudgets),
    ...buildIdleCpuChecks(repoRoot, effectiveBudgets),
    ...buildTerminalScaleChecks(repoRoot, effectiveBudgets)
  ]
  return {
    status: checks.some((check) => check.status === 'fail') ? 'fail' : 'pass',
    checks
  }
}

function buildAssetChecks(repoRoot, budgets) {
  const assetsDir = path.join(repoRoot, 'out', 'renderer', 'assets')
  if (!existsSync(assetsDir)) {
    return [missingCheck('renderer.assets', 'Run pnpm run build:electron-vite first.')]
  }
  const assets = readdirSync(assetsDir).map((name) => ({
    name,
    bytes: statSync(path.join(assetsDir, name)).size
  }))
  const initialJs = assets.find((asset) => /^index-[^-]+\.js$/.test(asset.name))
  const largest = assets.toSorted((left, right) => right.bytes - left.bytes)[0] ?? null
  return [
    budgetCheck(
      'renderer.initial-js',
      initialJs?.bytes ?? 0,
      budgets.initialRendererJsBytes,
      initialJs?.name ?? 'missing initial renderer chunk'
    ),
    budgetCheck(
      'renderer.largest-asset',
      largest?.bytes ?? 0,
      budgets.largestRendererAssetBytes,
      largest?.name ?? 'missing renderer asset'
    )
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --config config/vitest.config.ts config/scripts/release-perf-scorecard.test.mjs`

Expected: PASS.

### Task 2: Wire Scorecard Into Package Scripts

**Files:**
- Modify: `package.json`
- Modify: `config/scripts/run-janus-workflow-assurance.mjs`
- Modify: `config/scripts/janus-workflow-assurance-suite.test.mjs`

- [ ] **Step 1: Add a package script**

```json
"verify:release-perf-scorecard": "node config/scripts/release-perf-scorecard.mjs"
```

- [ ] **Step 2: Add the scorecard test to the assurance suite**

```js
'config/scripts/release-perf-scorecard.test.mjs',
```

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run --config config/vitest.config.ts config/scripts/release-perf-scorecard.test.mjs config/scripts/janus-workflow-assurance-suite.test.mjs`

Expected: PASS.

### Task 3: Capture Current Performance Findings

**Files:**
- Create: `docs/reference/release-performance-scorecard.md`

- [ ] **Step 1: Record current baseline evidence**

```md
# Release Performance Scorecard

Use `pnpm run verify:release-perf-scorecard` after building renderer assets and after running optional heavy benchmarks.

Current 2026-06-19 baseline:
- Idle CPU short run: total mean 0.81%, renderer mean 0%.
- Terminal scale report: budget passed for 15 annotation rows.
- PTY batching: bounded max callback 0.318ms, current ingress max 17.565ms.
- File explorer projection: indexed visible-window p95 0.002ms.
- Highest startup risk: initial renderer JS and scroll-cache assets are multi-megabyte.
```

- [ ] **Step 2: Run docs grep to ensure command names are findable**

Run: `rg -n "verify:release-perf-scorecard|Release Performance Scorecard" docs package.json`

Expected: Finds the new package script and doc.

### Task 4: Verify And Commit

**Files:**
- All files above.

- [ ] **Step 1: Run verification**

Run:

```bash
pnpm run verify:release-perf-scorecard
npx vitest run --config config/vitest.config.ts config/scripts/release-perf-scorecard.test.mjs config/scripts/janus-workflow-assurance-suite.test.mjs
pnpm run verify:janus-workflow-assurance
```

Expected: all commands exit 0, or the scorecard reports a real budget failure that gets documented as a P1 perf task.

- [ ] **Step 2: Commit**

```bash
git add package.json config/scripts/release-perf-scorecard.mjs config/scripts/release-perf-scorecard.test.mjs config/scripts/run-janus-workflow-assurance.mjs config/scripts/janus-workflow-assurance-suite.test.mjs docs/reference/release-performance-scorecard.md docs/superpowers/plans/2026-06-19-release-perf-scorecard.md
git commit -m "Add release performance scorecard"
```
