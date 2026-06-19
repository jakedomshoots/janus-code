import {
  getRuntimeStatusPortingContractSummary,
  type RuntimeStatusPortingContractSummary
} from './runtime-status-contract-summary'
import {
  getRuntimeStatusPortingJsonSchema,
  type RuntimeStatusPortingJsonSchema
} from './runtime-status-json-schema'
import { RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH } from './runtime-status-contract-artifact-metadata'

export { RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH }

export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID = 'janus-runtime-status-contract'
export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION = 1
export const RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE =
  'application/vnd.janus.runtime-status-contract+json'

export type RuntimeStatusPortingContractArtifact = {
  artifactId: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
  artifactVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
  artifactMediaType: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
  artifactJsonPath: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH
  summary: RuntimeStatusPortingContractSummary
  jsonSchema: RuntimeStatusPortingJsonSchema
}

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    artifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
    artifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
    artifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
    artifactJsonPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
