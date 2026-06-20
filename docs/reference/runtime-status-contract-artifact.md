# Runtime Status Contract Artifact

Use `src/shared/runtime-status-contract-artifact.json` as the checked-in contract for non-TypeScript runtime adapters, including Rust or Tauri sidecars that need to validate the `status.get` response shape.

Use `src/shared/runtime-status-contract-valid-sample.json` as a known-good `status.get` payload fixture for adapter smoke tests.

Use `src/shared/runtime-status-contract-invalid-sample.json` as a known-bad `status.get` payload fixture for adapter rejection tests.

Use `src/shared/runtime-status-contract-samples.json` as the checked-in sample manifest for non-TypeScript adapter smoke tests. The manifest is labeled with media type `application/vnd.janus.runtime-status-contract-samples+json`, `artifactId: janus-runtime-status-contract-samples`, `artifactJsonPath: src/shared/runtime-status-contract-samples.json`, `contractArtifactPath: src/shared/runtime-status-contract-artifact.json`, `contractArtifactMediaType: application/vnd.janus.runtime-status-contract+json`, `contractArtifactVersion: 1`, `contractSchemaVersion: 1`, `contractJsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `contractJsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `contractJsonSchemaTitle: Janus Runtime status.get result`, `contractMethod: status.get`, and `contractParams: null`.

The artifact is labeled with media type `application/vnd.janus.runtime-status-contract+json`, `jsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `jsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `jsonSchemaTitle: Janus Runtime status.get result`, and includes:

- `summary`: portable contract metadata, required fields, `versionedFields`, `nonNegativeIntegerFields`, `stringFields`, `arrayFields`, `numericFields`, `nullableFields`, `enumFields`, enum values, and constraints.
- `jsonSchema`: the JSON Schema for the `status.get` result.

Run this verifier after changing the runtime status contract:

```sh
pnpm run verify:runtime-status-contract-artifact
```

The TypeScript builders in `src/shared/runtime-status-contract.ts` remain the source of truth. The verifier ensures the checked-in JSON artifact stays in sync with those builders and the runtime porting domain mapping.

## Runtime Porting Summary

Use `src/shared/runtime-porting-domains-summary.json` as the checked-in summary of the current porting domains for non-TypeScript planning tools.

The summary artifact is labeled with media type `application/vnd.janus.runtime-porting-domain-summary+json`, `artifactId: janus-runtime-porting-domain-summary`, `schemaVersion: 1`, `migrationStrategy: incremental-slice`, `sourceRuntime: electron`, and `targetRuntime: tauri` so external readers can reject unknown formats before using the domain plan.

Run this verifier after changing runtime porting domain metadata:

```sh
pnpm run verify:runtime-porting-summary-artifact
```

External tools can run the artifact's `verificationCommand` value, `pnpm vitest run --config config/vitest.config.ts src/shared/runtime-porting-domains.test.ts`, when they need the direct checked-in artifact contract check.

The `firstSliceRationale` value is `read-only-runtime-rpc` because `status.get` exercises the runtime RPC boundary without moving process control, filesystem scanning, terminal lifecycle, or Electron-owned browser surfaces.

The first slice points at `firstSliceContractDomainId: runtime-status-diagnostics`, `firstSliceContractArtifact`, `firstSliceContractArtifactId: janus-runtime-status-contract`, `firstSliceContractArtifactMediaType: application/vnd.janus.runtime-status-contract+json`, `firstSliceContractArtifactVersion: 1`, `firstSliceContractSchemaVersion: 1`, `firstSliceContractParams: null`, `firstSliceContractMethod: status.get`, `firstSliceContractJsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `firstSliceContractJsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `firstSliceContractJsonSchemaTitle: Janus Runtime status.get result`, `firstSliceContractJsonSchema`, `firstSliceContractJsonSchemaPropertyFields`, `firstSliceContractJsonSchemaPropertyCount: 10`, `firstSliceContractAdditionalProperties: false`, `firstSliceContractArtifactPath: src/shared/runtime-status-contract-artifact.json`, `firstSliceContractArtifactJsonPath: src/shared/runtime-status-contract-artifact.json`, `firstSliceContractSummary`, `firstSliceContractValidSamplePath: src/shared/runtime-status-contract-valid-sample.json`, `firstSliceContractInvalidSamplePath: src/shared/runtime-status-contract-invalid-sample.json`, `firstSliceContractValidSampleExpectedResult`, `firstSliceContractInvalidSampleExpectedResult`, `firstSliceContractSamples`, `firstSliceContractSampleCount: 2`, `firstSliceContractSampleKinds`, `firstSliceContractValidSampleCount: 1`, `firstSliceContractInvalidSampleCount: 1`, `firstSliceContractSamplePaths`, `firstSliceContractSampleManifestPath: src/shared/runtime-status-contract-samples.json`, `firstSliceContractSampleManifestArtifactId: janus-runtime-status-contract-samples`, `firstSliceContractSampleManifestMediaType: application/vnd.janus.runtime-status-contract-samples+json`, `firstSliceContractSampleManifestSchemaVersion: 1`, `firstSliceContractSampleManifestArtifactJsonPath: src/shared/runtime-status-contract-samples.json`, `firstSliceContractSampleManifestContractArtifactId: janus-runtime-status-contract`, `firstSliceContractSampleManifestContractArtifactMediaType: application/vnd.janus.runtime-status-contract+json`, `firstSliceContractSampleManifestContractArtifactVersion: 1`, `firstSliceContractSampleManifestContractSchemaVersion: 1`, `firstSliceContractSampleManifestContractJsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `firstSliceContractSampleManifestContractJsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `firstSliceContractSampleManifestContractJsonSchemaTitle: Janus Runtime status.get result`, `firstSliceContractSampleManifestContractMethod: status.get`, `firstSliceContractSampleManifestContractParams: null`, `firstSliceContractSampleManifestContractArtifactPath: src/shared/runtime-status-contract-artifact.json`, `firstSliceContractSampleManifestSamples`, `firstSliceContractSampleManifestSampleCount: 2`, `firstSliceContractSampleManifestSampleKinds`, `firstSliceContractSampleManifestValidSampleCount: 1`, `firstSliceContractSampleManifestInvalidSampleCount: 1`, `firstSliceContractSampleManifestSamplePaths`, `firstSliceContractSampleManifestExpectedResults`, `firstSliceContractSampleManifestValidSampleExpectedResult`, `firstSliceContractSampleManifestVerificationCommand: pnpm run verify:runtime-status-samples`, and `firstSliceContractSampleVerificationCommand: pnpm run verify:runtime-status-samples`, which identify the checked-in `status.get` contract that Rust or Tauri-side readers must preserve.

The summary also includes `firstSliceContractRequiredFields`, `firstSliceContractRequiredFieldCount: 10`, `firstSliceContractArrayFields`, `firstSliceContractArrayFieldCount: 1`, `firstSliceContractArrayConstraints`, `firstSliceContractEnumFields`, `firstSliceContractEnumFieldCount: 2`, `firstSliceContractEnumValues`, `firstSliceContractInvalidatableFields`, `firstSliceContractInvalidatableFieldCount: 10`, `firstSliceContractNonNegativeIntegerFields`, `firstSliceContractNonNegativeIntegerFieldCount: 3`, `firstSliceContractNullableFields`, `firstSliceContractNullableFieldCount: 1`, `firstSliceContractNumericFields`, `firstSliceContractNumericFieldCount: 6`, `firstSliceContractNumericConstraints`, `firstSliceContractStringFields`, `firstSliceContractStringFieldCount: 1`, `firstSliceContractStringConstraints`, `firstSliceContractVersionedFields`, and `firstSliceContractVersionedFieldCount: 2` so sidecar readers can inspect the first slice's minimum payload, required-field count, array fields, array-field count, array constraints, enum fields, enum-field count, enum values, validation, invalidatable fields, invalidatable-field count, non-negative integer fields, non-negative integer field count, nullable fields, nullable-field count, numeric fields, numeric-field count, numeric constraints, string fields, string-field count, string constraints, compatibility-version surfaces, and compatibility-version count before loading the full JSON Schema.
