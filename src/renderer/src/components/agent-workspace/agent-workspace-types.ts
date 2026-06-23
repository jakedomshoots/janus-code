import type { GitPushTarget, GitStagingArea } from '../../../../shared/types'

export type AgentWorkspacePhase =
  | 'idle'
  | 'starting'
  | 'running'
  | 'waiting-for-user'
  | 'needs-approval'
  | 'completed'
  | 'failed'
  | 'disconnected'

export type AgentWorkspaceAgentDetectionTarget =
  | { readonly kind: 'local' }
  | { readonly kind: 'ssh'; readonly connectionId: string }
  | { readonly kind: 'runtime'; readonly environmentId: string }

export type AgentWorkspaceProject = {
  readonly id: string
  readonly label: string
  readonly path: string
  readonly hostKind: 'local' | 'ssh' | 'runtime'
  readonly branchName?: string | null
  readonly repoId?: string | null
  readonly canCreateWorktree?: boolean
  readonly canDeleteWorktree?: boolean
  readonly pushTarget?: GitPushTarget
  readonly agentDetectionTarget?: AgentWorkspaceAgentDetectionTarget
}

export type AgentWorkspaceThread = {
  readonly id: string
  readonly worktreeId: string
  readonly title: string
  readonly agentKind: string
  readonly phase: AgentWorkspacePhase
  readonly updatedAt: string | null
  readonly branchName: string | null
  readonly cwd: string | null
}

export type AgentWorkspacePlanStepStatus = 'pending' | 'in-progress' | 'completed'

export type AgentWorkspacePlanStep = {
  readonly id: string
  readonly title: string
  readonly status: AgentWorkspacePlanStepStatus
}

export type AgentWorkspacePlan = {
  readonly id: string
  readonly threadId: string
  readonly title: string | null
  readonly explanation: string | null
  readonly steps: readonly AgentWorkspacePlanStep[]
  readonly markdown: string | null
  readonly updatedAt: string | null
}

export type AgentWorkspaceApprovalStatus = 'requested' | 'approved' | 'denied' | 'expired'

export type AgentWorkspaceApproval = {
  readonly id: string
  readonly threadId: string
  readonly providerKind: string
  readonly worktreeId: string
  readonly status: AgentWorkspaceApprovalStatus
  readonly title: string | null
  readonly description: string | null
  readonly toolName: string | null
  readonly toolInput: string | null
  readonly fallbackText: string
  readonly updatedAt: string | null
}

export type AgentWorkspaceTimelineEntry = {
  readonly id: string
  readonly threadId: string
  readonly kind: 'user' | 'agent' | 'system' | 'tool' | 'approval' | 'error'
  readonly text: string
  readonly createdAt: string | null
  readonly status?: 'pending' | 'running' | 'done' | 'failed'
  readonly choices?: readonly AgentWorkspaceTimelineChoice[]
}

export type AgentWorkspaceTimelineChoice = {
  readonly id: string
  readonly label: string
  readonly input: string
}

export type AgentWorkspaceDiffSummary = {
  readonly id: string
  readonly threadId: string
  readonly area?: GitStagingArea
  readonly filePath: string
  readonly oldPath?: string
  readonly additions: number
  readonly deletions: number
  readonly status: 'added' | 'modified' | 'deleted' | 'renamed' | 'unknown'
}

export type AgentWorkspaceReviewSummary = {
  readonly id: string
  readonly worktreeId: string
  readonly provider: string
  readonly providerLabel: string
  readonly number: number
  readonly title: string
  readonly state: string
  readonly url: string
  readonly status: string
  readonly updatedAt: string
}

export type AgentWorkspaceSnapshot = {
  readonly activeWorktreeId: string | null
  readonly projects: readonly AgentWorkspaceProject[]
  readonly threads: readonly AgentWorkspaceThread[]
  readonly plans: readonly AgentWorkspacePlan[]
  readonly timeline: readonly AgentWorkspaceTimelineEntry[]
  readonly approvals: readonly AgentWorkspaceApproval[]
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly reviews?: readonly AgentWorkspaceReviewSummary[]
  readonly terminalAvailable: boolean
}
