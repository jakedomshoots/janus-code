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

export function assertRuntimeStatusPortingContract(status: RuntimeStatus): void {
  const [firstMissingField] = listMissingRuntimeStatusPortingFields(status)
  if (firstMissingField) {
    throw new Error(`Runtime status porting contract missing ${firstMissingField}`)
  }
}

export function listMissingRuntimeStatusPortingFields(
  status: RuntimeStatus
): (keyof RuntimeStatus)[] {
  return REQUIRED_RUNTIME_STATUS_PORTING_FIELDS.filter((field) => status[field] === undefined)
}

export function validateRuntimeStatusPortingContract(
  status: RuntimeStatus
): { ok: true } | { ok: false; missingFields: (keyof RuntimeStatus)[] } {
  const missingFields = listMissingRuntimeStatusPortingFields(status)
  return missingFields.length === 0 ? { ok: true } : { ok: false, missingFields }
}

export function listRuntimeStatusPortingRequiredFields(): (keyof RuntimeStatus)[] {
  return [...REQUIRED_RUNTIME_STATUS_PORTING_FIELDS]
}

export function getRuntimeStatusPortingContractSummary(): {
  domainId: RuntimePortingDomainId
  method: RuntimePortingFirstSliceMethod
  params: null
  requiredFields: (keyof RuntimeStatus)[]
} {
  return {
    domainId: RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
    method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
    params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
    requiredFields: listRuntimeStatusPortingRequiredFields()
  }
}
