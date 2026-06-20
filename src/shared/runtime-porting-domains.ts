import {
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ADDITIONAL_PROPERTIES,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARRAY_CONSTRAINTS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARRAY_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_ID,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_VERSION,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_DOMAIN_ID,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ENUM_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ENUM_VALUES,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALID_SAMPLE_EXPECTED_RESULT,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALID_SAMPLE_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALIDATABLE_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_ID,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_PROPERTY_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_TITLE,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_METHOD,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NON_NEGATIVE_INTEGER_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NULLABLE_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NUMERIC_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NUMERIC_CONSTRAINTS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_PARAMS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_REQUIRED_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_ARTIFACT_JSON_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_ARTIFACT_ID,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_CONTRACT_ARTIFACT_ID,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_CONTRACT_ARTIFACT_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_MEDIA_TYPE,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_SCHEMA_VERSION,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_VERIFICATION_COMMAND,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLES,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SCHEMA_VERSION,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_STRING_FIELDS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_STRING_CONSTRAINTS,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VALID_SAMPLE_EXPECTED_RESULT,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VALID_SAMPLE_PATH,
  RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VERSIONED_FIELDS
} from './runtime-porting-first-slice-contract'
import type { RuntimePortingDomainSummary } from './runtime-porting-domain-summary'
export type { RuntimePortingDomainSummary } from './runtime-porting-domain-summary'
export * from './runtime-porting-first-slice-contract'

export type RuntimePortingDomainBoundary = 'runtime-rpc' | 'electron-host' | 'host-service'

export type RuntimePortingDomainDisposition = 'first-slice' | 'native-candidate' | 'retain-electron'

export type RuntimePortingDomainId =
  | 'runtime-status-diagnostics'
  | 'pty-lifecycle'
  | 'process-supervision'
  | 'filesystem-workspace-scanning'
  | 'browser-workbench'
  | 'app-shell'
  | 'provider-review-integrations'

export type RuntimePortingDomain = {
  id: RuntimePortingDomainId
  boundary: RuntimePortingDomainBoundary
  disposition: RuntimePortingDomainDisposition
}

export type RuntimePortingDomainSummaryArtifactId = 'janus-runtime-porting-domain-summary'
export type RuntimePortingDomainSummaryMediaType =
  'application/vnd.janus.runtime-porting-domain-summary+json'
export type RuntimePortingDomainSummarySchemaVersion = 1
export type RuntimePortingMigrationStrategy = 'incremental-slice'
export type RuntimePortingSourceRuntime = 'electron'
export type RuntimePortingTargetRuntime = 'tauri'
export type RuntimePortingVerificationCommand =
  'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-porting-domains.test.ts'
export type RuntimePortingFirstSliceRationale = 'read-only-runtime-rpc'

export type RuntimePortingFirstSliceMethod = 'status.get'

export const RUNTIME_PORTING_FIRST_SLICE_METHOD: RuntimePortingFirstSliceMethod = 'status.get'
export const RUNTIME_PORTING_DOMAIN_SUMMARY_ARTIFACT_ID: RuntimePortingDomainSummaryArtifactId =
  'janus-runtime-porting-domain-summary'
export const RUNTIME_PORTING_DOMAIN_SUMMARY_MEDIA_TYPE: RuntimePortingDomainSummaryMediaType =
  'application/vnd.janus.runtime-porting-domain-summary+json'
export const RUNTIME_PORTING_DOMAIN_SUMMARY_SCHEMA_VERSION: RuntimePortingDomainSummarySchemaVersion = 1
export const RUNTIME_PORTING_DOMAIN_SUMMARY_JSON_PATH =
  'src/shared/runtime-porting-domains-summary.json'
export const RUNTIME_PORTING_MIGRATION_STRATEGY: RuntimePortingMigrationStrategy =
  'incremental-slice'
export const RUNTIME_PORTING_SOURCE_RUNTIME: RuntimePortingSourceRuntime = 'electron'
export const RUNTIME_PORTING_TARGET_RUNTIME: RuntimePortingTargetRuntime = 'tauri'
export const RUNTIME_PORTING_VERIFICATION_COMMAND: RuntimePortingVerificationCommand =
  'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-porting-domains.test.ts'
export const RUNTIME_PORTING_FIRST_SLICE_RATIONALE: RuntimePortingFirstSliceRationale =
  'read-only-runtime-rpc'
// Why: this keeps the porting plan machine-checkable before any Rust or host
// adapter code exists, so future slices can move one domain at a time.
export const RUNTIME_PORTING_DOMAINS = [
  {
    id: 'runtime-status-diagnostics',
    boundary: 'runtime-rpc',
    disposition: 'first-slice'
  },
  {
    id: 'pty-lifecycle',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'process-supervision',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'filesystem-workspace-scanning',
    boundary: 'host-service',
    disposition: 'native-candidate'
  },
  {
    id: 'browser-workbench',
    boundary: 'electron-host',
    disposition: 'retain-electron'
  },
  {
    id: 'app-shell',
    boundary: 'electron-host',
    disposition: 'retain-electron'
  },
  {
    id: 'provider-review-integrations',
    boundary: 'runtime-rpc',
    disposition: 'retain-electron'
  }
] as const satisfies readonly RuntimePortingDomain[]

export function getRuntimePortingDomain(id: RuntimePortingDomainId): RuntimePortingDomain {
  return RUNTIME_PORTING_DOMAINS.find((domain) => domain.id === id)!
}

export function getRuntimePortingFirstSliceDomain(): RuntimePortingDomain {
  return RUNTIME_PORTING_DOMAINS.find((domain) => domain.disposition === 'first-slice')!
}

export function isFirstRuntimePortingSlice(domain: RuntimePortingDomain): boolean {
  return domain.disposition === 'first-slice'
}

export function listRuntimePortingDomainsByBoundary(
  boundary: RuntimePortingDomainBoundary
): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.boundary === boundary)
}

export function listRuntimePortingDomainsByDisposition(
  disposition: RuntimePortingDomainDisposition
): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === disposition)
}

export function listNativeRuntimePortingCandidates(): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === 'native-candidate')
}

export function listRetainedElectronRuntimeDomains(): readonly RuntimePortingDomain[] {
  return RUNTIME_PORTING_DOMAINS.filter((domain) => domain.disposition === 'retain-electron')
}

export function getRuntimePortingDomainSummary(): RuntimePortingDomainSummary {
  const nativeCandidates = listNativeRuntimePortingCandidates()
  const retainedElectron = listRetainedElectronRuntimeDomains()

  return {
    artifactId: RUNTIME_PORTING_DOMAIN_SUMMARY_ARTIFACT_ID,
    mediaType: RUNTIME_PORTING_DOMAIN_SUMMARY_MEDIA_TYPE,
    schemaVersion: RUNTIME_PORTING_DOMAIN_SUMMARY_SCHEMA_VERSION,
    migrationStrategy: RUNTIME_PORTING_MIGRATION_STRATEGY,
    sourceRuntime: RUNTIME_PORTING_SOURCE_RUNTIME,
    targetRuntime: RUNTIME_PORTING_TARGET_RUNTIME,
    verificationCommand: RUNTIME_PORTING_VERIFICATION_COMMAND,
    firstSlice: getRuntimePortingFirstSliceDomain(),
    firstSliceContractDomainId: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_DOMAIN_ID,
    firstSliceContractArtifactId: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_ID,
    firstSliceContractArtifactMediaType: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_MEDIA_TYPE,
    firstSliceContractArtifactVersion: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_VERSION,
    firstSliceContractArtifactPath: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_PATH,
    firstSliceContractValidSamplePath: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VALID_SAMPLE_PATH,
    firstSliceContractInvalidSamplePath: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALID_SAMPLE_PATH,
    firstSliceContractValidSampleExpectedResult:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VALID_SAMPLE_EXPECTED_RESULT,
    firstSliceContractInvalidSampleExpectedResult:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALID_SAMPLE_EXPECTED_RESULT,
    firstSliceContractSamples: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLES,
    firstSliceContractSampleVerificationCommand:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_VERIFICATION_COMMAND,
    firstSliceContractSampleManifestPath: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_PATH,
    firstSliceContractSampleManifestArtifactId:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_ARTIFACT_ID,
    firstSliceContractSampleManifestMediaType:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_MEDIA_TYPE,
    firstSliceContractSampleManifestSchemaVersion:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_SCHEMA_VERSION,
    firstSliceContractSampleManifestArtifactJsonPath:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_ARTIFACT_JSON_PATH,
    firstSliceContractSampleManifestContractArtifactId:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_CONTRACT_ARTIFACT_ID,
    firstSliceContractSampleManifestContractArtifactPath:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SAMPLE_MANIFEST_CONTRACT_ARTIFACT_PATH,
    firstSliceContractSchemaVersion: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_SCHEMA_VERSION,
    firstSliceContractParams: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_PARAMS,
    firstSliceContractMethod: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_METHOD,
    firstSliceContractJsonSchemaDraftUri:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_DRAFT_URI,
    firstSliceContractJsonSchemaId: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_ID,
    firstSliceContractJsonSchemaTitle: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_TITLE,
    firstSliceContractJsonSchemaPropertyFields:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_PROPERTY_FIELDS,
    firstSliceContractAdditionalProperties:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ADDITIONAL_PROPERTIES,
    firstSliceContractArrayFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARRAY_FIELDS,
    firstSliceContractArrayConstraints: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARRAY_CONSTRAINTS,
    firstSliceContractEnumFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ENUM_FIELDS,
    firstSliceContractEnumValues: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ENUM_VALUES,
    firstSliceContractInvalidatableFields:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALIDATABLE_FIELDS,
    firstSliceContractNonNegativeIntegerFields:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NON_NEGATIVE_INTEGER_FIELDS,
    firstSliceContractNullableFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NULLABLE_FIELDS,
    firstSliceContractNumericFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NUMERIC_FIELDS,
    firstSliceContractNumericConstraints: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_NUMERIC_CONSTRAINTS,
    firstSliceContractRequiredFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_REQUIRED_FIELDS,
    firstSliceContractStringFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_STRING_FIELDS,
    firstSliceContractStringConstraints: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_STRING_CONSTRAINTS,
    firstSliceContractVersionedFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_VERSIONED_FIELDS,
    firstSliceRationale: RUNTIME_PORTING_FIRST_SLICE_RATIONALE,
    firstSliceMethod: getRuntimePortingFirstSliceMethod(),
    nativeCandidates,
    retainedElectron,
    totalDomainCount: RUNTIME_PORTING_DOMAINS.length,
    nativeCandidateCount: nativeCandidates.length,
    retainedElectronCount: retainedElectron.length
  }
}

export function getRuntimePortingDomainSummaryJson(): string {
  return `${JSON.stringify(getRuntimePortingDomainSummary(), null, 2)}\n`
}

export function getRuntimePortingFirstSliceMethod(): RuntimePortingFirstSliceMethod {
  return RUNTIME_PORTING_FIRST_SLICE_METHOD
}
