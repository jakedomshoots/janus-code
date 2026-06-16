# Janus Code Public Rebrand Design

## Goal

Rebrand the public product from Orca/Agent Hub to **Janus Code** for a public push, with `janus` as the primary CLI command, while preserving compatibility paths needed to keep existing workspaces, migrations, tests, and hidden aliases healthy.

## Scope

This is a public-facing rebrand first. The work should remove Orca branding from user-visible app copy, release identity, public docs, package metadata, Homebrew casks, update feeds, and CLI documentation. It should not blindly rename every internal `orca` token where that token is a compatibility key, test fixture, migration path, MIME type, or low-level identifier whose change could break existing data.

## Public Identity

- Product name: `Janus Code`
- Package/release slug: `janus-code`
- Primary CLI command: `janus`
- GitHub release repository: `jakedomshoots/janus-code`
- macOS app id target: `com.jakedom.januscode`
- Legacy names are not public marketing names.

## Compatibility Policy

Keep the `orca` CLI as a hidden compatibility alias for now. Keep legacy `.orca`, `orca-*`, and `application/x-orca-*` keys where they are persisted state, protocol/event contracts, migration paths, or test fixtures. When touching active user-facing text near these keys, display Janus Code while leaving storage identifiers intact. Legal attribution may mention Orca as the upstream MIT project, but only in `NOTICE.md` and license-related docs.

## Implementation Shape

1. Add a small public identity source of truth where useful, but prefer direct changes where the repo already uses constants or package metadata.
2. Update package metadata, release scripts, updater URLs, casks, workflow repository gates, and public release docs to `jakedomshoots/janus-code`.
3. Update visible renderer/main copy from `Orca` to `Janus Code`.
4. Update CLI/public docs so `janus` is primary and `orca` is documented only as legacy compatibility if needed.
5. Leave internal compatibility keys alone unless a test proves a safe migration exists.

## Testing

Run focused identity/updater/release tests after the mechanical retarget, then run `pnpm run verify:public-release-identity`, `pnpm run typecheck`, `pnpm run lint`, and targeted renderer/main tests for changed copy. Full E2E can be deferred until the rebrand compiles and focused tests pass.

## Non-Goals

- No public signed release in this rebrand pass.
- No destructive migration of existing user data.
- No removal of all lowercase `orca` identifiers by force.
- No rewrite of unrelated fixture repo names unless they are visible public docs.
