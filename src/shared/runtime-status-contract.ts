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
  for (const field of REQUIRED_RUNTIME_STATUS_PORTING_FIELDS) {
    if (status[field] === undefined) {
      throw new Error(`Runtime status porting contract missing ${field}`)
    }
  }
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
