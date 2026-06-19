# Runtime Status Contract Artifact

Use `src/shared/runtime-status-contract-artifact.json` as the checked-in contract for non-TypeScript runtime adapters, including Rust or Tauri sidecars that need to validate the `status.get` response shape.

The artifact is labeled with media type `application/vnd.janus.runtime-status-contract+json` and includes:

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
