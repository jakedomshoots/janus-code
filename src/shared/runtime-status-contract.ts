import type { RuntimeStatus } from './runtime-types'
import {
  RUNTIME_PORTING_FIRST_SLICE_METHOD,
  type RuntimePortingDomainId,
  type RuntimePortingFirstSliceMethod
} from './runtime-porting-domains'
import type { RuntimeStatusPortingContractArtifact } from './runtime-status-contract-artifact'
import type { RuntimeStatusPortingJsonSchema } from './runtime-status-json-schema'
import type { RuntimeStatusPortingValidationResult } from './runtime-status-validation-result'

export const RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID: RuntimePortingDomainId =
  'runtime-status-diagnostics'
export const RUNTIME_STATUS_PORTING_CONTRACT_METHOD: RuntimePortingFirstSliceMethod =
  RUNTIME_PORTING_FIRST_SLICE_METHOD
export const RUNTIME_STATUS_PORTING_CONTRACT_PARAMS = null
export const RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION = 1

const REQUIRED_RUNTIME_STATUS_PORTING_FIELDS = [
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
] as const satisfies readonly (keyof RuntimeStatus)[]

const VERSIONED_RUNTIME_STATUS_PORTING_FIELDS = [
  'runtimeProtocolVersion',
  'minCompatibleRuntimeClientVersion'
] as const satisfies readonly (keyof RuntimeStatus)[]

const NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS = [
  'rendererGraphEpoch',
  'liveTabCount',
  'liveLeafCount'
] as const satisfies readonly (keyof RuntimeStatus)[]

const VALID_RUNTIME_GRAPH_STATUSES = ['ready', 'reloading', 'unavailable'] as const
const VALID_RUNTIME_HOST_PLATFORMS = ['darwin', 'linux', 'win32'] as const
const VALID_RUNTIME_HOST_PLATFORM_VALUES: readonly string[] = VALID_RUNTIME_HOST_PLATFORMS

const INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS = [
  ...VERSIONED_RUNTIME_STATUS_PORTING_FIELDS,
  ...NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  'capabilities',
  'graphStatus',
  'runtimeId',
  'authoritativeWindowId',
  'hostPlatform'
] as const satisfies readonly (keyof RuntimeStatus)[]

export type RuntimeStatusPortingNumericConstraint = {
  integer: true
  minimum: number
  nullable?: true
}

export type RuntimeStatusPortingStringConstraint = {
  minLength: number
  trim?: true
}

export type RuntimeStatusPortingArrayConstraint = {
  itemType: 'string'
}

export type RuntimeStatusPortingField = keyof RuntimeStatus

const RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS = {
  runtimeProtocolVersion: { integer: true, minimum: 1 },
  minCompatibleRuntimeClientVersion: { integer: true, minimum: 1 },
  rendererGraphEpoch: { integer: true, minimum: 0 },
  liveTabCount: { integer: true, minimum: 0 },
  liveLeafCount: { integer: true, minimum: 0 },
  authoritativeWindowId: { integer: true, minimum: 0, nullable: true }
} as const satisfies Partial<Record<keyof RuntimeStatus, RuntimeStatusPortingNumericConstraint>>

const RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS = {
  runtimeId: { minLength: 1, trim: true }
} as const satisfies Partial<Record<keyof RuntimeStatus, RuntimeStatusPortingStringConstraint>>

const RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS = {
  capabilities: { itemType: 'string' }
} as const satisfies Partial<Record<keyof RuntimeStatus, RuntimeStatusPortingArrayConstraint>>

export type RuntimeStatusPortingContractSummary = {
  schemaVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
  domainId: RuntimePortingDomainId
  method: RuntimePortingFirstSliceMethod
  params: null
  requiredFields: RuntimeStatusPortingField[]
  invalidatableFields: RuntimeStatusPortingField[]
  enumValues: {
    graphStatus: string[]
    hostPlatform: string[]
  }
  numericConstraints: Partial<
    Record<RuntimeStatusPortingField, RuntimeStatusPortingNumericConstraint>
  >
  stringConstraints: Partial<
    Record<RuntimeStatusPortingField, RuntimeStatusPortingStringConstraint>
  >
  arrayConstraints: Partial<Record<RuntimeStatusPortingField, RuntimeStatusPortingArrayConstraint>>
}

export type { RuntimeStatusPortingJsonSchema } from './runtime-status-json-schema'
export type { RuntimeStatusPortingContractArtifact } from './runtime-status-contract-artifact'
export type { RuntimeStatusPortingValidationResult } from './runtime-status-validation-result'

export function assertRuntimeStatusPortingContract(status: RuntimeStatus): void {
  const [firstMissingField] = listMissingRuntimeStatusPortingFields(status)
  if (firstMissingField) {
    throw new Error(`Runtime status porting contract missing ${firstMissingField}`)
  }

  const [firstInvalidField] = listInvalidRuntimeStatusPortingFields(status)
  if (firstInvalidField) {
    throw new Error(`Runtime status porting contract invalid ${firstInvalidField}`)
  }
}

export function listMissingRuntimeStatusPortingFields(
  status: RuntimeStatus
): RuntimeStatusPortingField[] {
  return REQUIRED_RUNTIME_STATUS_PORTING_FIELDS.filter((field) => status[field] === undefined)
}

export function validateRuntimeStatusPortingContract(
  status: RuntimeStatus
): RuntimeStatusPortingValidationResult {
  const missingFields = listMissingRuntimeStatusPortingFields(status)
  if (missingFields.length > 0) {
    return { ok: false, missingFields }
  }

  const invalidFields = listInvalidRuntimeStatusPortingFields(status)
  return invalidFields.length === 0 ? { ok: true } : { ok: false, invalidFields }
}

export function listInvalidRuntimeStatusPortingFields(
  status: RuntimeStatus
): RuntimeStatusPortingField[] {
  const invalidFields: RuntimeStatusPortingField[] = VERSIONED_RUNTIME_STATUS_PORTING_FIELDS.filter(
    (field) => {
      const value = status[field]
      return typeof value !== 'number' || !Number.isInteger(value) || value < 1
    }
  )

  if (
    !invalidFields.includes('runtimeProtocolVersion') &&
    !invalidFields.includes('minCompatibleRuntimeClientVersion') &&
    status.minCompatibleRuntimeClientVersion! > status.runtimeProtocolVersion!
  ) {
    invalidFields.push('minCompatibleRuntimeClientVersion')
  }

  invalidFields.push(
    ...NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS.filter((field) => {
      const value = status[field]
      return typeof value !== 'number' || !Number.isInteger(value) || value < 0
    })
  )

  if (
    !Array.isArray(status.capabilities) ||
    status.capabilities.some((item) => typeof item !== 'string')
  ) {
    invalidFields.push('capabilities')
  }

  if (!VALID_RUNTIME_GRAPH_STATUSES.includes(status.graphStatus)) {
    invalidFields.push('graphStatus')
  }

  if (typeof status.runtimeId !== 'string' || status.runtimeId.trim().length === 0) {
    invalidFields.push('runtimeId')
  }

  if (
    status.authoritativeWindowId !== null &&
    (typeof status.authoritativeWindowId !== 'number' ||
      !Number.isInteger(status.authoritativeWindowId) ||
      status.authoritativeWindowId < 0)
  ) {
    invalidFields.push('authoritativeWindowId')
  }

  if (
    typeof status.hostPlatform !== 'string' ||
    !VALID_RUNTIME_HOST_PLATFORM_VALUES.includes(status.hostPlatform)
  ) {
    invalidFields.push('hostPlatform')
  }

  return invalidFields
}

export function listRuntimeStatusPortingRequiredFields(): RuntimeStatusPortingField[] {
  return [...REQUIRED_RUNTIME_STATUS_PORTING_FIELDS]
}

export function listRuntimeStatusPortingInvalidatableFields(): RuntimeStatusPortingField[] {
  return [...INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS]
}

export function getRuntimeStatusPortingContractSummary(): RuntimeStatusPortingContractSummary {
  return {
    schemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
    domainId: RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
    method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
    params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
    requiredFields: listRuntimeStatusPortingRequiredFields(),
    invalidatableFields: listRuntimeStatusPortingInvalidatableFields(),
    enumValues: {
      graphStatus: [...VALID_RUNTIME_GRAPH_STATUSES],
      hostPlatform: [...VALID_RUNTIME_HOST_PLATFORMS]
    },
    numericConstraints: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
    stringConstraints: RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS,
    arrayConstraints: RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS
  }
}

export function getRuntimeStatusPortingJsonSchema(): RuntimeStatusPortingJsonSchema {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Janus Runtime status.get result',
    type: 'object',
    required: listRuntimeStatusPortingRequiredFields(),
    additionalProperties: false,
    properties: {
      runtimeId: {
        type: 'string',
        minLength: RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS.runtimeId.minLength
      },
      graphStatus: {
        type: 'string',
        enum: [...VALID_RUNTIME_GRAPH_STATUSES]
      },
      hostPlatform: {
        type: 'string',
        enum: [...VALID_RUNTIME_HOST_PLATFORMS]
      },
      runtimeProtocolVersion: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.runtimeProtocolVersion.minimum
      },
      minCompatibleRuntimeClientVersion: {
        type: 'integer',
        minimum:
          RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.minCompatibleRuntimeClientVersion.minimum
      },
      rendererGraphEpoch: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.rendererGraphEpoch.minimum
      },
      liveTabCount: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.liveTabCount.minimum
      },
      liveLeafCount: {
        type: 'integer',
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.liveLeafCount.minimum
      },
      authoritativeWindowId: {
        type: ['integer', 'null'],
        minimum: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS.authoritativeWindowId.minimum
      },
      capabilities: {
        type: 'array',
        items: {
          type: RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS.capabilities.itemType
        }
      }
    }
  }
}

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
