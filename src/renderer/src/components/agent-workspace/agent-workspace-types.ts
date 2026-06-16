export type AgentWorkspacePhase =
  | 'idle'
  | 'starting'
  | 'running'
  | 'waiting-for-user'
  | 'needs-approval'
  | 'completed'
  | 'failed'
  | 'disconnected'

export type AgentWorkspaceProject = {
  readonly id: string
  readonly label: string
  readonly path: string
  readonly hostKind: 'local' | 'ssh' | 'runtime'
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
  readonly hasStructuredPlan?: boolean
}

export type AgentWorkspaceTimelineEntry = {
  readonly id: string
  readonly threadId: string
  readonly kind: 'user' | 'agent' | 'system' | 'tool' | 'approval' | 'error'
  readonly text: string
  readonly createdAt: string | null
  readonly status?: 'pending' | 'running' | 'done' | 'failed'
}

export type AgentWorkspaceDiffSummary = {
  readonly id: string
  readonly threadId: string
  readonly filePath: string
  readonly oldPath?: string
  readonly additions: number
  readonly deletions: number
  readonly status: 'added' | 'modified' | 'deleted' | 'renamed' | 'unknown'
}

export type AgentWorkspaceSnapshot = {
  readonly activeWorktreeId: string | null
  readonly projects: readonly AgentWorkspaceProject[]
  readonly threads: readonly AgentWorkspaceThread[]
  readonly timeline: readonly AgentWorkspaceTimelineEntry[]
  readonly diffs: readonly AgentWorkspaceDiffSummary[]
  readonly terminalAvailable: boolean
}
