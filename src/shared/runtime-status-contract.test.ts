import { existsSync, readFileSync } from 'node:fs'
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
  validateRuntimeStatusPortingContract,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
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
    const source = readFileSync(resolve(__dirname, './runtime-status-contract-metadata.ts'), 'utf8')

    expect(source).toContain('RUNTIME_PORTING_FIRST_SLICE_METHOD')
  })

  it('keeps contract identity metadata in a dedicated metadata module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-metadata'")
  })

  it('exports the contract summary type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingContractSummary')
  })

  it('keeps the contract summary type in a dedicated summary module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-summary'")
  })

  it('keeps the contract summary builder in the dedicated summary module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract-summary.ts'), 'utf8')

    expect(source).toContain('getRuntimeStatusPortingContractSummary')
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

  it('exports constraint metadata values for sidecar schema adapters', () => {
    expect(runtimeStatusContract).toMatchObject({
      RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS: {
        runtimeProtocolVersion: { integer: true, minimum: 1 }
      },
      RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS: {
        runtimeId: { minLength: 1, trim: true }
      },
      RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS: {
        capabilities: { itemType: 'string' }
      }
    })
  })

  it('exports the runtime status field type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingField')
  })

  it('keeps the runtime status field type in a dedicated field module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-porting-field'")
  })

  it('uses the dedicated runtime status field type for contract metadata', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).not.toContain('keyof RuntimeStatus')
  })

  it('exports the JSON schema type for sidecar schema adapters', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain('RuntimeStatusPortingJsonSchema')
  })

  it('keeps the JSON schema type in a dedicated schema module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-json-schema'")
  })

  it('keeps the JSON schema builder in the dedicated schema module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-json-schema.ts'), 'utf8')

    expect(source).toContain('getRuntimeStatusPortingJsonSchema')
  })

  it('uses the dedicated runtime status field type in the JSON schema module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-json-schema.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-porting-field'")
    expect(source).not.toContain('keyof RuntimeStatus')
  })

  it('keeps the bundled artifact type in a dedicated artifact module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-artifact'")
  })

  it('keeps the bundled artifact builder in the dedicated artifact module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract-artifact.ts'), 'utf8')

    expect(source).toContain('getRuntimeStatusPortingContractArtifact')
  })

  it('keeps a checked-in JSON artifact for non-TypeScript sidecar adapters', () => {
    const artifactPath = resolve(__dirname, './runtime-status-contract-artifact.json')

    expect(existsSync(artifactPath)).toBe(true)
    if (!existsSync(artifactPath)) {
      return
    }

    expect(JSON.parse(readFileSync(artifactPath, 'utf8'))).toEqual(
      runtimeStatusContract.getRuntimeStatusPortingContractArtifact()
    )
  })

  it('keeps a checked-in valid runtime status sample for sidecar adapter tests', () => {
    const samplePath = resolve(__dirname, './runtime-status-contract-valid-sample.json')

    expect(existsSync(samplePath)).toBe(true)
    if (!existsSync(samplePath)) {
      return
    }

    const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as RuntimeStatus

    expect(validateRuntimeStatusPortingContract(sample)).toEqual({ ok: true })
    expect(sample).toEqual(makeRuntimeStatus())
  })

  it('keeps a checked-in invalid runtime status sample for sidecar adapter tests', () => {
    const samplePath = resolve(__dirname, './runtime-status-contract-invalid-sample.json')

    expect(existsSync(samplePath)).toBe(true)
    if (!existsSync(samplePath)) {
      return
    }

    const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as RuntimeStatus

    expect(validateRuntimeStatusPortingContract(sample)).toEqual({
      ok: false,
      missingFields: ['runtimeId']
    })
  })

  it('keeps a checked-in runtime status sample manifest for sidecar adapter tests', () => {
    const manifestPath = resolve(__dirname, './runtime-status-contract-samples.json')

    expect(existsSync(manifestPath)).toBe(true)
    if (!existsSync(manifestPath)) {
      return
    }

    expect(JSON.parse(readFileSync(manifestPath, 'utf8'))).toEqual({
      samples: [
        {
          kind: 'valid',
          path: 'src/shared/runtime-status-contract-valid-sample.json',
          expectedResult: { ok: true }
        },
        {
          kind: 'invalid',
          path: 'src/shared/runtime-status-contract-invalid-sample.json',
          expectedResult: {
            ok: false,
            missingFields: ['runtimeId']
          }
        }
      ],
      verificationCommand: 'pnpm run verify:runtime-status-samples'
    })
  })

  it('exposes a package script for verifying the checked-in contract artifact', () => {
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))

    expect(packageJson.scripts['verify:runtime-status-contract-artifact']).toBe(
      'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-status-contract.test.ts src/shared/runtime-porting-domains.test.ts'
    )
  })

  it('documents the runtime status artifact entry point for sidecar implementers', () => {
    const docPath = resolve(__dirname, '../../docs/reference/runtime-status-contract-artifact.md')

    expect(existsSync(docPath)).toBe(true)
    if (!existsSync(docPath)) {
      return
    }

    const doc = readFileSync(docPath, 'utf8')
    expect(doc).toContain('src/shared/runtime-status-contract-artifact.json')
    expect(doc).toContain('src/shared/runtime-status-contract-valid-sample.json')
    expect(doc).toContain('src/shared/runtime-status-contract-invalid-sample.json')
    expect(doc).toContain('src/shared/runtime-status-contract-samples.json')
    expect(doc).toContain('application/vnd.janus.runtime-status-contract+json')
    expect(doc).toContain('versionedFields')
    expect(doc).toContain('nonNegativeIntegerFields')
    expect(doc).toContain('stringFields')
    expect(doc).toContain('arrayFields')
    expect(doc).toContain('numericFields')
    expect(doc).toContain('nullableFields')
    expect(doc).toContain('enumFields')
    expect(doc).toContain('pnpm run verify:runtime-status-contract-artifact')
  })

  it('lists the runtime status artifact in the durable reference index', () => {
    const index = readFileSync(resolve(__dirname, '../../docs/reference/README.md'), 'utf8')

    expect(index).toContain('./runtime-status-contract-artifact.md')
  })

  it('labels the checked-in contract artifact for non-TypeScript consumers', () => {
    expect(runtimeStatusContract.getRuntimeStatusPortingContractArtifact()).toMatchObject({
      artifactId: 'janus-runtime-status-contract',
      artifactVersion: 1,
      artifactMediaType: 'application/vnd.janus.runtime-status-contract+json',
      artifactJsonPath: 'src/shared/runtime-status-contract-artifact.json',
      jsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
      jsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
      jsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
    })
  })

  it('exports the checked-in contract artifact JSON path for tooling', () => {
    expect(runtimeStatusContract.RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH).toBe(
      'src/shared/runtime-status-contract-artifact.json'
    )
  })

  it('keeps the validation result type in a dedicated diagnostics module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-validation-result'")
  })

  it('keeps runtime status validation functions in a dedicated validation module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-contract-validation'")
  })

  it('keeps constraint metadata types in a dedicated constraints module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-constraints'")
  })

  it('keeps runtime status constraint values in the dedicated constraints module', () => {
    const contractSource = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')
    const constraintsSource = readFileSync(
      resolve(__dirname, './runtime-status-constraints.ts'),
      'utf8'
    )

    expect(contractSource).not.toContain('const RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS')
    expect(constraintsSource).toContain('RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS')
    expect(constraintsSource).toContain('RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS')
    expect(constraintsSource).toContain('RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS')
  })

  it('keeps runtime status enum values in a dedicated enum module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-enum-values'")
  })

  it('exports runtime status enum values for sidecar schema adapters', () => {
    expect(runtimeStatusContract).toMatchObject({
      VALID_RUNTIME_GRAPH_STATUSES: ['ready', 'reloading', 'unavailable'],
      VALID_RUNTIME_HOST_PLATFORMS: ['darwin', 'linux', 'win32'],
      VALID_RUNTIME_HOST_PLATFORM_VALUES: ['darwin', 'linux', 'win32']
    })
  })

  it('keeps runtime status field groups in a dedicated field-groups module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-status-contract.ts'), 'utf8')

    expect(source).toContain("from './runtime-status-field-groups'")
  })

  it('exports runtime status field groups for sidecar schema adapters', () => {
    expect(runtimeStatusContract).toMatchObject({
      REQUIRED_RUNTIME_STATUS_PORTING_FIELDS: [
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
      ],
      VERSIONED_RUNTIME_STATUS_PORTING_FIELDS: [
        'runtimeProtocolVersion',
        'minCompatibleRuntimeClientVersion'
      ],
      NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS: [
        'rendererGraphEpoch',
        'liveTabCount',
        'liveLeafCount'
      ],
      INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS: listRuntimeStatusPortingInvalidatableFields()
    })
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
      versionedFields: runtimeStatusContract.VERSIONED_RUNTIME_STATUS_PORTING_FIELDS,
      nonNegativeIntegerFields:
        runtimeStatusContract.NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
      stringFields: ['runtimeId'],
      arrayFields: ['capabilities'],
      numericFields: [
        'runtimeProtocolVersion',
        'minCompatibleRuntimeClientVersion',
        'rendererGraphEpoch',
        'liveTabCount',
        'liveLeafCount',
        'authoritativeWindowId'
      ],
      nullableFields: ['authoritativeWindowId'],
      invalidatableFields: listRuntimeStatusPortingInvalidatableFields(),
      enumFields: ['graphStatus', 'hostPlatform'],
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
      artifactId: 'janus-runtime-status-contract',
      artifactVersion: 1,
      artifactMediaType: 'application/vnd.janus.runtime-status-contract+json',
      artifactJsonPath: 'src/shared/runtime-status-contract-artifact.json',
      jsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
      jsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
      jsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
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
        artifactId: 'janus-runtime-status-contract',
        artifactVersion: 1,
        artifactMediaType: 'application/vnd.janus.runtime-status-contract+json',
        artifactJsonPath: 'src/shared/runtime-status-contract-artifact.json',
        jsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
        jsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
        jsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
        summary: getRuntimeStatusPortingContractSummary(),
        jsonSchema: getRuntimeStatusPortingJsonSchema()
      })
    )
  })

  it('exposes a JSON schema shell for non-TypeScript sidecar adapters', () => {
    expect(getRuntimeStatusPortingJsonSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'urn:janus:runtime-status-contract:json-schema:1',
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

  it('exports the JSON schema id for sidecar validators', () => {
    expect(runtimeStatusContract.RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID).toBe(
      'urn:janus:runtime-status-contract:json-schema:1'
    )
  })

  it('exports the JSON schema draft URI for sidecar validators', () => {
    expect(runtimeStatusContract.RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI).toBe(
      'https://json-schema.org/draft/2020-12/schema'
    )
  })

  it('exports the JSON schema title for sidecar validators', () => {
    expect(runtimeStatusContract.RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE).toBe(
      'Janus Runtime status.get result'
    )
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
