import type { TuiAgent } from './types'

export type AgentApprovalDecision = 'approve' | 'deny'

// Why: agent TUIs disagree on approval keystrokes; the GUI sends the best-known
// sequence for each provider instead of parsing terminal text.
export function resolveTuiAgentApprovalInput(
  agent: TuiAgent | string,
  decision: AgentApprovalDecision
): string {
  switch (agent) {
    case 'claude':
    case 'openclaude':
      return decision === 'approve' ? '1\r' : '3\r'
    case 'codex':
      return decision === 'approve' ? '\r' : 'n\r'
    case 'gemini':
    case 'opencode':
    case 'cursor':
    case 'copilot':
    case 'droid':
    case 'hermes':
    case 'grok':
    case 'amp':
    case 'antigravity':
    case 'command-code':
    case 'pi':
    case 'cline':
    case 'mistral-vibe':
    case 'devin':
    case 'kimi':
      return decision === 'approve' ? 'y\r' : 'n\r'
    default:
      return decision === 'approve' ? 'y\r' : 'n\r'
  }
}
