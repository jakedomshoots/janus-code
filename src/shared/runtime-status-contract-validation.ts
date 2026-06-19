import type { RuntimeStatus } from './runtime-types'
import {
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORM_VALUES
} from './runtime-status-enum-values'
import {
  INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
  NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  REQUIRED_RUNTIME_STATUS_PORTING_FIELDS,
  VERSIONED_RUNTIME_STATUS_PORTING_FIELDS
} from './runtime-status-field-groups'
import type { RuntimeStatusPortingField } from './runtime-status-porting-field'
import type { RuntimeStatusPortingValidationResult } from './runtime-status-validation-result'

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
