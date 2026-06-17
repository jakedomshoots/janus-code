import type { AgentWorkspaceThread } from './agent-workspace-types'

// Why: draft "New session" tabs hide approval controls in the right panel until
// the blocked thread is selected; auto-focus the waiting thread instead.
export function pickAgentWorkspaceApprovalThreadId(
  threads: readonly AgentWorkspaceThread[],
  selectedThreadId: string | null
): string | null {
  if (selectedThreadId !== null) {
    return null
  }

  const approvalThread = threads.find((thread) => thread.phase === 'needs-approval')
  return approvalThread?.id ?? null
}
