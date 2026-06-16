# RC Rollout

## Current Release Target

- Repository: `jakedomshoots/janus-code`
- Branch/ref: `feature/t3code-gui-workspace`
- First RC tag: `v1.4.73-rc.0`
- Second RC tag for updater validation: `v1.4.73-rc.1`

## Build

Run the release workflow with:

- kind: `rc`
- ref: `feature/t3code-gui-workspace`
- dry_run: `false`

The local checkout must push to `jakedomshoots/janus-code` before this workflow can
produce public RC assets. If `git remote -v` still points at `stablyai/orca`,
do not cut the RC from that checkout.

## Validate

- Download macOS arm64 DMG from the GitHub RC release.
- Install into `/Applications`.
- Launch once from Finder.
- Confirm Gatekeeper accepts the notarized build.
- Confirm the app opens into the GUI-first workspace.
- Confirm in-app update can see the next RC after a second RC is cut.

Verify required assets after each RC upload:

```bash
GH_TOKEN="$GITHUB_TOKEN" GITHUB_REPOSITORY=jakedomshoots/janus-code node config/scripts/verify-release-required-assets.mjs v1.4.73-rc.0
GH_TOKEN="$GITHUB_TOKEN" GITHUB_REPOSITORY=jakedomshoots/janus-code node config/scripts/verify-release-required-assets.mjs v1.4.73-rc.1
```

Expected output for RC 0:

```text
Verified 16 required release assets for jakedomshoots/janus-code@v1.4.73-rc.0
```

## Updater RC Flow

1. Install `v1.4.73-rc.0` from:

```text
https://github.com/jakedomshoots/janus-code/releases/download/v1.4.73-rc.0/janus-code-macos-arm64.dmg
```

2. Cut `v1.4.73-rc.1` from the same branch.
3. Open the installed RC 0 app.
4. Open Settings and trigger update checking.
5. Confirm the app detects RC 1, downloads it, restarts, and reports the RC 1 version.

## Promote

Promote to stable only after the manual QA checklist in
`docs/release/manual-qa-gui-first.md` is complete.
