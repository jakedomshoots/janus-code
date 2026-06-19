import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  assertRuntimeStatusPortingContract,
  getRuntimeStatusPortingContractSummary,
  listMissingRuntimeStatusPortingFields,
  listRuntimeStatusPortingRequiredFields,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  validateRuntimeStatusPortingContract
} from './runtime-status-contract'
import {
  MIN_COMPATIBLE_RUNTIME_CLIENT_VERSION,
  RUNTIME_CAPABILITIES,
  RUNTIME_PROTOCOL_VERSION
} from './protocol-version'
import { getRuntimePortingFirstSliceMethod } from './runtime-porting-domains'
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

  it('matches the first runtime porting slice method', () => {
    expect(RUNTIME_STATUS_PORTING_CONTRACT_METHOD).toBe(getRuntimePortingFirstSliceMethod())
  })

  it('uses the porting first-slice method as its source of truth', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RUNTIME_PORTING_FIRST_SLICE_METHOD')
  })

  it('documents that status.get accepts null params', () => {
    expect(RUNTIME_STATUS_PORTING_CONTRACT_PARAMS).toBeNull()
  })

  it('exposes a single inspectable contract summary for sidecar adapters', () => {
    expect(getRuntimeStatusPortingContractSummary()).toEqual({
      domainId: 'runtime-status-diagnostics',
      method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
      params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
      requiredFields: listRuntimeStatusPortingRequiredFields()
    })
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

  it('lists every missing required field for sidecar diagnostics', () => {
    expect(
      listMissingRuntimeStatusPortingFields(
        makeRuntimeStatus({
          runtimeProtocolVersion: undefined,
          minCompatibleRuntimeClientVersion: undefined,
          capabilities: undefined,
          hostPlatform: undefined
        })
      )
    ).toEqual([
      'runtimeProtocolVersion',
      'minCompatibleRuntimeClientVersion',
      'capabilities',
      'hostPlatform'
    ])
  })

  it('validates runtime status without throwing for sidecar diagnostics', () => {
    expect(validateRuntimeStatusPortingContract(makeRuntimeStatus())).toEqual({ ok: true })
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          capabilities: undefined,
          hostPlatform: undefined
        })
      )
    ).toEqual({
      ok: false,
      missingFields: ['capabilities', 'hostPlatform']
    })
  })

  it('rejects invalid protocol versions without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          runtimeProtocolVersion: 0,
          minCompatibleRuntimeClientVersion: Number.NaN
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['runtimeProtocolVersion', 'minCompatibleRuntimeClientVersion']
    })
  })

  it('rejects invalid capabilities without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          capabilities: ['runtime.status.compat.v1', 7] as RuntimeStatus['capabilities']
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['capabilities']
    })
  })

  it('rejects invalid graph status without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          graphStatus: 'warming-up' as RuntimeStatus['graphStatus']
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['graphStatus']
    })
  })

  it('rejects invalid runtime counters without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          rendererGraphEpoch: -1,
          liveTabCount: 1.5,
          liveLeafCount: Number.NaN
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['rendererGraphEpoch', 'liveTabCount', 'liveLeafCount']
    })
  })

  it('rejects invalid runtime id without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          runtimeId: ''
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['runtimeId']
    })
  })

  it('rejects invalid authoritative window id without throwing for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          authoritativeWindowId: -1
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['authoritativeWindowId']
    })
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
