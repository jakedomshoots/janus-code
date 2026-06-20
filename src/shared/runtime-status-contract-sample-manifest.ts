import {
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
} from './runtime-status-contract-artifact-metadata'
import {
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
} from './runtime-status-contract-metadata'
import {
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
} from './runtime-status-json-schema'
import type { RuntimeStatusPortingValidationResult } from './runtime-status-validation-result'

export const RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_ID =
  'janus-runtime-status-contract-samples'
export const RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_MEDIA_TYPE =
  'application/vnd.janus.runtime-status-contract-samples+json'
export const RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_SCHEMA_VERSION = 1
export const RUNTIME_STATUS_PORTING_CONTRACT_VALID_SAMPLE_PATH =
  'src/shared/runtime-status-contract-valid-sample.json'
export const RUNTIME_STATUS_PORTING_CONTRACT_INVALID_SAMPLE_PATH =
  'src/shared/runtime-status-contract-invalid-sample.json'
export const RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_VERIFICATION_COMMAND =
  'pnpm run verify:runtime-status-samples'

export type RuntimeStatusPortingContractSample = {
  kind: 'valid' | 'invalid'
  path:
    | typeof RUNTIME_STATUS_PORTING_CONTRACT_VALID_SAMPLE_PATH
    | typeof RUNTIME_STATUS_PORTING_CONTRACT_INVALID_SAMPLE_PATH
  expectedResult: RuntimeStatusPortingValidationResult
}

export type RuntimeStatusPortingContractSampleManifest = {
  artifactId: typeof RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_ID
  mediaType: typeof RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_MEDIA_TYPE
  schemaVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_SCHEMA_VERSION
  contractArtifactId: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
  contractArtifactPath: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH
  contractArtifactMediaType: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
  contractArtifactVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
  contractSchemaVersion: typeof RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION
  contractJsonSchemaDraftUri: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI
  contractJsonSchemaId: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID
  contractJsonSchemaTitle: typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
  contractMethod: typeof RUNTIME_STATUS_PORTING_CONTRACT_METHOD
  contractParams: typeof RUNTIME_STATUS_PORTING_CONTRACT_PARAMS
  samples: readonly RuntimeStatusPortingContractSample[]
  verificationCommand: typeof RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_VERIFICATION_COMMAND
}

export function getRuntimeStatusPortingContractSampleManifest(): RuntimeStatusPortingContractSampleManifest {
  return {
    artifactId: RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_ID,
    mediaType: RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_MEDIA_TYPE,
    schemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_MANIFEST_SCHEMA_VERSION,
    contractArtifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
    contractArtifactPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
    contractArtifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
    contractArtifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
    contractSchemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
    contractJsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
    contractJsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
    contractJsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
    contractMethod: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
    contractParams: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
    samples: [
      {
        kind: 'valid',
        path: RUNTIME_STATUS_PORTING_CONTRACT_VALID_SAMPLE_PATH,
        expectedResult: { ok: true }
      },
      {
        kind: 'invalid',
        path: RUNTIME_STATUS_PORTING_CONTRACT_INVALID_SAMPLE_PATH,
        expectedResult: {
          ok: false,
          missingFields: ['runtimeId']
        }
      }
    ],
    verificationCommand: RUNTIME_STATUS_PORTING_CONTRACT_SAMPLE_VERIFICATION_COMMAND
  }
}

export function getRuntimeStatusPortingContractSampleManifestJson(): string {
  return JSON.stringify(getRuntimeStatusPortingContractSampleManifest())
}
