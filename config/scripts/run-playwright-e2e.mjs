#!/usr/bin/env node

import { spawn } from 'child_process'

const env = { ...process.env }
// Why: Playwright enables FORCE_COLOR internally; inherited NO_COLOR would
// make Node warn before tests even start.
delete env.NO_COLOR

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const child = spawn(pnpm, ['exec', 'playwright', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit'
})

child.on('error', (error) => {
  console.error(`[playwright-e2e] failed to start Playwright: ${error.message}`)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
