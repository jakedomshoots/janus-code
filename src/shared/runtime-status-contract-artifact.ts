import {
  getRuntimeStatusPortingContractSummary,
  type RuntimeStatusPortingContractSummary
} from './runtime-status-contract-summary'
import {
  getRuntimeStatusPortingJsonSchema,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
  type RuntimeStatusPortingJsonSchema
} from './runtime-status-json-schema'
import {
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
} from './runtime-status-contract-artifact-metadata'

export {
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
}

export type RuntimeStatusPortingContractArtifact = {
  artifactId: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
  artifactVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
  artifactMediaType: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
  artifactJsonPath: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH
  jsonSchemaDraftUri: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI
  jsonSchemaId: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID
  jsonSchemaTitle: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
  summary: RuntimeStatusPortingContractSummary
  jsonSchema: RuntimeStatusPortingJsonSchema
}

export function getRuntimeStatusPortingContractArtifact(): RuntimeStatusPortingContractArtifact {
  return {
    artifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
    artifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
    artifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
    artifactJsonPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
    jsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
    jsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
    jsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
    summary: getRuntimeStatusPortingContractSummary(),
    jsonSchema: getRuntimeStatusPortingJsonSchema()
  }
}

export function getRuntimeStatusPortingContractArtifactJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractArtifact())
}
