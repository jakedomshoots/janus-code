import type {
  RuntimePortingDomainId,
  RuntimePortingFirstSliceMethod
} from './runtime-porting-domains'
import {
  RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS,
  type RuntimeStatusPortingArrayConstraint,
  type RuntimeStatusPortingNumericConstraint,
  type RuntimeStatusPortingStringConstraint
} from './runtime-status-constraints'
import {
  RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
} from './runtime-status-contract-metadata'
import {
  listRuntimeStatusPortingInvalidatableFields,
  listRuntimeStatusPortingRequiredFields
} from './runtime-status-contract-validation'
import {
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORMS
} from './runtime-status-enum-values'
import {
  NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  VERSIONED_RUNTIME_STATUS_PORTING_FIELDS
} from './runtime-status-field-groups'
import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

export type RuntimeStatusPortingContractSummary = {
  schemaVersion: 1
  domainId: RuntimePortingDomainId
  method: RuntimePortingFirstSliceMethod
  params: null
  requiredFields: RuntimeStatusPortingField[]
  versionedFields: RuntimeStatusPortingField[]
  nonNegativeIntegerFields: RuntimeStatusPortingField[]
  stringFields: RuntimeStatusPortingField[]
  arrayFields: RuntimeStatusPortingField[]
  numericFields: RuntimeStatusPortingField[]
  nullableFields: RuntimeStatusPortingField[]
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

export function getRuntimeStatusPortingContractSummary(): RuntimeStatusPortingContractSummary {
  return {
    schemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
    domainId: RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
    method: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
    params: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
    requiredFields: listRuntimeStatusPortingRequiredFields(),
    versionedFields: [...VERSIONED_RUNTIME_STATUS_PORTING_FIELDS],
    nonNegativeIntegerFields: [...NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS],
    stringFields: Object.keys(
      RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS
    ) as RuntimeStatusPortingField[],
    arrayFields: Object.keys(
      RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS
    ) as RuntimeStatusPortingField[],
    numericFields: Object.keys(
      RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS
    ) as RuntimeStatusPortingField[],
    nullableFields: Object.entries(RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS)
      .filter(([, constraint]) => constraint.nullable)
      .map(([field]) => field as RuntimeStatusPortingField),
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
