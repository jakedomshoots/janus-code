import { describe, expect, it } from 'vitest'
import type { AgentStatusVerification } from '../../../../shared/agent-status-types'
import { resolveAgentVerificationExecutionRoute } from './agent-composer-verification-execution'

describe('agent composer verification execution', () => {
  it('routes local verification through the local shell context', () => {
    const verification: AgentStatusVerification = {
      command: ' pnpm test ',
      status: 'not-run',
      executionContext: {
        hostKind: 'local',
        cwd: '/Users/jakedom/janus-code',
        platform: 'darwin'
      }
    }

    expect(resolveAgentVerificationExecutionRoute(verification)).toEqual({
      kind: 'local-shell',
      command: 'pnpm test',
      cwd: '/Users/jakedom/janus-code',
      platform: 'darwin'
    })
  })

  it('routes SSH verification through the recorded connection', () => {
    const verification: AgentStatusVerification = {
      command: 'pnpm run typecheck:web',
      status: 'not-run',
      executionContext: {
        hostKind: 'ssh',
        cwd: '/home/jake/janus-code',
        platform: 'linux',
        connectionId: 'ssh-prod-dev'
      }
    }

    expect(resolveAgentVerificationExecutionRoute(verification)).toEqual({
      kind: 'ssh-shell',
      command: 'pnpm run typecheck:web',
      cwd: '/home/jake/janus-code',
      platform: 'linux',
      connectionId: 'ssh-prod-dev'
    })
  })

  it('routes runtime verification through the recorded runtime environment', () => {
    const verification: AgentStatusVerification = {
      command: 'pnpm run verify:localization-catalog',
      status: 'not-run',
      executionContext: {
        hostKind: 'runtime',
        cwd: '/workspace/janus-code',
        platform: 'linux',
        runtimeEnvironmentId: 'runtime-1'
      }
    }

    expect(resolveAgentVerificationExecutionRoute(verification)).toEqual({
      kind: 'runtime-shell',
      command: 'pnpm run verify:localization-catalog',
      cwd: '/workspace/janus-code',
      platform: 'linux',
      runtimeEnvironmentId: 'runtime-1'
    })
  })

  it('does not route incomplete verification context', () => {
    expect(
      resolveAgentVerificationExecutionRoute({
        command: 'pnpm test',
        status: 'not-run',
        executionContext: {
          hostKind: 'ssh',
          cwd: '/home/jake/janus-code',
          platform: 'linux'
        }
      })
    ).toBeNull()
    expect(resolveAgentVerificationExecutionRoute({ command: '   ', status: 'not-run' })).toBeNull()
  })
})
