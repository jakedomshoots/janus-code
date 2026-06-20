import {
  RUNTIME_PORTING_FIRST_SLICE_METHOD,
  type RuntimePortingDomainId,
  type RuntimePortingFirstSliceMethod
} from './runtime-porting-domains'
export { RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION } from './runtime-status-contract-schema-version'

export const RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID: RuntimePortingDomainId =
  'runtime-status-diagnostics'
export const RUNTIME_STATUS_PORTING_CONTRACT_METHOD: RuntimePortingFirstSliceMethod =
  RUNTIME_PORTING_FIRST_SLICE_METHOD
export const RUNTIME_STATUS_PORTING_CONTRACT_PARAMS = null
