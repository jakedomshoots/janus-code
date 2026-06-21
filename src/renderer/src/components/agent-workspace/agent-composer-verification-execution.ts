import { CLIENT_PLATFORM } from '@/lib/new-workspace'
import { isWindowsAbsolutePathLike } from '../../../../shared/cross-platform-path'
import type {
  AgentStatusVerification,
  AgentStatusVerificationExecutionContext
} from '../../../../shared/agent-status-types'
import { isWslUncPath } from '../../../../shared/wsl-paths'
import type { AgentWorkspaceProject } from './agent-workspace-types'

export type AgentVerificationExecutionRoute =
  | {
      readonly kind: 'local-shell'
      readonly command: string
      readonly cwd: string
      readonly platform: NodeJS.Platform
    }
  | {
      readonly kind: 'ssh-shell'
      readonly command: string
      readonly cwd: string
      readonly platform: NodeJS.Platform
      readonly connectionId: string
    }
  | {
      readonly kind: 'runtime-shell'
      readonly command: string
      readonly cwd: string
      readonly platform: NodeJS.Platform
      readonly runtimeEnvironmentId: string
    }

export function resolveAgentWorkspaceProjectLaunchPlatform(
  project?: AgentWorkspaceProject | null
): NodeJS.Platform | undefined {
  if (!project) {
    return undefined
  }

  const worktreePath = project.path.trim()
  if (project.hostKind === 'ssh') {
    return worktreePath && isWindowsAbsolutePathLike(worktreePath) && !isWslUncPath(worktreePath)
      ? 'win32'
      : 'linux'
  }
  if (project.hostKind === 'runtime') {
    return 'linux'
  }
  if (worktreePath && isWslUncPath(worktreePath)) {
    return 'linux'
  }
  return CLIENT_PLATFORM
}

export function buildAgentComposerVerificationExecutionContext(
  project?: AgentWorkspaceProject | null
): AgentStatusVerificationExecutionContext | undefined {
  const cwd = project?.path.trim()
  if (!project || !cwd) {
    return undefined
  }

  const platform = resolveAgentWorkspaceProjectLaunchPlatform(project) ?? CLIENT_PLATFORM
  const detectionTarget = project.agentDetectionTarget
  return {
    hostKind: project.hostKind,
    cwd,
    platform,
    ...(detectionTarget?.kind === 'ssh' ? { connectionId: detectionTarget.connectionId } : {}),
    ...(detectionTarget?.kind === 'runtime'
      ? { runtimeEnvironmentId: detectionTarget.environmentId }
      : {})
  }
}

export function resolveAgentVerificationExecutionRoute(
  verification: AgentStatusVerification
): AgentVerificationExecutionRoute | null {
  const command = verification.command.trim()
  const context = verification.executionContext
  if (!command || !context) {
    return null
  }

  if (context.hostKind === 'local') {
    return {
      kind: 'local-shell',
      command,
      cwd: context.cwd,
      platform: context.platform
    }
  }

  // Why: remote verification must never silently downgrade to a local shell.
  // That would test a different environment from the agent run.
  if (context.hostKind === 'ssh') {
    if (!context.connectionId) {
      return null
    }
    return {
      kind: 'ssh-shell',
      command,
      cwd: context.cwd,
      platform: context.platform,
      connectionId: context.connectionId
    }
  }

  if (!context.runtimeEnvironmentId) {
    return null
  }
  return {
    kind: 'runtime-shell',
    command,
    cwd: context.cwd,
    platform: context.platform,
    runtimeEnvironmentId: context.runtimeEnvironmentId
  }
}
