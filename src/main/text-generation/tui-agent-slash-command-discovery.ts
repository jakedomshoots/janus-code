import { spawn, type ChildProcess } from 'child_process'
import { planAgentBinary, type CommitMessagePlan } from '../../shared/commit-message-plan'
import { tokenizeCustomCommandTemplate } from '../../shared/commit-message-prompt'
import { TUI_AGENT_CONFIG, isTuiAgent } from '../../shared/tui-agent-config'
import {
  discoverTuiAgentSlashCommands,
  parseCliSlashCommands,
  type DiscoverTuiAgentSlashCommandsResult
} from '../../shared/tui-agent-slash-commands'
import type { TuiAgent } from '../../shared/types'
import { resolveCliCommand } from '../codex-cli/command'
import {
  getSpawnArgsForWindows,
  UnsafeWindowsBatchArgumentsError,
  WINDOWS_BATCH_UNSAFE_ARGUMENTS_ERROR
} from '../win32-utils'

type SlashCommandDiscoveryPlanResult =
  | { ok: true; plan: CommitMessagePlan }
  | { ok: false; error: string }

export type RemoteSlashCommandDiscoveryExecResult = {
  stdout: string
  stderr: string
  exitCode: number | null
  spawnError?: string
  timedOut?: boolean
  canceled?: boolean
}

const SLASH_COMMAND_DISCOVERY_TIMEOUT_MS = 15_000
const OUTPUT_LIMIT_BYTES = 256_000

function titleForAgent(agentId: TuiAgent): string {
  return agentId
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ')
}

export function planTuiAgentSlashCommandDiscovery(
  agentId: TuiAgent,
  agentCommandOverride?: string
): SlashCommandDiscoveryPlanResult {
  const config = TUI_AGENT_CONFIG[agentId]
  const command = planAgentBinary(config.detectCmd, agentCommandOverride)
  if (!command.ok) {
    return command
  }
  const launch = tokenizeCustomCommandTemplate(config.launchCmd)
  if (!launch.ok) {
    return { ok: false, error: `${titleForAgent(agentId)} launch command is invalid.` }
  }
  const [_launchBinary, ...launchArgs] = launch.tokens
  return {
    ok: true,
    plan: {
      binary: command.binary,
      args: [...command.prefixArgs, ...launchArgs, '--help'],
      stdinPayload: null,
      label: titleForAgent(agentId)
    }
  }
}

function finalizeSlashCommandDiscovery(
  agentId: TuiAgent,
  stdout: string,
  stderr: string
): DiscoverTuiAgentSlashCommandsResult {
  const discovered = parseCliSlashCommands(`${stdout}\n${stderr}`)
  return discoverTuiAgentSlashCommands(agentId, discovered)
}

export async function discoverAgentSlashCommandsLocal(
  agentId: string,
  env: NodeJS.ProcessEnv | undefined,
  agentCommandOverride?: string
): Promise<DiscoverTuiAgentSlashCommandsResult> {
  if (!isTuiAgent(agentId)) {
    return discoverTuiAgentSlashCommands(agentId)
  }
  const planned = planTuiAgentSlashCommandDiscovery(agentId, agentCommandOverride)
  if (!planned.ok) {
    return discoverTuiAgentSlashCommands(agentId)
  }

  return new Promise((resolve) => {
    let child: ChildProcess
    const spawnEnv = env ?? process.env
    try {
      const resolvedBinary =
        process.platform === 'win32'
          ? resolveCliCommand(planned.plan.binary, {
              pathEnv: spawnEnv.PATH ?? spawnEnv.Path ?? null
            })
          : planned.plan.binary
      const { spawnCmd, spawnArgs } = getSpawnArgsForWindows(resolvedBinary, planned.plan.args)
      child = spawn(spawnCmd, spawnArgs, {
        env: spawnEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      })
    } catch (error) {
      if (error instanceof UnsafeWindowsBatchArgumentsError) {
        return resolve(discoverTuiAgentSlashCommands(agentId))
      }
      console.error('[slash-commands] Failed to spawn slash command discovery:', error)
      return resolve(discoverTuiAgentSlashCommands(agentId))
    }

    let stdout = ''
    let stderr = ''
    let outputBytes = 0
    let settled = false
    const finish = (result: DiscoverTuiAgentSlashCommandsResult): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const append = (chunk: Buffer, target: 'stdout' | 'stderr'): void => {
      outputBytes += chunk.byteLength
      if (outputBytes > OUTPUT_LIMIT_BYTES) {
        finish(discoverTuiAgentSlashCommands(agentId))
        child.kill()
        return
      }
      if (target === 'stdout') {
        stdout += chunk.toString('utf8')
        return
      }
      stderr += chunk.toString('utf8')
    }
    const timer = setTimeout(() => {
      child.kill()
      finish(discoverTuiAgentSlashCommands(agentId))
    }, SLASH_COMMAND_DISCOVERY_TIMEOUT_MS)

    child.stdout?.on('data', (chunk: Buffer) => append(chunk, 'stdout'))
    child.stderr?.on('data', (chunk: Buffer) => append(chunk, 'stderr'))
    child.on('error', () => finish(discoverTuiAgentSlashCommands(agentId)))
    child.on('close', () => finish(finalizeSlashCommandDiscovery(agentId, stdout, stderr)))
  })
}

export async function discoverAgentSlashCommandsRemote(
  agentId: TuiAgent,
  cwd: string,
  execute: (
    plan: CommitMessagePlan,
    cwd: string,
    timeoutMs: number
  ) => Promise<RemoteSlashCommandDiscoveryExecResult>,
  agentCommandOverride?: string
): Promise<DiscoverTuiAgentSlashCommandsResult> {
  const planned = planTuiAgentSlashCommandDiscovery(agentId, agentCommandOverride)
  if (!planned.ok) {
    return discoverTuiAgentSlashCommands(agentId)
  }
  let result: RemoteSlashCommandDiscoveryExecResult
  try {
    result = await execute(planned.plan, cwd, SLASH_COMMAND_DISCOVERY_TIMEOUT_MS)
  } catch (error) {
    console.error('[slash-commands] Remote slash command discovery request failed:', error)
    return discoverTuiAgentSlashCommands(agentId)
  }
  if (
    result.spawnError ||
    result.canceled ||
    result.timedOut ||
    result.spawnError === WINDOWS_BATCH_UNSAFE_ARGUMENTS_ERROR
  ) {
    return discoverTuiAgentSlashCommands(agentId)
  }
  return finalizeSlashCommandDiscovery(agentId, result.stdout, result.stderr)
}
