import { describe, expect, it } from 'vitest'
import {
  assertRuntimeStatusPortingContract,
  listRuntimeStatusPortingRequiredFields,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS
} from './runtime-status-contract'
import {
  MIN_COMPATIBLE_RUNTIME_CLIENT_VERSION,
  RUNTIME_CAPABILITIES,
  RUNTIME_PROTOCOL_VERSION
} from './protocol-version'
import type { RuntimeStatus } from './runtime-types'

function makeRuntimeStatus(overrides: Partial<RuntimeStatus> = {}): RuntimeStatus {
  return {
    runtimeId: 'runtime-a',
    rendererGraphEpoch: 1,
    graphStatus: 'ready',
    authoritativeWindowId: null,
    liveTabCount: 2,
    liveLeafCount: 3,
    runtimeProtocolVersion: RUNTIME_PROTOCOL_VERSION,
    minCompatibleRuntimeClientVersion: MIN_COMPATIBLE_RUNTIME_CLIENT_VERSION,
    capabilities: [...RUNTIME_CAPABILITIES],
    hostPlatform: 'darwin',
    ...overrides
  }
}

describe('runtime status porting contract', () => {
  it('uses the existing status.get runtime RPC method as the compatibility target', () => {
    expect(RUNTIME_STATUS_PORTING_CONTRACT_METHOD).toBe('status.get')
  })

  it('documents that status.get accepts null params', () => {
    expect(RUNTIME_STATUS_PORTING_CONTRACT_PARAMS).toBeNull()
  })

  it('accepts the current runtime status shape used by status.get', () => {
    expect(() => assertRuntimeStatusPortingContract(makeRuntimeStatus())).not.toThrow()
  })

  it('requires protocol and capability fields for future native runtime parity', () => {
    expect(() =>
      assertRuntimeStatusPortingContract(
        makeRuntimeStatus({
          runtimeProtocolVersion: undefined,
          minCompatibleRuntimeClientVersion: undefined,
          capabilities: undefined
        })
      )
    ).toThrow('runtimeProtocolVersion')
  })

  it('requires host platform so native runtime parity stays cross-platform', () => {
    expect(() =>
      assertRuntimeStatusPortingContract(makeRuntimeStatus({ hostPlatform: undefined }))
    ).toThrow('hostPlatform')
  })

  it('exposes the required fields for future sidecar schema generation', () => {
    expect(listRuntimeStatusPortingRequiredFields()).toEqual([
      'runtimeId',
      'rendererGraphEpoch',
      'graphStatus',
      'authoritativeWindowId',
      'liveTabCount',
      'liveLeafCount',
      'runtimeProtocolVersion',
      'minCompatibleRuntimeClientVersion',
      'capabilities',
      'hostPlatform'
    ])
  })
})
