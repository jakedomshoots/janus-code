# Runtime Status Contract Artifact

Use `src/shared/runtime-status-contract-artifact.json` as the checked-in contract for non-TypeScript runtime adapters, including Rust or Tauri sidecars that need to validate the `status.get` response shape.

The artifact is labeled with media type `application/vnd.janus.runtime-status-contract+json`, `jsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `jsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `jsonSchemaTitle: Janus Runtime status.get result`, and includes:

- `summary`: portable contract metadata, required fields, enum values, and constraints.
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

The first slice points at `firstSliceContractArtifactId: janus-runtime-status-contract`, `firstSliceContractArtifactMediaType: application/vnd.janus.runtime-status-contract+json`, `firstSliceContractArtifactVersion: 1`, `firstSliceContractSchemaVersion: 1`, `firstSliceContractJsonSchemaDraftUri: https://json-schema.org/draft/2020-12/schema`, `firstSliceContractJsonSchemaId: urn:janus:runtime-status-contract:json-schema:1`, `firstSliceContractJsonSchemaTitle: Janus Runtime status.get result`, and `firstSliceContractArtifactPath: src/shared/runtime-status-contract-artifact.json`, which identify the checked-in `status.get` contract that Rust or Tauri-side readers must preserve.

The summary also includes `firstSliceContractRequiredFields`, `firstSliceContractArrayConstraints`, `firstSliceContractEnumValues`, `firstSliceContractInvalidatableFields`, `firstSliceContractNonNegativeIntegerFields`, `firstSliceContractNumericConstraints`, `firstSliceContractStringConstraints`, and `firstSliceContractVersionedFields` so sidecar readers can inspect the first slice's minimum payload, array constraints, enum values, validation, numeric constraints, string constraints, and compatibility-version surfaces before loading the full JSON Schema.
