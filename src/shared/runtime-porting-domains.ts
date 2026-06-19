import {
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
} from './runtime-status-contract-artifact-metadata'
import {
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
} from './runtime-status-json-schema'
import {
  INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
  REQUIRED_RUNTIME_STATUS_PORTING_FIELDS
} from './runtime-status-field-groups'
import type { RuntimeStatusPortingField } from './runtime-status-porting-field'

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
export type RuntimePortingFirstSliceContractArtifactId =
  typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
export type RuntimePortingFirstSliceContractArtifactMediaType =
  typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
export type RuntimePortingFirstSliceContractArtifactVersion =
  typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
export type RuntimePortingFirstSliceContractArtifactPath =
  typeof RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH
export type RuntimePortingFirstSliceContractJsonSchemaDraftUri =
  typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI
export type RuntimePortingFirstSliceContractJsonSchemaId =
  typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID
export type RuntimePortingFirstSliceContractJsonSchemaTitle =
  typeof RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
export type RuntimePortingFirstSliceContractRequiredFields = readonly RuntimeStatusPortingField[]
export type RuntimePortingFirstSliceContractInvalidatableFields =
  readonly RuntimeStatusPortingField[]

export type RuntimePortingDomainSummary = {
  artifactId: RuntimePortingDomainSummaryArtifactId
  mediaType: RuntimePortingDomainSummaryMediaType
  schemaVersion: RuntimePortingDomainSummarySchemaVersion
  migrationStrategy: RuntimePortingMigrationStrategy
  sourceRuntime: RuntimePortingSourceRuntime
  targetRuntime: RuntimePortingTargetRuntime
  verificationCommand: RuntimePortingVerificationCommand
  firstSlice: RuntimePortingDomain
  firstSliceContractArtifactId: RuntimePortingFirstSliceContractArtifactId
  firstSliceContractArtifactMediaType: RuntimePortingFirstSliceContractArtifactMediaType
  firstSliceContractArtifactVersion: RuntimePortingFirstSliceContractArtifactVersion
  firstSliceContractArtifactPath: RuntimePortingFirstSliceContractArtifactPath
  firstSliceContractJsonSchemaDraftUri: RuntimePortingFirstSliceContractJsonSchemaDraftUri
  firstSliceContractJsonSchemaId: RuntimePortingFirstSliceContractJsonSchemaId
  firstSliceContractJsonSchemaTitle: RuntimePortingFirstSliceContractJsonSchemaTitle
  firstSliceContractInvalidatableFields: RuntimePortingFirstSliceContractInvalidatableFields
  firstSliceContractRequiredFields: RuntimePortingFirstSliceContractRequiredFields
  firstSliceRationale: RuntimePortingFirstSliceRationale
  firstSliceMethod: RuntimePortingFirstSliceMethod
  nativeCandidates: readonly RuntimePortingDomain[]
  retainedElectron: readonly RuntimePortingDomain[]
  totalDomainCount: number
  nativeCandidateCount: number
  retainedElectronCount: number
}

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
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_ID: RuntimePortingFirstSliceContractArtifactId =
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_MEDIA_TYPE: RuntimePortingFirstSliceContractArtifactMediaType =
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_VERSION: RuntimePortingFirstSliceContractArtifactVersion =
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_PATH: RuntimePortingFirstSliceContractArtifactPath =
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_DRAFT_URI: RuntimePortingFirstSliceContractJsonSchemaDraftUri =
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_ID: RuntimePortingFirstSliceContractJsonSchemaId =
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_TITLE: RuntimePortingFirstSliceContractJsonSchemaTitle =
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALIDATABLE_FIELDS: RuntimePortingFirstSliceContractInvalidatableFields =
  INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS
export const RUNTIME_PORTING_FIRST_SLICE_CONTRACT_REQUIRED_FIELDS: RuntimePortingFirstSliceContractRequiredFields =
  REQUIRED_RUNTIME_STATUS_PORTING_FIELDS

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
    firstSliceContractArtifactId: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_ID,
    firstSliceContractArtifactMediaType: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_MEDIA_TYPE,
    firstSliceContractArtifactVersion: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_VERSION,
    firstSliceContractArtifactPath: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_ARTIFACT_PATH,
    firstSliceContractJsonSchemaDraftUri:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_DRAFT_URI,
    firstSliceContractJsonSchemaId: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_ID,
    firstSliceContractJsonSchemaTitle: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_JSON_SCHEMA_TITLE,
    firstSliceContractInvalidatableFields:
      RUNTIME_PORTING_FIRST_SLICE_CONTRACT_INVALIDATABLE_FIELDS,
    firstSliceContractRequiredFields: RUNTIME_PORTING_FIRST_SLICE_CONTRACT_REQUIRED_FIELDS,
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
