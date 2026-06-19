const HIDDEN_USER_PROMPT_PATTERNS: readonly RegExp[] = [
  // Why: agent hooks can observe runtime envelopes; chat should only show user-authored turns.
  /^##\s+Memory Writing Agent\b/i,
  /\bYou are a Memory Writing Agent\b/i,
  /^#\s+AGENTS\.md instructions\b/i,
  /^<(?:permissions instructions|app-context|collaboration_mode|apps_instructions|skills_instructions|plugins_instructions|environment_context)>/i,
  /^You are Codex\b/i
]

export function isAgentWorkspaceVisibleUserPrompt(prompt: string): boolean {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return false
  }
  return !HIDDEN_USER_PROMPT_PATTERNS.some((pattern) => pattern.test(trimmed))
}
