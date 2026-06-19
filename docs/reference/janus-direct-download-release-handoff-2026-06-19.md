# Janus Direct Download Release Handoff - 2026-06-19

## Release Position

Janus Code can ship as a normal direct-download macOS app without paying for Apple Developer Program membership. The App Store path is optional, not required for the current distribution plan.

The direct-download prerelease is published at:

https://github.com/jakedomshoots/janus-code/releases/tag/v0.0.1-rc.8-direct-download.1

The current repo-side workflow gate is at **100/100** for audited release readiness. The installed app was rebuilt locally, and the live installed-app smoke now passes with the bundled Janus Computer Use helper permissions granted on this Mac.

## Verified Requirements

| Requirement | Evidence |
| --- | --- |
| Push latest code to GitHub | The verified workflow-assurance and direct-download handoff branch is pushed to `origin/main` after each release-readiness pass. |
| Rebuild the app | `pnpm run build:unpack` rebuilt the local unpacked macOS app in `dist/mac-arm64/Janus Code.app`; `pnpm run build:mac` produces the unsigned `.dmg` and `.zip` macOS artifacts in `dist/`. |
| Support no-Apple direct download | `pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md` passed with unsigned mac artifacts, checksums, and release notes; those assets were uploaded to the `v0.0.1-rc.8-direct-download.1` GitHub prerelease. |
| Composer/chat wiring audit | `pnpm run verify:janus-workflow-assurance` passed 92 test files and 733 tests, including composer send, recovery, slash commands, model/provider controls, browser context, terminal drawer, source-control, settings, sidebar, browser, editor, and direct-download checks. |
| Slash command backend context | The assurance gate verifies live slash command discovery receives selected project worktree context and SSH connection id. |
| Premium Retro 95 workflow surface | Composer-adjacent workflow coverage now protects the visible controls that changed during the Retro 95 pass: composer controls, terminal/browser tools, right-panel tabs, sidebar actions, settings, and source-control flows. |
| Installed app smoke harness | `pnpm run smoke:janus-workflow` passed against the installed runtime, covering the live chat/composer workflow, slash command picker, browser workbench, terminal drawer, and right-panel tabs. |
| Release performance scorecard | `pnpm run verify:release-perf-scorecard` passed with measured idle CPU and terminal-scale reports instead of skipped optional artifacts. |
| Native computer-use gate | `pnpm run verify:computer-native` passed the local native checks; SwiftPM tests are explicitly skipped when this Mac's Command Line Tools install does not provide `xctest`. |

## Fresh Verification

Last local verification from this handoff pass:

```text
pnpm run verify:janus-workflow-assurance
Test Files  92 passed (92)
Tests       733 passed (733)
Verified direct-download artifacts, checksums, and release notes
```

```text
pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md
Verified direct-download artifacts, checksums, and release notes
```

```text
pnpm test
Test Files  1756 passed | 2 skipped (1758)
Tests       17253 passed | 13 skipped (17266)
```

```text
pnpm run test:e2e
182 passed, 7 skipped
```

```text
pnpm run build:unpack
packaging platform=darwin arch=arm64 electron=42.3.3 appOutDir=dist/mac-arm64
```

```text
pnpm run smoke:janus-workflow
computer-use smoke: Janus workflow gate passed
```

```text
pnpm run verify:release-perf-scorecard
release perf scorecard: pass
PASS  idle-cpu.mean-total                   1.59  budget 2.00
PASS  terminal-scale.worst-typing          15.70  budget 300.00
PASS  terminal-scale.restore              614.60  budget 2000.00
```

```text
pnpm run verify:computer-native
[computer-native] skip macOS Swift renderer/provider tests: xctest not found
[computer-native] Linux provider Python syntax
syntax-ok
[computer-native] native provider argument guardrails
[computer-native] macOS helper app bundle and signature
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

If a different Mac reports permission denial, grant permissions for the helper app:

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

The direct-download release lane is ready from the repo, artifact, installed-smoke, and local performance sides. The current app can be published through GitHub Releases without the Apple Developer subscription, as long as it is described accurately as unsigned and not notarized.
