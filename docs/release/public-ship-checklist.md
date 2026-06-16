# Public Ship Checklist

## Required Before RC

- Product identity is `Agent Hub`.
- App id is `com.jakedom.agenthub`.
- GitHub release repository is `jakedom/agent-hub`.
- Auto-update feed points at `jakedom/agent-hub`.
- README install links point at `jakedom/agent-hub`.
- Orca and T3 Code attribution is present in `NOTICE.md`.
- Full local gate passes:
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run test`
  - `pnpm run test:e2e`
- Packaged macOS ad-hoc build launches through `pnpm run build:mac`.
- macOS release build passes signing and notarization through `pnpm run build:mac:release`.
- Windows and Linux artifacts build in CI.
- Manual QA checklist is complete on macOS.

## Required Before Stable

- RC release has at least one clean install on a fresh macOS user account.
- RC release successfully updates to a newer RC through in-app update.
- Crash-free manual QA sessions cover:
  - first run
  - provider sign-in
  - existing repo import
  - new worktree from prompt
  - source-control review
  - commit generation
  - PR generation
  - terminal debug drawer
  - settings account management
- Stable tag has all required assets:
  - `latest-mac.yml`
  - `latest.yml`
  - `latest-linux.yml`
  - macOS DMG and ZIP for arm64 and x64
  - Windows setup executable and blockmap
  - Linux AppImage, deb, rpm
