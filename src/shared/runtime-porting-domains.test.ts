import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getRuntimeStatusPortingContractArtifact,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
  RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION
} from './runtime-status-contract-artifact'
import { getRuntimeStatusPortingContractSummary } from './runtime-status-contract-summary'
import {
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
  getRuntimeStatusPortingJsonSchema,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
  RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
  RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
  RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
  RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
  RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
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
      firstSliceContractDomainId: RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID,
      firstSliceContractArtifactId: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID,
      firstSliceContractArtifactMediaType: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE,
      firstSliceContractArtifactVersion: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION,
      firstSliceContractArtifactPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
      firstSliceContractArtifactJsonPath: RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH,
      firstSliceContractArtifact: getRuntimeStatusPortingContractArtifact(),
      firstSliceContractSummary: getRuntimeStatusPortingContractSummary(),
      firstSliceContractValidSamplePath: 'src/shared/runtime-status-contract-valid-sample.json',
      firstSliceContractInvalidSamplePath: 'src/shared/runtime-status-contract-invalid-sample.json',
      firstSliceContractValidSampleExpectedResult: { ok: true },
      firstSliceContractInvalidSampleExpectedResult: {
        ok: false,
        missingFields: ['runtimeId']
      },
      firstSliceContractSamples: [
        {
          kind: 'valid',
          path: 'src/shared/runtime-status-contract-valid-sample.json',
          expectedResult: { ok: true }
        },
        {
          kind: 'invalid',
          path: 'src/shared/runtime-status-contract-invalid-sample.json',
          expectedResult: {
            ok: false,
            missingFields: ['runtimeId']
          }
        }
      ],
      firstSliceContractSampleCount: 2,
      firstSliceContractSamplePaths: [
        'src/shared/runtime-status-contract-valid-sample.json',
        'src/shared/runtime-status-contract-invalid-sample.json'
      ],
      firstSliceContractSampleVerificationCommand: 'pnpm run verify:runtime-status-samples',
      firstSliceContractSampleManifestPath: 'src/shared/runtime-status-contract-samples.json',
      firstSliceContractSampleManifestArtifactId: 'janus-runtime-status-contract-samples',
      firstSliceContractSampleManifestMediaType:
        'application/vnd.janus.runtime-status-contract-samples+json',
      firstSliceContractSampleManifestSchemaVersion: 1,
      firstSliceContractSampleManifestArtifactJsonPath:
        'src/shared/runtime-status-contract-samples.json',
      firstSliceContractSampleManifestContractArtifactId: 'janus-runtime-status-contract',
      firstSliceContractSampleManifestContractArtifactMediaType:
        'application/vnd.janus.runtime-status-contract+json',
      firstSliceContractSampleManifestContractArtifactVersion: 1,
      firstSliceContractSampleManifestContractSchemaVersion: 1,
      firstSliceContractSampleManifestContractJsonSchemaDraftUri:
        RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
      firstSliceContractSampleManifestContractJsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
      firstSliceContractSampleManifestContractJsonSchemaTitle:
        RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
      firstSliceContractSampleManifestContractMethod: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
      firstSliceContractSampleManifestContractParams: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
      firstSliceContractSampleManifestContractArtifactPath:
        'src/shared/runtime-status-contract-artifact.json',
      firstSliceContractSampleManifestSamples: [
        {
          kind: 'valid',
          path: 'src/shared/runtime-status-contract-valid-sample.json',
          expectedResult: { ok: true }
        },
        {
          kind: 'invalid',
          path: 'src/shared/runtime-status-contract-invalid-sample.json',
          expectedResult: {
            ok: false,
            missingFields: ['runtimeId']
          }
        }
      ],
      firstSliceContractSampleManifestSampleCount: 2,
      firstSliceContractSampleManifestVerificationCommand: 'pnpm run verify:runtime-status-samples',
      firstSliceContractSchemaVersion: RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION,
      firstSliceContractParams: RUNTIME_STATUS_PORTING_CONTRACT_PARAMS,
      firstSliceContractMethod: RUNTIME_STATUS_PORTING_CONTRACT_METHOD,
      firstSliceContractJsonSchemaDraftUri: RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI,
      firstSliceContractJsonSchemaId: RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID,
      firstSliceContractJsonSchemaTitle: RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE,
      firstSliceContractJsonSchema: getRuntimeStatusPortingJsonSchema(),
      firstSliceContractJsonSchemaPropertyFields: [
        'runtimeId',
        'graphStatus',
        'hostPlatform',
        'runtimeProtocolVersion',
        'minCompatibleRuntimeClientVersion',
        'rendererGraphEpoch',
        'liveTabCount',
        'liveLeafCount',
        'authoritativeWindowId',
        'capabilities'
      ],
      firstSliceContractJsonSchemaPropertyCount: 10,
      firstSliceContractAdditionalProperties: false,
      firstSliceContractArrayFields: ['capabilities'],
      firstSliceContractArrayFieldCount: 1,
      firstSliceContractArrayConstraints: RUNTIME_STATUS_PORTING_ARRAY_CONSTRAINTS,
      firstSliceContractEnumFields: ['graphStatus', 'hostPlatform'],
      firstSliceContractEnumFieldCount: 2,
      firstSliceContractEnumValues: {
        graphStatus: VALID_RUNTIME_GRAPH_STATUSES,
        hostPlatform: VALID_RUNTIME_HOST_PLATFORMS
      },
      firstSliceContractInvalidatableFields: INVALIDATABLE_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractInvalidatableFieldCount: 10,
      firstSliceContractNonNegativeIntegerFields:
        NON_NEGATIVE_INTEGER_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractNonNegativeIntegerFieldCount: 3,
      firstSliceContractNullableFields: ['authoritativeWindowId'],
      firstSliceContractNullableFieldCount: 1,
      firstSliceContractNumericFields: [
        'runtimeProtocolVersion',
        'minCompatibleRuntimeClientVersion',
        'rendererGraphEpoch',
        'liveTabCount',
        'liveLeafCount',
        'authoritativeWindowId'
      ],
      firstSliceContractNumericFieldCount: 6,
      firstSliceContractNumericConstraints: RUNTIME_STATUS_PORTING_NUMERIC_CONSTRAINTS,
      firstSliceContractRequiredFields: REQUIRED_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractRequiredFieldCount: 10,
      firstSliceContractStringFields: ['runtimeId'],
      firstSliceContractStringFieldCount: 1,
      firstSliceContractStringConstraints: RUNTIME_STATUS_PORTING_STRING_CONSTRAINTS,
      firstSliceContractVersionedFields: VERSIONED_RUNTIME_STATUS_PORTING_FIELDS,
      firstSliceContractVersionedFieldCount: 2,
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

  it('keeps the runtime porting domain summary type in a dedicated module', () => {
    const source = readFileSync(resolve(__dirname, './runtime-porting-domains.ts'), 'utf8')

    expect(source).toContain("from './runtime-porting-domain-summary'")
    expect(source).not.toContain('export type RuntimePortingDomainSummary =')
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
    expect(packageJson.scripts['verify:runtime-status-samples']).toBe(
      'pnpm vitest run --config config/vitest.config.ts src/shared/runtime-status-contract.test.ts --testNamePattern "runtime status sample"'
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
    expect(doc).toContain(
      `firstSliceContractDomainId: ${RUNTIME_STATUS_PORTING_CONTRACT_DOMAIN_ID}`
    )
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_ID)
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_MEDIA_TYPE)
    expect(doc).toContain(RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH)
    expect(doc).toContain(
      `firstSliceContractArtifactJsonPath: ${RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_JSON_PATH}`
    )
    expect(doc).toContain('`firstSliceContractArtifact`')
    expect(doc).toContain('firstSliceContractSummary')
    expect(doc).toContain('firstSliceContractValidSamplePath')
    expect(doc).toContain('firstSliceContractInvalidSamplePath')
    expect(doc).toContain('firstSliceContractValidSampleExpectedResult')
    expect(doc).toContain('firstSliceContractInvalidSampleExpectedResult')
    expect(doc).toContain('firstSliceContractSamples')
    expect(doc).toContain('firstSliceContractSampleCount: 2')
    expect(doc).toContain('firstSliceContractSamplePaths')
    expect(doc).toContain('firstSliceContractSampleVerificationCommand')
    expect(doc).toContain('firstSliceContractSampleManifestPath')
    expect(doc).toContain('firstSliceContractSampleManifestArtifactId')
    expect(doc).toContain('firstSliceContractSampleManifestMediaType')
    expect(doc).toContain('firstSliceContractSampleManifestSchemaVersion: 1')
    expect(doc).toContain('firstSliceContractSampleManifestArtifactJsonPath')
    expect(doc).toContain('firstSliceContractSampleManifestContractArtifactId')
    expect(doc).toContain('firstSliceContractSampleManifestContractArtifactMediaType')
    expect(doc).toContain('firstSliceContractSampleManifestContractArtifactVersion: 1')
    expect(doc).toContain('firstSliceContractSampleManifestContractSchemaVersion: 1')
    expect(doc).toContain(
      `firstSliceContractSampleManifestContractJsonSchemaDraftUri: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI}`
    )
    expect(doc).toContain(
      `firstSliceContractSampleManifestContractJsonSchemaId: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID}`
    )
    expect(doc).toContain(
      `firstSliceContractSampleManifestContractJsonSchemaTitle: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE}`
    )
    expect(doc).toContain(
      `firstSliceContractSampleManifestContractMethod: ${RUNTIME_STATUS_PORTING_CONTRACT_METHOD}`
    )
    expect(doc).toContain('firstSliceContractSampleManifestContractParams: null')
    expect(doc).toContain('firstSliceContractSampleManifestContractArtifactPath')
    expect(doc).toContain('firstSliceContractSampleManifestSamples')
    expect(doc).toContain('firstSliceContractSampleManifestSampleCount: 2')
    expect(doc).toContain(
      'firstSliceContractSampleManifestVerificationCommand: pnpm run verify:runtime-status-samples'
    )
    expect(doc).toContain('pnpm run verify:runtime-status-samples')
    expect(doc).toContain(
      `firstSliceContractArtifactVersion: ${RUNTIME_STATUS_PORTING_CONTRACT_ARTIFACT_VERSION}`
    )
    expect(doc).toContain(
      `firstSliceContractSchemaVersion: ${RUNTIME_STATUS_PORTING_CONTRACT_SCHEMA_VERSION}`
    )
    expect(doc).toContain('firstSliceContractParams: null')
    expect(doc).toContain(`firstSliceContractMethod: ${RUNTIME_STATUS_PORTING_CONTRACT_METHOD}`)
    expect(doc).toContain(
      `firstSliceContractJsonSchemaDraftUri: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_DRAFT_URI}`
    )
    expect(doc).toContain(
      `firstSliceContractJsonSchemaId: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_ID}`
    )
    expect(doc).toContain(
      `firstSliceContractJsonSchemaTitle: ${RUNTIME_STATUS_PORTING_JSON_SCHEMA_TITLE}`
    )
    expect(doc).toContain('`firstSliceContractJsonSchema`')
    expect(doc).toContain('firstSliceContractJsonSchemaPropertyFields')
    expect(doc).toContain('firstSliceContractJsonSchemaPropertyCount: 10')
    expect(doc).toContain('firstSliceContractAdditionalProperties: false')
    expect(doc).toContain('firstSliceContractArrayFields')
    expect(doc).toContain('firstSliceContractArrayFieldCount: 1')
    expect(doc).toContain('firstSliceContractArrayConstraints')
    expect(doc).toContain('firstSliceContractEnumFields')
    expect(doc).toContain('firstSliceContractEnumFieldCount: 2')
    expect(doc).toContain('firstSliceContractEnumValues')
    expect(doc).toContain('firstSliceContractInvalidatableFields')
    expect(doc).toContain('firstSliceContractInvalidatableFieldCount: 10')
    expect(doc).toContain('firstSliceContractNonNegativeIntegerFields')
    expect(doc).toContain('firstSliceContractNonNegativeIntegerFieldCount: 3')
    expect(doc).toContain('firstSliceContractNullableFields')
    expect(doc).toContain('firstSliceContractNullableFieldCount: 1')
    expect(doc).toContain('firstSliceContractNumericFields')
    expect(doc).toContain('firstSliceContractNumericFieldCount: 6')
    expect(doc).toContain('firstSliceContractNumericConstraints')
    expect(doc).toContain('firstSliceContractRequiredFields')
    expect(doc).toContain('firstSliceContractRequiredFieldCount: 10')
    expect(doc).toContain('firstSliceContractStringFields')
    expect(doc).toContain('firstSliceContractStringFieldCount: 1')
    expect(doc).toContain('firstSliceContractStringConstraints')
    expect(doc).toContain('firstSliceContractVersionedFields')
    expect(doc).toContain('firstSliceContractVersionedFieldCount: 2')
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
