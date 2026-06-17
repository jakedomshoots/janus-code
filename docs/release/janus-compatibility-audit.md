# Janus Code Compatibility Audit

This audit separates public Janus Code identity from compatibility names that
still exist to keep existing workspaces, saved settings, protocol handlers, and
agent integrations working.

## Public Identity

- Product name: Janus Code
- Desktop CLI: `janus`
- Desktop protocol: `janus://pair`
- Public repository: `jakedomshoots/janus-code`
- macOS bundle id: `com.jakedom.januscode`
- Mobile app name: Janus Mobile
- Mobile bundle/package id: `com.jakedom.janusmobile`
- Local audio package: `@janus-code/expo-two-way-audio`

## Feedback Backend

Feedback submission no longer posts to the old Orca-hosted endpoints by
default. Janus Code now fails closed unless a Janus feedback endpoint is
explicitly configured:

- `JANUS_FEEDBACK_API_URL`
- Optional fallback: `JANUS_FEEDBACK_API_FALLBACK_URL`

If neither variable is present, the IPC returns a clear not-configured error
and performs no network request.

## Keep For Compatibility

These names are intentionally kept until there is a migration plan and test
coverage for each storage or integration boundary:

- `orca://pair` legacy protocol handling for already published pairing links.
- `legacyCliBin: "orca"` and old CLI discovery paths for existing agent skill
  setups.
- Persisted `orca-*` filenames, local stores, and historical workspace
  folders.
- `.orca` repository configuration files and hook trust records.
- `ORCA_*` environment variables where Janus equivalents have not fully
  replaced deployed scripts.
- IPC/event names such as `browser:open-link-in-orca-tab` when changing them
  would require renderer/preload/main migrations in one coordinated cut.
- Runtime module names such as `orca-runtime.ts` and internal test fixtures
  where the name is not user-visible.
- Sidecar binary names such as `orca-computer-use-macos` while package and
  permission migrations are still in flight.
- Legacy StablyAI bundle ids in sidecar authorization checks, alongside Janus
  bundle ids, so existing local development apps continue to work.

## Rename Later With Migrations

These should be scheduled as explicit migration work rather than broad string
replacement:

- Runtime type and file names containing Orca.
- Persisted settings keys and database table fields containing Orca.
- Internal IPC channels and preload API names containing Orca.
- Sidecar executable/package names.
- Test fixture repositories that intentionally model a repository named
  `stablyai/orca`.

## Release Verification

Current local gates for this audit:

- `pnpm run typecheck`
- `pnpm run verify:public-release-identity`
- `pnpm run verify:localization-catalog`
- `pnpm exec vitest run --config config/vitest.config.ts config/scripts/verify-packaged-release-artifacts.test.mjs config/scripts/verify-release-required-assets.test.mjs config/scripts/electron-builder-config.test.mjs src/main/ipc/feedback.test.ts src/main/ipc/crash-reporting.test.ts`
- `pnpm --dir mobile test`
- `pnpm --dir mobile lint`
- `pnpm run build:unpack`
- `pnpm run build:mac`
- `pnpm run verify:packaged-release-artifacts:mac`
