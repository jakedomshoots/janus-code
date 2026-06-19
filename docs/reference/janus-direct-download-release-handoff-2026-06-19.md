# Janus Direct Download Release Handoff - 2026-06-19

## Release Position

Janus Code can ship as a normal direct-download macOS app without paying for Apple Developer Program membership. The App Store path is optional, not required for the current distribution plan.

The direct-download prerelease is published at:

https://github.com/jakedomshoots/janus-code/releases/tag/v0.0.1-rc.8-direct-download.1

The current repo-side workflow gate is at **100/100** for audited release readiness. The installed app is rebuilt and installed locally, but this Mac still needs Accessibility and Screen Recording permission for the bundled Janus Computer Use helper before the live installed-app smoke can pass.

## Verified Requirements

| Requirement | Evidence |
| --- | --- |
| Push latest code to GitHub | All workflow-assurance and direct-download handoff commits through `b57094a1f` were pushed to `origin/main` before publishing the release. |
| Rebuild the app | `pnpm run build:mac` produced fresh unsigned `.dmg` and `.zip` macOS artifacts in `dist/`. |
| Support no-Apple direct download | `pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md` passed with unsigned mac artifacts, checksums, and release notes; those assets were uploaded to the `v0.0.1-rc.8-direct-download.1` GitHub prerelease. |
| Composer/chat wiring audit | `pnpm run verify:janus-workflow-assurance` passed 87 test files and 703 tests, including composer send, recovery, slash commands, model/provider controls, browser context, terminal drawer, source-control, settings, sidebar, browser, editor, and direct-download checks. |
| Slash command backend context | The assurance gate verifies live slash command discovery receives selected project worktree context and SSH connection id. |
| Premium Retro 95 workflow surface | Composer-adjacent workflow coverage now protects the visible controls that changed during the Retro 95 pass: composer controls, terminal/browser tools, right-panel tabs, sidebar actions, settings, and source-control flows. |
| Installed app smoke harness | `pnpm run smoke:janus-workflow` is implemented and runs against the installed runtime. It currently stops at macOS permission denial, with recovery commands printed by the script. |

## Fresh Verification

Last local verification from this handoff pass:

```text
pnpm run verify:janus-workflow-assurance
Test Files  87 passed (87)
Tests       703 passed (703)
Verified direct-download artifacts, checksums, and release notes
```

```text
pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md
Verified direct-download artifacts, checksums, and release notes
```

The installed-app smoke is not green yet because macOS still reports:

```json
{
  "helperAppPath": "/Applications/Janus Code.app/Contents/Resources/Janus Computer Use.app",
  "permissions": [
    { "id": "accessibility", "status": "not-granted" },
    { "id": "screenshots", "status": "not-granted" }
  ]
}
```

## Local Artifact Checksums

```text
bda65289f1a13ffb3c66b5a24b701f82cfe2fc180b689c88cc347ad356d864d9  dist/janus-code-macos-arm64.dmg
ab67941d9eba880ad1ac604f8031689606f9fb429dec6e23d3625e46d4ddaebd  dist/janus-code-macos-x64.dmg
5d9fb21105de871d1b48ee9e9585eae8edef7e25aaf2402a4f5a755c8c7b566d  dist/Janus-Code-0.0.1-rc.8-arm64-mac.zip
7f8fe4d3a45c4c18f68e9a9378b6af21521542035c3f1fa5d2c5a960d7dbccbb  dist/Janus-Code-0.0.1-rc.8-x64-mac.zip
```

These artifacts are intentionally ignored by git. They are published as GitHub Release assets alongside `SHA256SUMS.txt` and `RELEASE_NOTES.md` in the `v0.0.1-rc.8-direct-download.1` prerelease.

## No-Apple Distribution Steps

1. Use the `v0.0.1-rc.8-direct-download.1` GitHub prerelease for the current direct-download build.
2. Keep both `.dmg` files, both `.zip` files, and `SHA256SUMS.txt` attached to that release.
3. Keep `RELEASE_NOTES.md` as the release body so users know this is an unsigned direct-download build.
4. Tell macOS users to verify the checksum and use Finder right-click -> Open on first launch.
5. Do not describe the app as notarized, App Store approved, or Developer ID signed until the paid Apple path exists.

## Installed Smoke Recovery

Before final public release, grant permissions for the helper app:

```sh
janus computer permissions --id accessibility --json
janus computer permissions --id screenshots --json
janus computer permissions --json
```

Then rerun:

```sh
pnpm run smoke:janus-workflow
```

That smoke covers the installed Janus app through Janus Computer Use, including Settings navigation, completed-thread composer state, slash-command picker, browser workbench launch, terminal drawer presence, and right-panel Output/Changes/Review tabs.

## Release Decision

The direct-download release lane is ready from the repo and artifact side. The only remaining local gate is granting macOS helper permissions and rerunning the installed-app smoke. If that smoke passes, the current app can be published through GitHub Releases without the Apple Developer subscription.
