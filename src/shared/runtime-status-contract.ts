import {
  RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS
} from './runtime-status-constraints'
import type { RuntimeStatusPortingContractArtifact } from './runtime-status-contract-artifact'
import type { RuntimeStatusPortingContractSummary } from './runtime-status-contract-summary'
import {
  listRuntimeStatusPortingInvalidatableFields,
  listRuntimeStatusPortingRequiredFields
} from './runtime-status-contract-validation'
import {
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORMS
} from './runtime-status-enum-values'
import { getRuntimeStatusPortingJsonSchema } from './runtime-status-json-schema'
import {
  RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
} from './runtime-status-contract-metadata'

export type { RuntimeStatusPortingJsonSchema } from './runtime-status-json-schema'
export { getRuntimeStatusPortingJsonSchema } from './runtime-status-json-schema'
export type { RuntimeStatusPortingContractArtifact } from './runtime-status-contract-artifact'
export type { RuntimeStatusPortingContractSummary } from './runtime-status-contract-summary'
export type { RuntimeStatusPortingValidationResult } from './runtime-status-validation-result'
export type { RuntimeStatusPortingField } from './runtime-status-porting-field'
export {
  RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
} from './runtime-status-contract-metadata'
export {
  RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS
} from './runtime-status-constraints'
export {
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORMS,
  VALID_RUNTIME_HOST_PLATFORM_VALUES
} from './runtime-status-enum-values'
export {
  INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
  NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  REQUIRED_RUNTIME_STATUS_PORTING_FIELDS,
  VERSIONED_RUNTIME_STATUS_PORTING_FIELDS
} from './runtime-status-field-groups'
export type {
  RuntimeStatusPortingArrayConstraint,
  RuntimeStatusPortingNumericConstraint,
  RuntimeStatusPortingStringConstraint
} from './runtime-status-constraints'
export {
  assertRuntimeStatusPortingContract,
  listInvalidRuntimeStatusPortingFields,
  listMissingRuntimeStatusPortingFields,
  listRuntimeStatusPortingInvalidatableFields,
  listRuntimeStatusPortingRequiredFields,
  validateRuntimeStatusPortingContract
} from './runtime-status-contract-validation'

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

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
