import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
} from './runtime-status-contract-artifact'
import {
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
  NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
  RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
  RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS,
  REQUIRED_RUNTIME_STATUS_PORTING_FIELDS,
  VALID_RUNTIME_GRAPH_STATUSES,
  VALID_RUNTIME_HOST_PLATFORMS,
  VERSIONED_RUNTIME_STATUS_PORTING_FIELDS
} from './runtime-status-contract'
import { RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH } from './runtime-status-contract-artifact-metadata'
import {
  getRuntimePortingDomain,
  getRuntimePortingFirstSliceDomain,
  getRuntimePortingDomainSummary,
  getRuntimePortingDomainSummaryJson,
  isFirstRuntimePortingSlice,
  getRuntimePortingFirstSliceMethod,
  listRuntimePortingDomainsByBoundary,
  listRuntimePortingDomainsByDisposition,
  listNativeRuntimePortingCandidates,
  listRetainedElectronRuntimeDomains,
  RUNTIME_PORTING_DOMAIN_SUMMARY_ARTIFACT_ID,
  RUNTIME_PORTING_FIRST_SLICE_RATIONALE,
  RUNTIME_PORTING_DOMAIN_SUMMARY_JSON_PATH,
  RUNTIME_PORTING_DOMAIN_SUMMARY_MEDIA_TYPE,
  RUNTIME_PORTING_DOMAIN_SUMMARY_SCHEMA_VERSION,
  RUNTIME_PORTING_MIGRATION_STRATEGY,
  RUNTIME_PORTING_SOURCE_RUNTIME,
  RUNTIME_PORTING_TARGET_RUNTIME,
  RUNTIME_PORTING_VERIFICATION_COMMAND,
  RUNTIME_PORTING_DOMAINS
} from './runtime-porting-domains'

describe('runtime porting domains', () => {
  it('marks runtime status diagnostics as the first safe porting slice', () => {
    const domain = getRuntimePortingDomain('runtime-status-diagnostics')

    expect(domain).toMatchObject({
      id: 'runtime-status-diagnostics',
      boundary: 'runtime-rpc',
      disposition: 'first-slice'
    })
    expect(isFirstRuntimePortingSlice(domain)).toBe(true)
  })

  it('resolves the first runtime porting slice domain', () => {
    expect(getRuntimePortingFirstSliceDomain()).toEqual(
      getRuntimePortingDomain('runtime-status-diagnostics')
    )
  })

  it('summarizes first, native, and retained runtime porting domains', () => {
    expect(getRuntimePortingDomainSummary()).toEqual({
      artifactId: 'janus-runtime-porting-domain-summary',
      mediaType: 'application/vnd.janus.runtime-porting-domain-summary+json',
      schemaVersion: 1,
      migrationStrategy: 'incremental-slice',
      sourceRuntime: 'electron',
      targetRuntime: 'tauri',
      verificationCommand:
        'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-porting-domains.test.ts',
      firstSlice: getRuntimePortingDomain('runtime-status-diagnostics'),
      firstSliceContractArtifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
      firstSliceContractArtifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
      firstSliceContractArtifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
      firstSliceContractArtifactPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
      firstSliceContractSchemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
      firstSliceContractParams: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
      firstSliceContractJsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
      firstSliceContractJsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
      firstSliceContractJsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
      firstSliceContractArrayConstraints: RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
      firstSliceContractEnumValues: {
        graphStatus: VALID_RUNTIME_GRAPH_STATUSES,
        hostPlatform: VALID_RUNTIME_HOST_PLATFORMS
      },
      firstSliceContractInvalidatableFields: INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractNonNegativeIntegerFields:
        NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractNumericConstraints: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
      firstSliceContractRequiredFields: REQUIRED_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractStringConstraints: RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS,
      firstSliceContractVersionedFields: VERSIONED_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceRationale: 'read-only-runtime-rpc',
      firstSliceMethod: getRuntimePortingFirstSliceMethod(),
      nativeCandidates: listNativeRuntimePortingCandidates(),
      retainedElectron: listRetainedElectronRuntimeDomains(),
      totalDomainCount: RUNTIME_PORTING_DOMAINS.length,
      nativeCandidateCount: 3,
      retainedElectronCount: 3
    })
  })

  it('serializes the runtime porting domain summary as stable JSON', () => {
    expect(getRuntimePortingDomainSummaryJson()).toBe(
      `${JSON.stringify(getRuntimePortingDomainSummary(), null, 2)}\n`
    )
  })

  it('keeps a checked-in JSON summary for non-TypeScript porting tools', () => {
    expect(RUNTIME_PORTING_DOMAIN_SUMMARY_JSON_PATH).toBe(
      'src/shared/runtime-porting-domains-summary.json'
    )

    const artifactPath = resolve(__dirname, '../../', RUNTIME_PORTING_DOMAIN_SUMMARY_JSON_PATH)

    expect(existsSync(artifactPath)).toBe(true)
    if (!existsSync(artifactPath)) {
      return
    }

    expect(JSON.parse(readFileSync(artifactPath, 'utf8'))).toEqual(getRuntimePortingDomainSummary())
  })

  it('exposes a package script for verifying the checked-in porting summary artifact', () => {
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))

    expect(packageJson.scripts['verify:runtime-porting-summary-artifact']).toBe(
      'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-porting-domains.test.ts'
    )
  })

  it('documents the runtime porting summary artifact for non-TypeScript tools', () => {
    const doc = readFileSync(
      resolve(__dirname, '../../docs/reference/runtime-status-contract-artifact.md'),
      'utf8'
    )

    expect(doc).toContain(RUNTIME_PORTING_DOMAIN_SUMMARY_JSON_PATH)
    expect(doc).toContain(RUNTIME_PORTING_DOMAIN_SUMMARY_ARTIFACT_ID)
    expect(doc).toContain(RUNTIME_PORTING_DOMAIN_SUMMARY_MEDIA_TYPE)
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID)
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE)
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH)
    expect(doc).toContain(
      `firstSliceContractArtifactVersion: ${RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION}`
    )
    expect(doc).toContain(
      `firstSliceContractSchemaVersion: ${RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION}`
    )
    expect(doc).toContain('firstSliceContractParams: null')
    expect(doc).toContain(
      `firstSliceContractJsonSchemaDraftUri: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI}`
    )
    expect(doc).toContain(
      `firstSliceContractJsonSchemaId: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID}`
    )
    expect(doc).toContain(
      `firstSliceContractJsonSchemaTitle: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE}`
    )
    expect(doc).toContain('firstSliceContractArrayConstraints')
    expect(doc).toContain('firstSliceContractEnumValues')
    expect(doc).toContain('firstSliceContractInvalidatableFields')
    expect(doc).toContain('firstSliceContractNonNegativeIntegerFields')
    expect(doc).toContain('firstSliceContractNumericConstraints')
    expect(doc).toContain('firstSliceContractRequiredFields')
    expect(doc).toContain('firstSliceContractStringConstraints')
    expect(doc).toContain('firstSliceContractVersionedFields')
    expect(doc).toContain(RUNTIME_PORTING_FIRST_SLICE_RATIONALE)
    expect(doc).toContain(`schemaVersion: ${RUNTIME_PORTING_DOMAIN_SUMMARY_SCHEMA_VERSION}`)
    expect(doc).toContain(`migrationStrategy: ${RUNTIME_PORTING_MIGRATION_STRATEGY}`)
    expect(doc).toContain(`sourceRuntime: ${RUNTIME_PORTING_SOURCE_RUNTIME}`)
    expect(doc).toContain(`targetRuntime: ${RUNTIME_PORTING_TARGET_RUNTIME}`)
    expect(doc).toContain(RUNTIME_PORTING_VERIFICATION_COMMAND)
    expect(doc).toContain('pnpm run verify:runtime-porting-summary-artifact')
  })

  it('keeps the embedded browser workbench out of the first native porting wave', () => {
    const domain = getRuntimePortingDomain('browser-workbench')

    expect(domain).toMatchObject({
      id: 'browser-workbench',
      boundary: 'electron-host',
      disposition: 'retain-electron'
    })
    expect(isFirstRuntimePortingSlice(domain)).toBe(false)
  })

  it('keeps every domain id unique', () => {
    const ids = RUNTIME_PORTING_DOMAINS.map((domain) => domain.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists runtime porting domains by host boundary', () => {
    expect(listRuntimePortingDomainsByBoundary('host-service')).toEqual([
      getRuntimePortingDomain('pty-lifecycle'),
      getRuntimePortingDomain('process-supervision'),
      getRuntimePortingDomain('filesystem-workspace-scanning')
    ])
  })

  it('lists runtime porting domains by migration disposition', () => {
    expect(listRuntimePortingDomainsByDisposition('first-slice')).toEqual([
      getRuntimePortingDomain('runtime-status-diagnostics')
    ])
  })

  it('lists host-service domains as native runtime porting candidates', () => {
    expect(listNativeRuntimePortingCandidates()).toEqual([
      getRuntimePortingDomain('pty-lifecycle'),
      getRuntimePortingDomain('process-supervision'),
      getRuntimePortingDomain('filesystem-workspace-scanning')
    ])
  })

  it('lists domains retained on the Electron side of the boundary', () => {
    expect(listRetainedElectronRuntimeDomains()).toEqual([
      getRuntimePortingDomain('browser-workbench'),
      getRuntimePortingDomain('app-shell'),
      getRuntimePortingDomain('provider-review-integrations')
    ])
  })

  it('maps the first runtime slice to the existing status RPC method', () => {
    expect(getRuntimePortingFirstSliceMethod()).toBe('status.get')
  })

  it('keeps the assessment document aligned with the first runtime slice', () => {
    const assessment = readFileSync(
      resolve(__dirname, '../../docs/reference/janus-runtime-porting-assessment.md'),
      'utf8'
    )

    expect(assessment).toContain('runtime-status-diagnostics')
    expect(assessment).toContain(getRuntimePortingFirstSliceMethod())
  })

  it('documents every machine-readable runtime porting domain in the assessment', () => {
    const assessment = readFileSync(
      resolve(__dirname, '../../docs/reference/janus-runtime-porting-assessment.md'),
      'utf8'
    )

    for (const domain of RUNTIME_PORTING_DOMAINS) {
      expect(assessment).toContain(domain.id)
    }
  })
})
