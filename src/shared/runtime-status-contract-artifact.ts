import {
  getRuntimeStatusPortingContractSummary,
  type RuntimeStatusPortingContractSummary
} from './runtime-status-contract-summary'
import {
  getRuntimeStatusPortingJsonSchema,
  type RuntimeStatusPortingJsonSchema
} from './runtime-status-json-schema'

export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID = 'janus-runtime-status-contract'
export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION = 1
export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE =
  'application/vnd.janus.runtime-status-contract+json'

export type RuntimeStatusPortingContractArtifact = {
  artifactId: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
  artifactVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
  artifactMediaType: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
  summary: RuntimeStatusPortingContractSummary
  jsonSchema: RuntimeStatusPortingJsonSchema
}

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    artifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
    artifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
    artifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
