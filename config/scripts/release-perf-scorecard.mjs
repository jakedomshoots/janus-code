#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_BUDGETS = {
  initialRendererJsBytes: 8.5 * 1024 * 1024,
  largestRendererAssetBytes: 13 * 1024 * 1024,
  scrollCacheBytes: 3 * 1024 * 1024,
  idleMeanCpuPercent: 2,
  terminalWorstTypingMs: 300,
  terminalRestoreMs: 2000
}

export function buildReleasePerfScorecard({
  repoRoot = defaultRepoRoot(),
  terminalReportPath = [
    'perf-results/release/terminal-scale-report.json',
    'test-results/perf-audit-2026-06-19/terminal-scale-report.json'
  ],
  idleCpuReportPath = [
    'perf-results/release/idle-cpu.json',
    'test-results/perf-audit-2026-06-19/idle-cpu.json'
  ],
  budgets = DEFAULT_BUDGETS
} = {}) {
  const effectiveBudgets = { ...DEFAULT_BUDGETS, ...budgets }
  const checks = [
    ...buildAssetChecks(repoRoot, effectiveBudgets),
    ...buildIdleCpuChecks(resolveReportPath(repoRoot, idleCpuReportPath), effectiveBudgets),
    ...buildTerminalScaleChecks(resolveReportPath(repoRoot, terminalReportPath), effectiveBudgets)
  ]
  return {
    status: checks.some((check) => check.status === 'fail') ? 'fail' : 'pass',
    checks
  }
}

function resolveReportPath(repoRoot, reportPath) {
  const paths = Array.isArray(reportPath) ? reportPath : [reportPath]
  const resolvedPaths = paths.map((candidate) => path.resolve(repoRoot, candidate))
  return resolvedPaths.find((candidate) => existsSync(candidate)) ?? resolvedPaths[0]
}

export function formatReleasePerfScorecard(report) {
  const rows = report.checks.map((check) =>
    [
      check.status.toUpperCase().padEnd(4),
      check.id.padEnd(28),
      check.actual.padStart(12),
      `budget ${check.budget}`.padEnd(18),
      check.detail
    ].join('  ')
  )
  return [`release perf scorecard: ${report.status}`, ...rows].join('\n')
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
  const initialJs =
    assets
      .filter((asset) => /^index-.*\.js$/.test(asset.name))
      .sort((left, right) => right.bytes - left.bytes)[0] ?? null
  const largest = [...assets].sort((left, right) => right.bytes - left.bytes)[0] ?? null
  const scrollCache = assets.find((asset) => /^scroll-cache-.*\.js$/.test(asset.name))

  return [
    byteBudgetCheck(
      'renderer.initial-js',
      initialJs?.bytes ?? 0,
      budgets.initialRendererJsBytes,
      initialJs?.name ?? 'missing initial renderer chunk'
    ),
    byteBudgetCheck(
      'renderer.largest-asset',
      largest?.bytes ?? 0,
      budgets.largestRendererAssetBytes,
      largest?.name ?? 'missing renderer asset'
    ),
    byteBudgetCheck(
      'renderer.scroll-cache',
      scrollCache?.bytes ?? 0,
      budgets.scrollCacheBytes,
      scrollCache?.name ?? 'missing scroll-cache chunk'
    )
  ]
}

function buildIdleCpuChecks(reportPath, budgets) {
  if (!existsSync(reportPath)) {
    return [skippedCheck('idle-cpu.mean-total', `Optional report missing: ${reportPath}`)]
  }
  const report = readJsonReport(reportPath)
  return [
    numberBudgetCheck(
      'idle-cpu.mean-total',
      Number(report.summary?.total?.meanCpuPercent ?? 0),
      budgets.idleMeanCpuPercent,
      'short idle CPU total mean'
    )
  ]
}

function buildTerminalScaleChecks(reportPath, budgets) {
  if (!existsSync(reportPath)) {
    return [skippedCheck('terminal-scale.report', `Optional report missing: ${reportPath}`)]
  }
  const report = readJsonReport(reportPath)
  const rows = collectTerminalPerfRows(report)
  if (rows.length === 0) {
    return [failedCheck('terminal-scale.report', '0', '>0 rows', 'No terminal perf rows found')]
  }
  const worstTypingMs = Math.max(0, ...rows.map((row) => parseMs(row.worst)).filter(isFinite))
  const restoreMs = Math.max(0, ...rows.map((row) => parseMs(row.restore)).filter(isFinite))
  return [
    numberBudgetCheck(
      'terminal-scale.worst-typing',
      worstTypingMs,
      budgets.terminalWorstTypingMs,
      `${rows.length} terminal perf rows`
    ),
    numberBudgetCheck(
      'terminal-scale.restore',
      restoreMs,
      budgets.terminalRestoreMs,
      `${rows.length} terminal perf rows`
    )
  ]
}

function collectTerminalPerfRows(report) {
  const rows = []
  const visitSuite = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const annotation of test.annotations ?? []) {
          if (!annotation.type?.startsWith('opencode-')) {
            continue
          }
          rows.push(parseAnnotationDescription(annotation.description ?? ''))
        }
      }
    }
    for (const child of suite.suites ?? []) {
      visitSuite(child)
    }
  }
  for (const suite of report.suites ?? []) {
    visitSuite(suite)
  }
  return rows
}

function parseAnnotationDescription(description) {
  const values = {}
  for (const part of description.split(/\s+/)) {
    const index = part.indexOf('=')
    if (index !== -1) {
      values[part.slice(0, index)] = part.slice(index + 1)
    }
  }
  return values
}

function readJsonReport(reportPath) {
  const raw = readFileSync(reportPath, 'utf8')
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error(`${reportPath}: no JSON object found`)
  }
  return JSON.parse(raw.slice(start, end + 1))
}

function parseMs(value) {
  const match = String(value ?? '').match(/^(-?\d+(?:\.\d+)?)ms$/)
  return match ? Number(match[1]) : NaN
}

function byteBudgetCheck(id, actual, budget, detail) {
  return {
    id,
    status: actual > budget ? 'fail' : 'pass',
    actual: formatBytes(actual),
    budget: formatBytes(budget),
    detail
  }
}

function numberBudgetCheck(id, actual, budget, detail) {
  return {
    id,
    status: actual > budget ? 'fail' : 'pass',
    actual: actual.toFixed(2),
    budget: budget.toFixed(2),
    detail
  }
}

function missingCheck(id, detail) {
  return { id, status: 'fail', actual: 'missing', budget: 'present', detail }
}

function failedCheck(id, actual, budget, detail) {
  return { id, status: 'fail', actual, budget, detail }
}

function skippedCheck(id, detail) {
  return { id, status: 'skip', actual: 'missing', budget: 'optional', detail }
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

function defaultRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = buildReleasePerfScorecard()
  console.log(formatReleasePerfScorecard(report))
  process.exit(report.status === 'pass' ? 0 : 1)
}
