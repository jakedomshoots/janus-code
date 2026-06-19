import type { RuntimeStatus } from './runtime-types'
import {
  RUNTIME_PORTING_FIRST_SLICE_METHOD,
  type RuntimePortingDomainId,
  type RuntimePortingFirstSliceMethod
} from './runtime-porting-domains'

export const RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID: RuntimePortingDomainId =
  'runtime-status-diagnostics'
export const RUNTIME_STATUS_PORTING_CONTRACT_METHOD: RuntimePortingFirstSliceMethod =
  RUNTIME_PORTING_FIRST_SLICE_METHOD
export const RUNTIME_STATUS_PORTING_CONTRACT_PARAMS = null

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

type RuntimeStatusPortingNumericConstraint = {
  integer: true
  minimum: number
  nullable?: true
}

const RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS = {
  runtimeProtocolVersion: { integer: true, minimum: 1 },
  minCompatibleRuntimeClientVersion: { integer: true, minimum: 1 },
  rendererGraphEpoch: { integer: true, minimum: 0 },
  liveTabCount: { integer: true, minimum: 0 },
  liveLeafCount: { integer: true, minimum: 0 },
  authoritativeWindowId: { integer: true, minimum: 0, nullable: true }
} as const satisfies Partial<Record<keyof RuntimeStatus, RuntimeStatusPortingNumericConstraint>>

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
): (keyof RuntimeStatus)[] {
  return REQUIRED_RUNTIME_STATUS_PORTING_FIELDS.filter((field) => status[field] === undefined)
}

export function validateRuntimeStatusPortingContract(
  status: RuntimeStatus
):
  | { ok: true }
  | { ok: false; missingFields: (keyof RuntimeStatus)[] }
  | { ok: false; invalidFields: (keyof RuntimeStatus)[] } {
  const missingFields = listMissingRuntimeStatusPortingFields(status)
  if (missingFields.length > 0) {
    return { ok: false, missingFields }
  }

  const invalidFields = listInvalidRuntimeStatusPortingFields(status)
  return invalidFields.length === 0 ? { ok: true } : { ok: false, invalidFields }
}

export function listInvalidRuntimeStatusPortingFields(
  status: RuntimeStatus
): (keyof RuntimeStatus)[] {
  const invalidFields: (keyof RuntimeStatus)[] = VERSIONED_RUNTIME_STATUS_PORTING_FIELDS.filter(
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

export function listRuntimeStatusPortingRequiredFields(): (keyof RuntimeStatus)[] {
  return [...REQUIRED_RUNTIME_STATUS_PORTING_FIELDS]
}

export function listRuntimeStatusPortingInvalidatableFields(): (keyof RuntimeStatus)[] {
  return [...INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS]
}

export function getRuntimeStatusPortingContractSummary(): {
  domainId: RuntimePortingDomainId
  method: RuntimePortingFirstSliceMethod
  params: null
  requiredFields: (keyof RuntimeStatus)[]
  invalidatableFields: (keyof RuntimeStatus)[]
  enumValues: {
    graphStatus: string[]
    hostPlatform: string[]
  }
  numericConstraints: Partial<Record<keyof RuntimeStatus, RuntimeStatusPortingNumericConstraint>>
} {
  return {
    domainId: RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
    method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
    params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
    requiredFields: listRuntimeStatusPortingRequiredFields(),
    invalidatableFields: listRuntimeStatusPortingInvalidatableFields(),
    enumValues: {
      graphStatus: [...VALID_RUNTIME_GRAPH_STATUSES],
      hostPlatform: [...VALID_RUNTIME_HOST_PLATFORMS]
    },
    numericConstraints: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS
  }
}
