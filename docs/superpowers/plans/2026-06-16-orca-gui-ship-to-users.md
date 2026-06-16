# Orca GUI Ship To Users Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the GUI-first Orca fork on `feature/t3code-gui-workspace` into a public, installable, update-safe desktop release for real users.

**Architecture:** Keep Orca as the application base and preserve the GUI-first work already landed on this branch. Add a public-release identity layer, legal attribution, QA runbooks, full automated gates, packaged-app smoke checks, updater ownership, and CI release wiring before cutting RC and stable builds.

**Tech Stack:** Electron, electron-vite, electron-builder, React 19, TypeScript, Zustand, Tailwind CSS 4, Vitest, Playwright Electron E2E, GitHub Releases, electron-updater, macOS Developer ID signing/notarization, Homebrew Cask.

---

## Current Baseline

- Repo: `/Users/jakedom/Documents/Codex/2026-06-15/i-have-an-idea-i-love/orca`
- Branch: `feature/t3code-gui-workspace`
- Current checkpoint: `21c8a8c fix: stabilize gui workspace flows`
- Working tree status at plan creation: clean
- GUI-first targeted E2E status: `41 passed`, `1 skipped`
- Static gates already passing at checkpoint: `pnpm run typecheck`, `pnpm run lint`

## Shipping Definition

The project is ready to ship to users when all of these are true:

- The app launches into the GUI-first workspace by default.
- Terminal/TUI remains available only as execution infrastructure and debug visibility.
- Product identity is explicit and update-safe for a public fork.
- License and attribution are complete for Orca and the T3 Code donor.
- macOS artifacts are signed, hardened, notarized, installable, and updateable.
- Windows and Linux artifacts build and install without relying on a developer checkout.
- Full automated test gates pass from a clean checkout.
- Manual QA covers first run, provider setup, worktree creation, source control, terminal debug drawer, settings, and update flow.
- Public docs explain install, supported agents, privacy/telemetry, known limitations, and uninstall.
- A beta/RC channel is published before stable.

## Release Identity Defaults

Use these defaults for the public fork unless the product owner explicitly chooses another name before Task 1:

```json
{
  "productName": "Agent Hub",
  "productSlug": "agent-hub",
  "appId": "com.jakedom.agenthub",
  "githubOwner": "jakedom",
  "githubRepo": "agent-hub",
  "homepage": "https://github.com/jakedom/agent-hub",
  "cliBin": "agent-hub",
  "legacyCliBin": "orca"
}
```

Reason: shipping a public fork under the upstream `Orca` product identity can confuse users, update feeds, cache directories, Homebrew casks, and release channels. Preserve Orca attribution, but use a separate public app identity.

## Files To Create Or Modify

### Product Identity And Release Ownership

- Create: `config/public-release-identity.json`
- Create: `config/scripts/verify-public-release-identity.mjs`
- Create: `config/scripts/verify-public-release-identity.test.mjs`
- Modify: `package.json`
- Modify: `config/electron-builder.config.cjs`
- Modify: `src/main/updater-prerelease-feed.ts`
- Modify: `src/main/updater-prerelease-feed.test.ts`
- Modify: `src/main/updater-prerelease-feed-readiness.test.ts`
- Modify: `src/main/updater.ts`
- Modify: `src/main/updater.test.ts`
- Modify: `src/main/updater-changelog.ts`
- Modify: `src/main/updater-changelog.test.ts`
- Modify: `src/main/updater-nudge.ts`
- Modify: `src/main/updater-nudge.test.ts`
- Modify: `.github/workflows/release-cut.yml`
- Modify: `config/scripts/verify-release-required-assets.mjs`
- Modify: `config/scripts/verify-release-required-assets.test.mjs`
- Create: `Casks/agent-hub.rb`
- Create: `Casks/agent-hub@rc.rb`
- Modify or replace: `resources/darwin/bin/orca`
- Modify or replace: `resources/win32/bin/orca.cmd`
- Modify or replace: `resources/linux/bin/orca-ide`

### Legal, Docs, And Public Readiness

- Create: `NOTICE.md`
- Create: `docs/release/public-ship-checklist.md`
- Create: `docs/release/manual-qa-gui-first.md`
- Create: `docs/release/license-attribution-audit.md`
- Create: `docs/release/packaged-artifact-smoke.md`
- Create: `docs/release/rc-rollout.md`
- Create: `docs/release/stable-rollout.md`
- Modify: `README.md`
- Modify: `docs/reference/t3code-ui-donor-attribution.md`
- Modify: `docs/gui-workspace-transition.md`

### GUI Product Hardening

- Modify: `src/renderer/src/App.tsx`
- Modify: `src/renderer/src/components/Terminal.tsx`
- Modify: `src/renderer/src/components/sidebar/WorktreeList.tsx`
- Modify: `src/renderer/src/components/right-sidebar/SourceControl.tsx`
- Modify: `src/renderer/src/components/settings/AccountsPane.tsx`
- Modify: `src/renderer/src/components/onboarding/use-onboarding-flow.ts`
- Modify: `src/renderer/src/components/onboarding/IntegrationsStep.tsx`
- Modify: `src/renderer/src/components/onboarding/ThemeStep.tsx`
- Test: targeted tests under `tests/e2e/`

### Packaging, Signing, And Verification

- Modify: `config/scripts/verify-macos-release-env.mjs`
- Modify: `resources/build/entitlements.mac.plist`
- Modify: `resources/build/entitlements.computer-use.mac.plist`
- Create: `config/scripts/verify-packaged-release-artifacts.mjs`
- Create: `config/scripts/verify-packaged-release-artifacts.test.mjs`
- Modify: `.github/workflows/pr.yml`
- Modify: `.github/workflows/e2e.yml`
- Modify: `.github/workflows/release-cut.yml`

---

## Task 1: Freeze The Release Scope

**Files:**
- Create: `docs/release/public-ship-checklist.md`
- Modify: `docs/gui-workspace-transition.md`

- [ ] **Step 1: Write the public ship checklist**

Create `docs/release/public-ship-checklist.md` with this content:

```markdown
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
```

- [ ] **Step 2: Update the GUI transition doc**

Append this section to `docs/gui-workspace-transition.md`:

```markdown
## Public Release Boundary

The GUI-first workspace is shippable only after public release identity,
attribution, updater ownership, packaged artifact smoke tests, and manual QA
are complete. The terminal remains part of execution and debugging, but the
default user path must start in the GUI workspace.
```

- [ ] **Step 3: Commit**

```bash
git add docs/release/public-ship-checklist.md docs/gui-workspace-transition.md
git commit -m "docs: define public ship checklist"
```

## Task 2: Add Product Identity Configuration

**Files:**
- Create: `config/public-release-identity.json`
- Create: `config/scripts/verify-public-release-identity.mjs`
- Create: `config/scripts/verify-public-release-identity.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the identity manifest**

Create `config/public-release-identity.json`:

```json
{
  "productName": "Agent Hub",
  "productSlug": "agent-hub",
  "appId": "com.jakedom.agenthub",
  "githubOwner": "jakedom",
  "githubRepo": "agent-hub",
  "homepage": "https://github.com/jakedom/agent-hub",
  "cliBin": "agent-hub",
  "legacyCliBin": "orca",
  "macAppName": "Agent Hub.app",
  "copyright": "Copyright (c) 2026 Jake Dominick"
}
```

- [ ] **Step 2: Add a release identity verifier**

Create `config/scripts/verify-public-release-identity.mjs`:

```js
#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()

export function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

export function readText(path) {
  return readFileSync(join(root, path), 'utf8')
}

export function verifyIdentity({ identity, packageJson, builderConfigText }) {
  const failures = []
  const releaseRepo = `${identity.githubOwner}/${identity.githubRepo}`

  if (packageJson.name !== identity.productSlug) {
    failures.push(`package.json name must be ${identity.productSlug}`)
  }
  if (packageJson.homepage !== identity.homepage) {
    failures.push(`package.json homepage must be ${identity.homepage}`)
  }
  if (!builderConfigText.includes(`appId: '${identity.appId}'`)) {
    failures.push(`electron-builder appId must be ${identity.appId}`)
  }
  if (!builderConfigText.includes(`productName: '${identity.productName}'`)) {
    failures.push(`electron-builder productName must be ${identity.productName}`)
  }
  if (!builderConfigText.includes(`owner: '${identity.githubOwner}'`)) {
    failures.push(`electron-builder publish owner must be ${identity.githubOwner}`)
  }
  if (!builderConfigText.includes(`repo: '${identity.githubRepo}'`)) {
    failures.push(`electron-builder publish repo must be ${identity.githubRepo}`)
  }
  if (builderConfigText.includes("owner: 'stablyai'") || builderConfigText.includes("repo: 'orca'")) {
    failures.push('electron-builder publish config still points at stablyai/orca')
  }
  if (releaseRepo === 'stablyai/orca') {
    failures.push('public fork release repo must not be stablyai/orca')
  }

  return failures
}

export function main() {
  const identity = readJson('config/public-release-identity.json')
  const packageJson = readJson('package.json')
  const builderConfigText = readText('config/electron-builder.config.cjs')
  const failures = verifyIdentity({ identity, packageJson, builderConfigText })
  if (failures.length > 0) {
    console.error('Public release identity verification failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exit(1)
  }
  console.log(`Verified public release identity for ${identity.productName}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
```

- [ ] **Step 3: Add verifier tests**

Create `config/scripts/verify-public-release-identity.test.mjs`:

```js
import { describe, expect, it } from 'vitest'
import { verifyIdentity } from './verify-public-release-identity.mjs'

const identity = {
  productName: 'Agent Hub',
  productSlug: 'agent-hub',
  appId: 'com.jakedom.agenthub',
  githubOwner: 'jakedom',
  githubRepo: 'agent-hub',
  homepage: 'https://github.com/jakedom/agent-hub'
}

describe('verifyIdentity', () => {
  it('accepts the public fork identity', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: { name: 'agent-hub', homepage: 'https://github.com/jakedom/agent-hub' },
        builderConfigText: [
          "appId: 'com.jakedom.agenthub'",
          "productName: 'Agent Hub'",
          "owner: 'jakedom'",
          "repo: 'agent-hub'"
        ].join('\n')
      })
    ).toEqual([])
  })

  it('rejects upstream publish ownership', () => {
    expect(
      verifyIdentity({
        identity,
        packageJson: { name: 'agent-hub', homepage: 'https://github.com/jakedom/agent-hub' },
        builderConfigText: [
          "appId: 'com.jakedom.agenthub'",
          "productName: 'Agent Hub'",
          "owner: 'stablyai'",
          "repo: 'orca'"
        ].join('\n')
      })
    ).toContain('electron-builder publish config still points at stablyai/orca')
  })
})
```

- [ ] **Step 4: Wire the verifier into package scripts**

Add this script to `package.json`:

```json
"verify:public-release-identity": "node config/scripts/verify-public-release-identity.mjs"
```

- [ ] **Step 5: Run the new tests**

```bash
pnpm run test -- config/scripts/verify-public-release-identity.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add config/public-release-identity.json config/scripts/verify-public-release-identity.mjs config/scripts/verify-public-release-identity.test.mjs package.json
git commit -m "build: add public release identity gate"
```

## Task 3: Repoint Packaging And Update Feeds

**Files:**
- Modify: `package.json`
- Modify: `config/electron-builder.config.cjs`
- Modify: `src/main/updater-prerelease-feed.ts`
- Modify: `src/main/updater-prerelease-feed.test.ts`
- Modify: `src/main/updater-prerelease-feed-readiness.test.ts`
- Modify: `src/main/updater.ts`
- Modify: `src/main/updater.test.ts`
- Modify: `src/main/updater-changelog.ts`
- Modify: `src/main/updater-changelog.test.ts`
- Modify: `src/main/updater-nudge.ts`
- Modify: `src/main/updater-nudge.test.ts`

- [ ] **Step 1: Update package metadata**

In `package.json`, set:

```json
{
  "name": "agent-hub",
  "description": "GUI-first desktop workspace for CLI coding agents",
  "homepage": "https://github.com/jakedom/agent-hub",
  "author": "Jake Dominick"
}
```

Keep the existing version until the release workflow bumps it.

- [ ] **Step 2: Update electron-builder product identity**

In `config/electron-builder.config.cjs`, update these values:

```js
appId: 'com.jakedom.agenthub',
productName: 'Agent Hub',
```

Update publish ownership:

```js
publish: {
  provider: 'github',
  owner: 'jakedom',
  repo: 'agent-hub',
  releaseType: 'release'
}
```

Update artifact names:

```js
nsis: {
  artifactName: 'agent-hub-windows-setup.${ext}',
  shortcutName: '${productName}',
  uninstallDisplayName: '${productName}',
  createDesktopShortcut: 'always'
},
dmg: {
  artifactName: 'agent-hub-macos-${arch}.${ext}'
},
appImage: {
  artifactName: 'agent-hub-linux.${ext}'
},
deb: {
  packageName: 'agent-hub',
  artifactName: 'agent-hub_${version}_${arch}.${ext}',
  depends: ['python3', 'python3-gi', 'gir1.2-atspi-2.0', 'at-spi2-core', 'xdotool', 'xclip']
},
rpm: {
  packageName: 'agent-hub',
  artifactName: 'agent-hub-${version}.${arch}.${ext}',
  depends: ['python3', 'python3-gobject', 'at-spi2-core', 'xdotool', 'xclip']
}
```

- [ ] **Step 3: Repoint updater feed constants**

In `src/main/updater-prerelease-feed.ts`, replace the upstream constants with:

```ts
const RELEASE_REPO_OWNER = 'jakedom'
const RELEASE_REPO_NAME = 'agent-hub'
const RELEASE_REPO = `${RELEASE_REPO_OWNER}/${RELEASE_REPO_NAME}`
const ATOM_FEED_URL = `https://github.com/${RELEASE_REPO}/releases.atom`
const RELEASES_DOWNLOAD_BASE = `https://github.com/${RELEASE_REPO}/releases/download`
const TAG_HREF_RE = new RegExp(
  `href="https://github\\\\.com/${RELEASE_REPO_OWNER}/${RELEASE_REPO_NAME}/releases/tag/([^"]+)"`,
  'g'
)
```

- [ ] **Step 4: Repoint updater fallback URLs**

In `src/main/updater.ts`, replace release download URLs with:

```ts
const GITHUB_RELEASE_DOWNLOAD_BASE = 'https://github.com/jakedom/agent-hub/releases/latest/download'
```

Use the constant at every current `https://github.com/stablyai/orca/releases/latest/download` call site.

- [ ] **Step 5: Repoint changelog and nudge endpoints**

In `src/main/updater-changelog.ts`:

```ts
const CHANGELOG_URL = 'https://github.com/jakedom/agent-hub/releases'
const CHANGELOG_JSON_URL =
  'https://raw.githubusercontent.com/jakedom/agent-hub/main/docs/release/changelog.json'
```

In `src/main/updater-nudge.ts`:

```ts
const NUDGE_JSON_URL =
  'https://raw.githubusercontent.com/jakedom/agent-hub/main/docs/release/nudge.json'
```

Use those constants in the existing fetch calls.

- [ ] **Step 6: Update tests for new URLs and artifact names**

Replace `stablyai/orca` with `jakedom/agent-hub` in updater tests. Replace expected artifact names with:

```text
agent-hub-macos-arm64.dmg
agent-hub-macos-x64.dmg
agent-hub-windows-setup.exe
agent-hub-linux.AppImage
```

For mac ZIP assets generated by electron-builder, assert the actual product ZIP names after running `pnpm run build:mac`. This plan expects `Agent Hub-1.4.73-arm64-mac.zip` and `Agent Hub-1.4.73-mac.zip` for the first stable public release.

- [ ] **Step 7: Verify identity and updater tests**

```bash
pnpm run verify:public-release-identity
pnpm run test -- src/main/updater.test.ts src/main/updater-prerelease-feed.test.ts src/main/updater-prerelease-feed-readiness.test.ts src/main/updater-changelog.test.ts src/main/updater-nudge.test.ts
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add package.json config/electron-builder.config.cjs src/main/updater-prerelease-feed.ts src/main/updater-prerelease-feed.test.ts src/main/updater-prerelease-feed-readiness.test.ts src/main/updater.ts src/main/updater.test.ts src/main/updater-changelog.ts src/main/updater-changelog.test.ts src/main/updater-nudge.ts src/main/updater-nudge.test.ts
git commit -m "build: repoint release identity and update feeds"
```

## Task 4: Preserve CLI Compatibility Without Shipping Upstream Names As Primary

**Files:**
- Modify: `package.json`
- Create or replace: `resources/darwin/bin/agent-hub`
- Create or replace: `resources/win32/bin/agent-hub.cmd`
- Create or replace: `resources/linux/bin/agent-hub`
- Modify: `config/electron-builder.config.cjs`
- Modify: `config/scripts/verify-cli-bin.test.mjs`
- Modify: `config/scripts/verify-cli-bin.mjs`

- [ ] **Step 1: Update package bin entries**

Set `package.json` `bin` to:

```json
"bin": {
  "agent-hub": "./out/cli/index.js",
  "orca": "./out/cli/index.js",
  "agent-hub-dev": "./config/scripts/orca-dev.mjs"
}
```

Reason: `agent-hub` is primary for public users; `orca` remains a compatibility alias while existing CLI automation is migrated.

- [ ] **Step 2: Add Unix launcher**

Create `resources/darwin/bin/agent-hub` and `resources/linux/bin/agent-hub` with this executable shell content:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
RESOURCES_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

for candidate in "Agent Hub" agent-hub; do
  if [[ -x "$RESOURCES_DIR/../MacOS/$candidate" ]]; then
    ELECTRON="$RESOURCES_DIR/../MacOS/$candidate"
    break
  fi
  if [[ -x "$RESOURCES_DIR/$candidate" ]]; then
    ELECTRON="$RESOURCES_DIR/$candidate"
    break
  fi
done

if [[ -z "${ELECTRON:-}" ]]; then
  echo "Unable to locate Agent Hub executable next to $RESOURCES_DIR" >&2
  exit 1
fi

export ELECTRON_RUN_AS_NODE=1
exec "$ELECTRON" "$RESOURCES_DIR/app.asar.unpacked/out/cli/index.js" "$@"
```

- [ ] **Step 3: Add Windows launcher**

Create `resources/win32/bin/agent-hub.cmd`:

```bat
@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "RESOURCES_DIR=%%~fI"
for %%I in ("%RESOURCES_DIR%..") do set "APP_DIR=%%~fI"
set "ELECTRON=%APP_DIR%\Agent Hub.exe"
if not exist "%ELECTRON%" (
  echo Unable to locate Agent Hub.exe next to "%RESOURCES_DIR%" 1>&2
  exit /b 1
)
set "ELECTRON_RUN_AS_NODE=1"
"%ELECTRON%" "%RESOURCES_DIR%\app.asar.unpacked\out\cli\index.js" %*
```

- [ ] **Step 4: Wire launchers into electron-builder**

In `config/electron-builder.config.cjs`, change extra resources to ship the new launchers:

```js
{
  from: 'resources/darwin/bin/agent-hub',
  to: 'bin/agent-hub'
}
```

```js
{
  from: 'resources/linux/bin/agent-hub',
  to: 'bin/agent-hub'
}
```

```js
{
  from: 'resources/win32/bin/agent-hub.cmd',
  to: 'bin/agent-hub.cmd'
}
```

Keep the old `orca` launchers for one RC only if tests prove existing automation still needs them.

- [ ] **Step 5: Update CLI verification**

Extend `config/scripts/verify-cli-bin.mjs` to require `agent-hub` in package bins and packaged resources. Keep `orca` as a warning, not the primary success condition.

- [ ] **Step 6: Run CLI verification**

```bash
pnpm run build:cli
pnpm run verify:cli-bin
pnpm run test -- config/scripts/verify-cli-bin.test.mjs
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add package.json resources/darwin/bin/agent-hub resources/win32/bin/agent-hub.cmd resources/linux/bin/agent-hub config/electron-builder.config.cjs config/scripts/verify-cli-bin.mjs config/scripts/verify-cli-bin.test.mjs
git commit -m "build: add agent hub cli launchers"
```

## Task 5: Complete Legal Attribution

**Files:**
- Create: `NOTICE.md`
- Modify: `README.md`
- Modify: `docs/reference/t3code-ui-donor-attribution.md`
- Create: `docs/release/license-attribution-audit.md`

- [ ] **Step 1: Audit upstream licenses**

Run:

```bash
sed -n '1,220p' LICENSE
sed -n '1,220p' ../t3code/LICENSE
```

Expected:

- Orca license is MIT.
- T3 Code donor license is compatible with the way code/assets were used.

If T3 Code license is not compatible with copied code/assets, remove copied donor code/assets and keep only implementation ideas plus attribution.

- [ ] **Step 2: Create notice file**

Create `NOTICE.md`:

```markdown
# Notices

Agent Hub is a fork of Orca, originally published by StablyAI/Lovecast Inc.
Orca is licensed under the MIT License. The original Orca license text is
preserved in `LICENSE`.

This project also used T3 Code as a UI and interaction reference. T3 Code's
license and copyright notices remain with any copied or adapted code, assets,
or documentation. When implementation was inspired by T3 Code without copying
source, the project records that donor role in
`docs/reference/t3code-ui-donor-attribution.md`.

No upstream trademarks are claimed by this fork. Orca and T3 Code names remain
the property of their respective owners.
```

- [ ] **Step 3: Create license audit doc**

Create `docs/release/license-attribution-audit.md`:

```markdown
# License And Attribution Audit

## Orca

- Source: `https://github.com/stablyai/orca`
- Local license file: `LICENSE`
- License: MIT
- Required action: keep MIT license text and preserve original copyright notice.

## T3 Code

- Source: `https://github.com/pingdotgg/t3code`
- Local license file checked: `../t3code/LICENSE`
- Required action: keep license text for copied source/assets, or remove copied
  material if the license does not permit this public distribution.

## Fork Identity

- Public product name: Agent Hub
- Upstream attribution: kept in `NOTICE.md`
- Upstream release feed: not used
- Upstream app id: not used

## Release Blockers

- Public release is blocked if copied T3 Code material exists and its license is
  incompatible with redistribution.
- Public release is blocked if updater URLs point at `stablyai/orca`.
- Public release is blocked if package artifacts use upstream-only identity.
```

- [ ] **Step 4: Update README attribution**

Add this section near the license section in `README.md`:

```markdown
## Attribution

Agent Hub is a public fork of Orca with a GUI-first agent workspace. Orca's
original MIT license is preserved in `LICENSE`. T3 Code was used as a UI and
interaction reference; see `NOTICE.md` and
`docs/reference/t3code-ui-donor-attribution.md`.
```

- [ ] **Step 5: Verify no incompatible attribution gaps**

```bash
rg -n "t3code|T3 Code|stablyai/orca|onorca|Orca" NOTICE.md README.md docs/reference/t3code-ui-donor-attribution.md docs/release/license-attribution-audit.md
```

Expected: references are attribution or migration documentation, not active public release URLs.

- [ ] **Step 6: Commit**

```bash
git add NOTICE.md README.md docs/reference/t3code-ui-donor-attribution.md docs/release/license-attribution-audit.md
git commit -m "docs: add fork attribution and license audit"
```

## Task 6: Refresh Public README And Install Docs

**Files:**
- Modify: `README.md`
- Create: `docs/release/rc-rollout.md`
- Create: `docs/release/stable-rollout.md`

- [ ] **Step 1: Replace upstream install links**

In `README.md`, replace public release links with:

```markdown
- macOS Apple Silicon: `https://github.com/jakedom/agent-hub/releases/latest/download/agent-hub-macos-arm64.dmg`
- macOS Intel: `https://github.com/jakedom/agent-hub/releases/latest/download/agent-hub-macos-x64.dmg`
- Windows: `https://github.com/jakedom/agent-hub/releases/latest/download/agent-hub-windows-setup.exe`
- Linux AppImage: `https://github.com/jakedom/agent-hub/releases/latest/download/agent-hub-linux.AppImage`
```

- [ ] **Step 2: Document the RC rollout**

Create `docs/release/rc-rollout.md`:

```markdown
# RC Rollout

## Build

Run the release workflow with:

- kind: `rc`
- ref: `feature/t3code-gui-workspace`
- dry_run: `false`

## Validate

- Download macOS arm64 DMG from the GitHub RC release.
- Install into `/Applications`.
- Launch once from Finder.
- Confirm Gatekeeper accepts the notarized build.
- Confirm the app opens into the GUI-first workspace.
- Confirm in-app update can see the next RC after a second RC is cut.

## Promote

Promote to stable only after the manual QA checklist in
`docs/release/manual-qa-gui-first.md` is complete.
```

- [ ] **Step 3: Document the stable rollout**

Create `docs/release/stable-rollout.md`:

```markdown
# Stable Rollout

## Preconditions

- Latest RC passed manual QA.
- Latest RC update flow passed.
- `pnpm run typecheck` passed.
- `pnpm run lint` passed.
- `pnpm run test` passed.
- `pnpm run test:e2e` passed.
- Required release assets were verified for the RC tag.

## Build

Run the release workflow with:

- kind: `patch`
- ref: `feature/t3code-gui-workspace`
- dry_run: `false`

## Publish

- Verify GitHub Release assets.
- Verify the release is not a draft.
- Download and install macOS arm64 artifact.
- Download and install Windows artifact on a Windows host.
- Download and run Linux AppImage on an Ubuntu host.
```

- [ ] **Step 4: Commit**

```bash
git add README.md docs/release/rc-rollout.md docs/release/stable-rollout.md
git commit -m "docs: update public install and rollout docs"
```

## Task 7: Update Required Release Asset Verification

**Files:**
- Modify: `config/scripts/verify-release-required-assets.mjs`
- Modify: `config/scripts/verify-release-required-assets.test.mjs`

- [ ] **Step 1: Update required asset names**

Change `getRequiredReleaseAssetNames(tag)` in `config/scripts/verify-release-required-assets.mjs` to return names for Agent Hub:

```js
export function getRequiredReleaseAssetNames(tag) {
  const version = tag.replace(/^v/i, '')
  return [
    'latest-linux.yml',
    'latest-mac.yml',
    'latest.yml',
    'agent-hub-linux.AppImage',
    `agent-hub_${version}_amd64.deb`,
    `agent-hub-${version}.x86_64.rpm`,
    'agent-hub-windows-setup.exe',
    'agent-hub-windows-setup.exe.blockmap',
    `Agent Hub-${version}-mac.zip`,
    `Agent Hub-${version}-mac.zip.blockmap`,
    `Agent Hub-${version}-arm64-mac.zip`,
    `Agent Hub-${version}-arm64-mac.zip.blockmap`,
    'agent-hub-macos-x64.dmg',
    'agent-hub-macos-x64.dmg.blockmap',
    'agent-hub-macos-arm64.dmg',
    'agent-hub-macos-arm64.dmg.blockmap'
  ]
}
```

- [ ] **Step 2: Update default repo**

Change:

```js
const repo = process.env.GITHUB_REPOSITORY || 'jakedom/agent-hub'
```

- [ ] **Step 3: Update tests**

Update `config/scripts/verify-release-required-assets.test.mjs` so the expected asset list matches the Agent Hub names above.

- [ ] **Step 4: Run tests**

```bash
pnpm run test -- config/scripts/verify-release-required-assets.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add config/scripts/verify-release-required-assets.mjs config/scripts/verify-release-required-assets.test.mjs
git commit -m "build: verify agent hub release assets"
```

## Task 8: Rewire Release CI For The Fork

**Files:**
- Modify: `.github/workflows/release-cut.yml`
- Modify: `.github/workflows/pr.yml`
- Modify: `.github/workflows/e2e.yml`

- [ ] **Step 1: Change release workflow repository gate**

In `.github/workflows/release-cut.yml`, replace:

```yaml
if: github.repository == 'stablyai/orca'
```

with:

```yaml
if: github.repository == 'jakedom/agent-hub'
```

- [ ] **Step 2: Add identity verification to release workflow**

After dependency setup in `release-cut.yml`, add:

```yaml
      - name: Verify public release identity
        run: pnpm run verify:public-release-identity
```

- [ ] **Step 3: Ensure release assets use fork repo**

In `release-cut.yml`, ensure every call to `verify-release-required-assets.mjs` inherits:

```yaml
env:
  GITHUB_REPOSITORY: jakedom/agent-hub
```

- [ ] **Step 4: Add identity verification to PR workflow**

In `.github/workflows/pr.yml`, add:

```yaml
      - name: Verify public release identity
        run: pnpm run verify:public-release-identity
```

Run this step after install and before build/test steps.

- [ ] **Step 5: Run workflow-adjacent tests**

```bash
pnpm run test -- config/scripts/latest-stable-release.test.mjs config/scripts/release-rc-history.test.mjs config/scripts/publish-complete-draft-releases.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/release-cut.yml .github/workflows/pr.yml .github/workflows/e2e.yml
git commit -m "ci: point release workflow at public fork"
```

## Task 9: Add Manual GUI-First QA Runbook

**Files:**
- Create: `docs/release/manual-qa-gui-first.md`
- Modify: `tests/e2e/onboarding.spec.ts`
- Modify: `tests/e2e/source-control-pr-generation-switch.spec.ts`
- Modify: `tests/e2e/worktree.spec.ts`

- [ ] **Step 1: Create manual QA checklist**

Create `docs/release/manual-qa-gui-first.md`:

```markdown
# GUI-First Manual QA

## Environment

- macOS Apple Silicon host
- Fresh app profile
- At least one GitHub-authenticated repository
- At least one CLI agent installed and authenticated

## First Run

- App launches to onboarding.
- Agent setup is visible without opening a terminal.
- Project setup offers existing folder, clone URL, and new project.
- Skipping optional onboarding still lands in the GUI workspace.

## Workspace

- Existing repository import creates a visible workspace.
- New worktree creation starts from the GUI composer.
- Active workspace switch updates immediately.
- Terminal debug surface is available from the GUI.
- Sleeping workspace can be reopened without losing context.

## Agent Flow

- Prompt composer starts an agent.
- Agent status changes are visible in the GUI.
- User follow-up can be sent without typing into raw terminal output.
- Raw terminal output can still be inspected.

## Source Control

- Modified files appear in Source Control.
- Commit message generation survives Source Control remount.
- PR description generation survives worktree switch and remount.
- Commit action works on a test repo.
- PR creation opens the expected hosted review path.

## Settings

- Account settings show installed/authenticated providers.
- Display name setting handles IME input.
- Privacy/telemetry controls are visible.
- Update check shows a clear status.

## Install/Uninstall

- DMG installs into `/Applications`.
- First launch passes Gatekeeper.
- `brew uninstall --zap` paths match public app identity.
```

- [ ] **Step 2: Ensure E2E backs critical manual flows**

Confirm these tests exist and pass:

```bash
pnpm run test:e2e -- tests/e2e/onboarding.spec.ts tests/e2e/worktree.spec.ts tests/e2e/source-control-pr-generation-switch.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Add missing E2E coverage for terminal debug access**

If no test asserts terminal debug access from GUI workspace, add one to `tests/e2e/worktree.spec.ts`:

```ts
test('opens terminal debug surface from the GUI workspace', async ({ orcaPage }) => {
  await waitForSessionReady(orcaPage)
  await waitForActiveWorktree(orcaPage)
  await orcaPage.getByRole('button', { name: /terminal/i }).first().click()
  await expect(orcaPage.getByRole('textbox', { name: /terminal input/i })).toBeVisible()
})
```

Import `waitForSessionReady` and `waitForActiveWorktree` from `./helpers/store` if the file does not already import them.

- [ ] **Step 4: Run targeted E2E**

```bash
pnpm run test:e2e -- tests/e2e/worktree.spec.ts tests/e2e/onboarding.spec.ts tests/e2e/source-control-pr-generation-switch.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/release/manual-qa-gui-first.md tests/e2e/onboarding.spec.ts tests/e2e/source-control-pr-generation-switch.spec.ts tests/e2e/worktree.spec.ts
git commit -m "test: cover gui first release qa paths"
```

## Task 10: Run The Full Automated Quality Gate

**Files:**
- No source changes expected unless a gate exposes a defect.

- [x] **Step 1: Install from lockfile**

```bash
pnpm install --frozen-lockfile
```

Expected: install completes without lockfile changes.

- [x] **Step 2: Run static gates**

```bash
pnpm run typecheck
pnpm run lint
git diff --check
```

Expected: all pass.

- [x] **Step 3: Run unit tests**

```bash
pnpm run test
```

Expected: all tests pass.

- [x] **Step 4: Run full Electron E2E**

```bash
pnpm run test:e2e
```

Expected: all required tests pass. Tests marked skipped by explicit runtime capability checks can remain skipped.

- [x] **Step 5: Run terminal release evidence**

```bash
pnpm run test:e2e:terminal-rendering-release-evidence
pnpm run test:e2e:terminal-perf:scale:report
```

Expected: all pass and perf report stays within configured budgets.

- [x] **Step 6: Commit only if fixes were required**

```bash
git status --short
```

If files changed while fixing gates:

```bash
git add -A :/ ':!dist' ':!out' ':!test-results'
git commit -m "fix: pass full release quality gate"
```

**Task 10 evidence:**
- `pnpm install --frozen-lockfile` passed.
- `pnpm run typecheck` passed.
- `pnpm run lint` passed, including switch exhaustiveness, styled-scrollbar, localization catalog, and localization coverage checks.
- `git diff --check` passed.
- `pnpm run test` passed earlier in this task with `1705 passed | 2 skipped` and `17013 passed | 13 skipped`. A later full parallel rerun was stopped after machine saturation produced unrelated timeout-shaped failures; the exact failed set was rerun serially with `pnpm exec vitest run --config config/vitest.config.ts --maxWorkers=1 ...` and passed `16 passed`, `519 passed`.
- Focused regression bundle passed: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/settings/RepositoryPaneDraftInput.test.tsx config/scripts/check-terminal-perf-report-budgets.test.mjs config/scripts/run-terminal-scale-perf-report-gate.test.mjs config/scripts/package-electron-runtime-contract.test.mjs` passed `4 passed`, `29 passed`.
- `pnpm run test:e2e` passed with the release-local single-worker script: `178 passed`, `7 skipped`.
- `pnpm run test:e2e:terminal-rendering-release-evidence` passed: `4 passed`, `1 skipped`.
- `pnpm run test:e2e:terminal-perf:scale:report` passed; saved `test-results/terminal-scale-perf-report.json` and budget check passed for `15` annotation rows.

## Task 11: Validate Local Packaging

**Files:**
- Create: `docs/release/packaged-artifact-smoke.md`
- Create: `config/scripts/verify-packaged-release-artifacts.mjs`
- Create: `config/scripts/verify-packaged-release-artifacts.test.mjs`
- Modify: `package.json`

- [x] **Step 1: Add packaged artifact smoke doc**

Create `docs/release/packaged-artifact-smoke.md`:

````markdown
# Packaged Artifact Smoke

## macOS Ad-Hoc Build

Run:

```bash
pnpm run build:mac
```

Check:

- `dist/mac-arm64/Agent Hub.app` exists on Apple Silicon.
- `dist/agent-hub-macos-arm64.dmg` exists.
- `dist/latest-mac.yml` exists.
- The app opens from Finder.
- The CLI launcher exists in packaged resources.

## macOS Release Build

Run only with signing credentials:

```bash
pnpm run build:mac:release
```

Check:

- `codesign --verify --deep --strict "dist/mac-arm64/Agent Hub.app"` passes.
- `spctl --assess --type execute --verbose "dist/mac-arm64/Agent Hub.app"` passes.
- DMG opens and installs into `/Applications`.
````

- [x] **Step 2: Add artifact verifier script**

Create `config/scripts/verify-packaged-release-artifacts.mjs`:

```js
#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export function verifyPackagedArtifacts(baseDir = 'dist') {
  const required = [
    'agent-hub-macos-arm64.dmg',
    'agent-hub-macos-x64.dmg',
    'agent-hub-linux.AppImage',
    'agent-hub-windows-setup.exe',
    'latest-mac.yml',
    'latest-linux.yml',
    'latest.yml'
  ]
  return required.filter((name) => !existsSync(join(baseDir, name)))
}

export function main() {
  const missing = verifyPackagedArtifacts(process.argv[2] ?? 'dist')
  if (missing.length > 0) {
    console.error(`Missing packaged artifacts: ${missing.join(', ')}`)
    process.exit(1)
  }
  console.log('Verified packaged release artifacts')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
```

- [x] **Step 3: Add verifier tests**

Create `config/scripts/verify-packaged-release-artifacts.test.mjs`:

```js
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { verifyPackagedArtifacts } from './verify-packaged-release-artifacts.mjs'

describe('verifyPackagedArtifacts', () => {
  it('reports missing artifacts', () => {
    const dir = join(tmpdir(), `agent-hub-artifacts-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    try {
      writeFileSync(join(dir, 'latest-mac.yml'), '')
      expect(verifyPackagedArtifacts(dir)).toContain('agent-hub-macos-arm64.dmg')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('passes when all required artifacts exist', () => {
    const dir = join(tmpdir(), `agent-hub-artifacts-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    try {
      for (const name of [
        'agent-hub-macos-arm64.dmg',
        'agent-hub-macos-x64.dmg',
        'agent-hub-linux.AppImage',
        'agent-hub-windows-setup.exe',
        'latest-mac.yml',
        'latest-linux.yml',
        'latest.yml'
      ]) {
        writeFileSync(join(dir, name), '')
      }
      expect(verifyPackagedArtifacts(dir)).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
```

- [x] **Step 4: Add package script**

Add to `package.json`:

```json
"verify:packaged-release-artifacts": "node config/scripts/verify-packaged-release-artifacts.mjs"
```

- [x] **Step 5: Run local packaging checks**

```bash
pnpm run test -- config/scripts/verify-packaged-release-artifacts.test.mjs
pnpm run build:mac
```

Expected: tests pass and macOS ad-hoc artifacts are produced.

- [x] **Step 6: Commit**

```bash
git add docs/release/packaged-artifact-smoke.md config/scripts/verify-packaged-release-artifacts.mjs config/scripts/verify-packaged-release-artifacts.test.mjs package.json
git commit -m "build: add packaged artifact verification"
```

**Task 11 evidence:**
- Added `docs/release/packaged-artifact-smoke.md` with ad-hoc and signed macOS release smoke checks.
- Added `config/scripts/verify-packaged-release-artifacts.mjs` with strict full-release artifact verification plus `--platform=mac` for local macOS packaging checks.
- Added `config/scripts/verify-packaged-release-artifacts.test.mjs`; `pnpm exec vitest run --config config/vitest.config.ts config/scripts/verify-packaged-release-artifacts.test.mjs` passed `1 passed`, `3 passed`.
- Added `verify:packaged-release-artifacts` and `verify:packaged-release-artifacts:mac`.
- `pnpm run build:mac` completed and produced `dist/agent-hub-macos-arm64.dmg`, `dist/agent-hub-macos-x64.dmg`, `dist/Agent Hub-1.4.72-rc.0-arm64-mac.zip`, `dist/Agent Hub-1.4.72-rc.0-mac.zip`, and `dist/latest-mac.yml`.
- `pnpm run verify:packaged-release-artifacts:mac` passed.
- `test -d 'dist/mac-arm64/Agent Hub.app' && test -x 'dist/mac-arm64/Agent Hub.app/Contents/Resources/bin/agent-hub'` passed.
- `codesign --verify --deep --strict 'dist/mac-arm64/Agent Hub.app'` passed for the local ad-hoc build.

## Task 12: Configure Signing And Notarization

**Files:**
- Modify: `config/scripts/verify-macos-release-env.mjs`
- Modify: `docs/release/packaged-artifact-smoke.md`

- [x] **Step 1: Confirm release signing env names**

Use the existing required env vars:

```text
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
APPLE_TEAM_ID
CSC_LINK
CSC_KEY_PASSWORD
```

- [x] **Step 2: Add local env documentation**

Append to `docs/release/packaged-artifact-smoke.md`:

````markdown
## Required macOS Release Environment

The production macOS release build requires:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`
- `CSC_LINK`
- `CSC_KEY_PASSWORD`

Run:

```bash
node config/scripts/verify-macos-release-env.mjs
```

Expected output when configured:

```text
```

The script prints no output and exits with code 0 when all variables are set.
````

- [x] **Step 3: Run signing env verifier**

```bash
node config/scripts/verify-macos-release-env.mjs
```

Expected with credentials: exit code 0.

Expected without credentials: fails with the exact missing variable names. That failure blocks production release, but local ad-hoc builds still use `pnpm run build:mac`.

- [ ] **Step 4: Run production macOS build once credentials exist**

```bash
pnpm run build:mac:release
```

Expected:

- `ORCA_MAC_RELEASE=1` enables hardened runtime and notarization.
- `electron-builder` signs `Agent Hub.app`.
- `electron-builder` notarizes the macOS app.

- [ ] **Step 5: Verify signed app**

```bash
codesign --verify --deep --strict "dist/mac-arm64/Agent Hub.app"
spctl --assess --type execute --verbose "dist/mac-arm64/Agent Hub.app"
```

Expected: both commands exit 0.

- [x] **Step 6: Commit docs if changed**

```bash
git add docs/release/packaged-artifact-smoke.md config/scripts/verify-macos-release-env.mjs
git commit -m "docs: document macos release signing gate"
```

**Task 12 evidence:**
- Confirmed `config/scripts/verify-macos-release-env.mjs` requires `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK`, and `CSC_KEY_PASSWORD`.
- Documented the required macOS release environment in `docs/release/packaged-artifact-smoke.md`.
- Fixed verifier fallback copy to point local developers at `pnpm run build:mac`.
- `node config/scripts/verify-macos-release-env.mjs` exited `1` locally and printed the exact missing variable names because signing credentials are not configured in this environment.
- `APPLE_ID=a APPLE_APP_SPECIFIC_PASSWORD=b APPLE_TEAM_ID=c CSC_LINK=d CSC_KEY_PASSWORD=e node config/scripts/verify-macos-release-env.mjs` exited `0`.
- `pnpm run build:mac:release`, notarization, and `spctl --assess` remain blocked until real Apple/CSC signing credentials are available.

## Task 13: Validate Updater RC Flow

**Files:**
- Modify: `docs/release/rc-rollout.md`
- Modify: `src/main/updater.test.ts`

- [ ] **Step 1: Create RC 0**

Run GitHub Actions workflow `Cut Release` with:

```text
kind: rc
ref: feature/t3code-gui-workspace
dry_run: false
```

Expected: tag `v1.4.73-rc.0` is created and draft release assets upload.

- [ ] **Step 2: Verify RC 0 assets**

```bash
GH_TOKEN="$GITHUB_TOKEN" GITHUB_REPOSITORY=jakedom/agent-hub node config/scripts/verify-release-required-assets.mjs v1.4.73-rc.0
```

Expected: prints `Verified 16 required release assets for jakedom/agent-hub@v1.4.73-rc.0`.

- [ ] **Step 3: Install RC 0**

Download:

```text
https://github.com/jakedom/agent-hub/releases/download/v1.4.73-rc.0/agent-hub-macos-arm64.dmg
```

Install and launch.

- [ ] **Step 4: Create RC 1**

Run GitHub Actions workflow `Cut Release` again with:

```text
kind: rc
ref: feature/t3code-gui-workspace
dry_run: false
```

Expected: tag `v1.4.73-rc.1` is created.

- [ ] **Step 5: Verify in-app update from RC 0 to RC 1**

From the installed RC 0 app:

- Open Settings.
- Trigger check for updates.
- Confirm RC 1 is detected.
- Download and restart.
- Confirm app version is RC 1.

- [ ] **Step 6: Add updater regression test for fork repo**

In `src/main/updater.test.ts`, add an assertion that update URLs include:

```ts
expect(url).toContain('https://github.com/jakedom/agent-hub/releases')
```

- [ ] **Step 7: Commit test/doc updates**

```bash
git add docs/release/rc-rollout.md src/main/updater.test.ts
git commit -m "test: document and assert fork updater flow"
```

## Task 14: Smoke Test Public User Workflows

**Files:**
- Modify: `docs/release/manual-qa-gui-first.md`

- [ ] **Step 1: Fresh profile launch**

Run:

```bash
rm -rf /tmp/agent-hub-smoke-profile
AGENT_HUB_HOME=/tmp/agent-hub-smoke-profile pnpm run dev
```

Expected:

- App launches.
- Onboarding appears.
- GUI-first project setup is visible.

- [ ] **Step 2: Existing repository workflow**

Using the app:

- Add an existing local repository.
- Create a worktree from the GUI composer.
- Switch between primary and child workspace.
- Open Source Control.
- Generate commit message.

Expected: no raw terminal interaction is needed.

- [ ] **Step 3: Packaged app workflow**

Using the packaged macOS app:

- Import the same local repository.
- Create one worktree.
- Start one CLI agent.
- Inspect terminal debug output.
- Stop the agent.
- Commit a test file.

Expected: workflow completes without dev-server dependencies.

- [ ] **Step 4: Record the result**

Append to `docs/release/manual-qa-gui-first.md`:

```markdown
## Latest Smoke Result

- Date: 2026-06-16
- Build: local packaged macOS
- Result: PASS
- Notes: GUI-first worktree, source control, and terminal debug paths completed.
```

- [ ] **Step 5: Commit**

```bash
git add docs/release/manual-qa-gui-first.md
git commit -m "docs: record gui first smoke result"
```

## Task 15: Cut Stable Release

**Files:**
- Modify: `docs/release/stable-rollout.md`

- [ ] **Step 1: Confirm all gates**

Run:

```bash
pnpm run verify:public-release-identity
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run test:e2e:terminal-rendering-release-evidence
pnpm run test:e2e:terminal-perf:scale:report
git status --short
```

Expected:

- All commands pass.
- `git status --short` is empty.

- [ ] **Step 2: Trigger stable release workflow**

Run GitHub Actions workflow `Cut Release` with:

```text
kind: patch
ref: feature/t3code-gui-workspace
dry_run: false
```

Expected: stable tag `v1.4.73` is created.

- [ ] **Step 3: Verify stable release assets**

```bash
GH_TOKEN="$GITHUB_TOKEN" GITHUB_REPOSITORY=jakedom/agent-hub node config/scripts/verify-release-required-assets.mjs v1.4.73
```

Expected: required release assets pass.

- [ ] **Step 4: Install stable**

Download and install:

```text
https://github.com/jakedom/agent-hub/releases/latest/download/agent-hub-macos-arm64.dmg
```

Expected:

- Gatekeeper accepts app.
- GUI-first workspace launches.
- Settings version matches `v1.4.73`.

- [ ] **Step 5: Commit stable notes**

Append to `docs/release/stable-rollout.md`:

```markdown
## Latest Stable Release Verification

- Date: 2026-06-16
- Tag: v1.4.73
- Required assets: PASS
- macOS install smoke: PASS
- Update feed: PASS
```

Then commit:

```bash
git add docs/release/stable-rollout.md
git commit -m "docs: record stable release verification"
```

## Task 16: Post-Launch Operations

**Files:**
- Create: `docs/release/post-launch-ops.md`
- Modify: `README.md`

- [ ] **Step 1: Create post-launch ops doc**

Create `docs/release/post-launch-ops.md`:

```markdown
# Post-Launch Operations

## First 24 Hours

- Watch GitHub issues for install failures.
- Watch update failures in release comments.
- Verify download links every 4 hours.
- Keep the previous stable release available.

## First Week

- Cut patch releases for installer, updater, or first-run blockers.
- Keep GUI-first regressions higher priority than cosmetic cleanup.
- Add E2E tests for every reproduced public bug.

## Rollback

- Leave the broken release published if users already installed it, unless the
  artifact is unsafe.
- Cut a new patch release with a higher semver.
- Do not repoint `latest` to an older version because electron-updater compares
  semver and users on the broken version need a newer fixed version.
```

- [ ] **Step 2: Add support links to README**

Add:

```markdown
## Support

Open bugs and release issues at
`https://github.com/jakedom/agent-hub/issues`.

Include:

- app version
- operating system
- install method
- whether the issue happens in a fresh profile
```

- [ ] **Step 3: Commit**

```bash
git add docs/release/post-launch-ops.md README.md
git commit -m "docs: add post launch operations"
```

---

## Final Verification Gate

Run this from a clean checkout after all tasks:

```bash
pnpm install --frozen-lockfile
pnpm run verify:public-release-identity
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run test:e2e:terminal-rendering-release-evidence
pnpm run test:e2e:terminal-perf:scale:report
pnpm run build:mac
git diff --check
git status --short
```

Expected:

- All commands pass.
- `git status --short` is empty.
- `dist/` contains macOS artifacts for local validation.

## Self-Review

### Spec Coverage

- GUI-first project continuation: covered by Tasks 9, 10, 14.
- Public release identity: covered by Tasks 2, 3, 4, 8.
- Legal and attribution: covered by Task 5.
- Installer/package readiness: covered by Tasks 7, 11, 12.
- Updater ownership and release flow: covered by Tasks 3, 8, 13, 15.
- Public docs and support: covered by Tasks 6, 16.
- Verification: covered by Tasks 10, 11, 15 and Final Verification Gate.

### Placeholder Scan

The plan avoids open-ended implementation placeholders. Values default to Agent Hub identity, `jakedom/agent-hub` release ownership, and explicit script/test/doc paths.

### Type And Name Consistency

The public product name is `Agent Hub`, product slug is `agent-hub`, app id is `com.jakedom.agenthub`, release repository is `jakedom/agent-hub`, and the primary CLI bin is `agent-hub` throughout this plan.
