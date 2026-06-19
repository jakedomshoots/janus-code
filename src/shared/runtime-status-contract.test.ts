import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as runtimeStatusContract from './runtime-status-contract'
import {
  assertRuntimeStatusPortingContract,
  getRuntimeStatusPortingJsonSchema,
  getRuntimeStatusPortingContractSummary,
  listMissingRuntimeStatusPortingFields,
  listRuntimeStatusPortingInvalidatableFields,
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

  it('exports the contract summary type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingContractSummary')
  })

  it('keeps the contract summary type in a dedicated summary module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-summary'")
  })

  it('exports the validation result type for sidecar diagnostics', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingValidationResult')
  })

  it('exports constraint metadata types for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingNumericConstraint')
    expect(source).toContain('RuntimeStatusPortingStringConstraint')
    expect(source).toContain('RuntimeStatusPortingArrayConstraint')
  })

  it('exports the runtime status field type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingField')
  })

  it('keeps the runtime status field type in a dedicated field module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-porting-field'")
  })

  it('exports the JSON schema type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingJsonSchema')
  })

  it('keeps the JSON schema type in a dedicated schema module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-json-schema'")
  })

  it('keeps the bundled artifact type in a dedicated artifact module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-artifact'")
  })

  it('keeps the validation result type in a dedicated diagnostics module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-validation-result'")
  })

  it('keeps constraint metadata types in a dedicated constraints module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-constraints'")
  })

  it('documents that status.get accepts null params', () => {
    expect(RUNTIME_STATUS_PORTING_CONTRACT_PARAMS).toBeNull()
  })

  it('exposes a single inspectable contract summary for sidecar adapters', () => {
    expect(getRuntimeStatusPortingContractSummary()).toEqual({
      schemaVersion: 1,
      domainId: 'runtime-status-diagnostics',
      method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
      params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
      requiredFields: listRuntimeStatusPortingRequiredFields(),
      invalidatableFields: listRuntimeStatusPortingInvalidatableFields(),
      enumValues: {
        graphStatus: ['ready', 'reloading', 'unavailable'],
        hostPlatform: ['darwin', 'linux', 'win32']
      },
      numericConstraints: {
        runtimeProtocolVersion: { integer: true, minimum: 1 },
        minCompatibleRuntimeClientVersion: { integer: true, minimum: 1 },
        rendererGraphEpoch: { integer: true, minimum: 0 },
        liveTabCount: { integer: true, minimum: 0 },
        liveLeafCount: { integer: true, minimum: 0 },
        authoritativeWindowId: { integer: true, minimum: 0, nullable: true }
      },
      stringConstraints: {
        runtimeId: { minLength: 1, trim: true }
      },
      arrayConstraints: {
        capabilities: { itemType: 'string' }
      }
    })
  })

  it('exposes one bundled contract artifact for non-TypeScript sidecar adapters', () => {
    expect(
      (
        runtimeStatusContract as typeof runtimeStatusContract & {
          getRuntimeStatusPortingContractArtifact?: () => unknown
        }
      ).getRuntimeStatusPortingContractArtifact?.()
    ).toEqual({
      summary: getRuntimeStatusPortingContractSummary(),
      jsonSchema: getRuntimeStatusPortingJsonSchema()
    })
  })

  it('serializes the bundled contract artifact for non-TypeScript sidecar adapters', () => {
    const artifactJson = (
      runtimeStatusContract as typeof runtimeStatusContract & {
        getRuntimeStatusPortingContractArtifactJson?: () => string
      }
    ).getRuntimeStatusPortingContractArtifactJson?.()

    expect(artifactJson).toBe(
      JSON.stringify({
        summary: getRuntimeStatusPortingContractSummary(),
        jsonSchema: getRuntimeStatusPortingJsonSchema()
      })
    )
  })

  it('exposes a JSON schema shell for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'Janus Runtime status.get result',
      type: 'object',
      required: listRuntimeStatusPortingRequiredFields(),
      additionalProperties: false,
      properties: {
        runtimeId: {
          type: 'string',
          minLength: 1
        },
        graphStatus: {
          type: 'string',
          enum: ['ready', 'reloading', 'unavailable']
        },
        hostPlatform: {
          type: 'string',
          enum: ['darwin', 'linux', 'win32']
        },
        runtimeProtocolVersion: {
          type: 'integer',
          minimum: 1
        },
        minCompatibleRuntimeClientVersion: {
          type: 'integer',
          minimum: 1
        },
        rendererGraphEpoch: {
          type: 'integer',
          minimum: 0
        },
        liveTabCount: {
          type: 'integer',
          minimum: 0
        },
        liveLeafCount: {
          type: 'integer',
          minimum: 0
        },
        authoritativeWindowId: {
          type: ['integer', 'null'],
          minimum: 0
        },
        capabilities: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    })
  })

  it('closes the JSON schema so sidecar adapters catch runtime status drift', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      additionalProperties: false
    })
  })

  it('describes the runtime id JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        runtimeId: {
          type: 'string',
          minLength: 1
        }
      }
    })
  })

  it('describes the graph status JSON schema enum for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        graphStatus: {
          type: 'string',
          enum: ['ready', 'reloading', 'unavailable']
        }
      }
    })
  })

  it('describes the host platform JSON schema enum for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        hostPlatform: {
          type: 'string',
          enum: ['darwin', 'linux', 'win32']
        }
      }
    })
  })

  it('describes the runtime protocol version JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        runtimeProtocolVersion: {
          type: 'integer',
          minimum: 1
        }
      }
    })
  })

  it('describes the minimum compatible runtime client version JSON schema for sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        minCompatibleRuntimeClientVersion: {
          type: 'integer',
          minimum: 1
        }
      }
    })
  })

  it('describes the renderer graph epoch JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        rendererGraphEpoch: {
          type: 'integer',
          minimum: 0
        }
      }
    })
  })

  it('describes the live tab count JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        liveTabCount: {
          type: 'integer',
          minimum: 0
        }
      }
    })
  })

  it('describes the live leaf count JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        liveLeafCount: {
          type: 'integer',
          minimum: 0
        }
      }
    })
  })

  it('describes the authoritative window id JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        authoritativeWindowId: {
          type: ['integer', 'null'],
          minimum: 0
        }
      }
    })
  })

  it('describes the capabilities JSON schema for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toMatchObject({
      properties: {
        capabilities: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
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

  it('rejects invalid protocol values when asserting the porting contract', () => {
    expect(() =>
      assertRuntimeStatusPortingContract(
        makeRuntimeStatus({
          runtimeProtocolVersion: 0
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

  it('rejects impossible protocol compatibility windows for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          runtimeProtocolVersion: 3,
          minCompatibleRuntimeClientVersion: 4
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['minCompatibleRuntimeClientVersion']
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

  it('rejects unsupported host platform values for sidecar diagnostics', () => {
    expect(
      validateRuntimeStatusPortingContract(
        makeRuntimeStatus({
          hostPlatform: 'freebsd'
        })
      )
    ).toEqual({
      ok: false,
      invalidFields: ['hostPlatform']
    })
  })

  it('exposes fields with value validation for future sidecar schema generation', () => {
    expect(listRuntimeStatusPortingInvalidatableFields()).toEqual([
      'runtimeProtocolVersion',
      'minCompatibleRuntimeClientVersion',
      'rendererGraphEpoch',
      'liveTabCount',
      'liveLeafCount',
      'capabilities',
      'graphStatus',
      'runtimeId',
      'authoritativeWindowId',
      'hostPlatform'
    ])
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
