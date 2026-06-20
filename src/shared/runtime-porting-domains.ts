export type { RuntimePortingDomainSummary } from './runtime-porting-domain-summary'
export {
  getRuntimePortingDomainSummary,
  getRuntimePortingDomainSummaryJson
} from './runtime-porting-domain-summary-builder'
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

export function getRuntimePortingFirstSliceMethod(): RuntimePortingFirstSliceMethod {
  return RUNTIME_PORTING_FIRST_SLICE_METHOD
}
