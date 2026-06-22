export function sanitizeE2EColorEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const sanitized = { ...env }
  // Why: Playwright enables FORCE_COLOR internally; inherited NO_COLOR would
  // make Node warn before tests even start.
  delete sanitized.NO_COLOR
  return sanitized
}
