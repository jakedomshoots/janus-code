# Janus Code Public Rebrand Implementation Plan

> **Execution note:** User requested no subagents for this project. Implement this plan directly in the main session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand public product identity to Janus Code with `janus` as the primary CLI while preserving legacy Orca compatibility where needed.

**Architecture:** Treat public identity as a release/docs/UI layer change, not a destructive internal migration. Keep persisted keys, compatibility aliases, and legal attribution stable unless tests prove they can move safely.

**Tech Stack:** Electron, React, TypeScript, pnpm, Vitest, GitHub Actions, electron-builder.

---

## Task 1: Release Identity And Package Metadata

**Files:**
- Modify: `package.json`
- Modify: `config/public-release-identity.json`
- Modify: `config/electron-builder.config.cjs`
- Modify: `.github/workflows/release-cut.yml`
- Modify: `.github/workflows/homebrew-bump.yml`
- Modify: `config/scripts/create-draft-release.mjs`
- Modify: `config/scripts/create-draft-release.test.mjs`
- Modify: `config/scripts/latest-stable-release.mjs`
- Modify: `config/scripts/latest-stable-release.test.mjs`
- Modify: `config/scripts/publish-complete-draft-releases.mjs`
- Modify: `config/scripts/publish-complete-draft-releases.test.mjs`
- Modify: `config/scripts/verify-release-required-assets.mjs`
- Modify: `config/scripts/verify-release-required-assets.test.mjs`
- Modify: `config/scripts/verify-public-release-identity.test.mjs`

- [x] **Step 1: Change package metadata**

Set package identity to:

```json
{
  "name": "janus-code",
  "description": "Janus Code is a GUI-first desktop workspace for CLI coding agents",
  "homepage": "https://github.com/jakedomshoots/janus-code",
  "bin": {
    "janus": "./out/cli/index.js",
    "janus-dev": "./config/scripts/orca-dev.mjs",
    "agent-hub": "./out/cli/index.js",
    "orca": "./out/cli/index.js"
  }
}
```

Keep `agent-hub` and `orca` as compatibility aliases for now.

- [x] **Step 2: Retarget release owner and artifact names**

Replace public release repo defaults with `jakedomshoots/janus-code`. Rename release artifact expectations from `agent-hub-*` to `janus-code-*` where those filenames are produced by electron-builder or release scripts.

- [x] **Step 3: Run release identity tests**

```bash
pnpm exec vitest run --config config/vitest.config.ts \
  config/scripts/verify-public-release-identity.test.mjs \
  config/scripts/verify-release-required-assets.test.mjs \
  config/scripts/create-draft-release.test.mjs \
  config/scripts/publish-complete-draft-releases.test.mjs \
  config/scripts/latest-stable-release.test.mjs
pnpm run verify:public-release-identity
```

Expected: all pass.

- [x] **Step 4: Commit**

```bash
git add package.json config/public-release-identity.json config/electron-builder.config.cjs .github/workflows/release-cut.yml .github/workflows/homebrew-bump.yml config/scripts/create-draft-release.mjs config/scripts/create-draft-release.test.mjs config/scripts/latest-stable-release.mjs config/scripts/latest-stable-release.test.mjs config/scripts/publish-complete-draft-releases.mjs config/scripts/publish-complete-draft-releases.test.mjs config/scripts/verify-release-required-assets.mjs config/scripts/verify-release-required-assets.test.mjs config/scripts/verify-public-release-identity.test.mjs
git commit -m "chore: rebrand release identity to janus code"
```

## Task 2: Updater, Casks, And Public Install Docs

**Files:**
- Modify: `src/main/updater.ts`
- Modify: `src/main/updater.test.ts`
- Modify: `src/main/updater-prerelease-feed.ts`
- Modify: `src/main/updater-prerelease-feed.test.ts`
- Modify: `src/main/updater-prerelease-feed-readiness.test.ts`
- Modify: `src/main/updater-changelog.ts`
- Modify: `src/main/updater-changelog.test.ts`
- Modify: `src/main/updater-nudge.ts`
- Modify: `src/main/updater-nudge.test.ts`
- Modify: `src/renderer/src/components/settings/GeneralUpdateSettingsSection.tsx`
- Modify: `Casks/agent-hub.rb`
- Modify: `Casks/agent-hub@rc.rb`
- Modify: `docs/release/*.md`
- Modify: `README.md`

- [x] **Step 1: Update updater URLs**

Use `https://github.com/jakedomshoots/janus-code/releases` for all public update, changelog, nudge, and settings release links.

- [x] **Step 2: Update cask and install docs**

Use Janus Code product text and `janus-code-*` artifact names. Keep cask filenames if needed until a separate Homebrew tap rename is ready, but visible cask copy should say Janus Code.

- [x] **Step 3: Run updater tests**

```bash
pnpm exec vitest run --config config/vitest.config.ts \
  src/main/updater.test.ts \
  src/main/updater-prerelease-feed.test.ts \
  src/main/updater-prerelease-feed-readiness.test.ts \
  src/main/updater-changelog.test.ts \
  src/main/updater-nudge.test.ts
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/main/updater.ts src/main/updater.test.ts src/main/updater-prerelease-feed.ts src/main/updater-prerelease-feed.test.ts src/main/updater-prerelease-feed-readiness.test.ts src/main/updater-changelog.ts src/main/updater-changelog.test.ts src/main/updater-nudge.ts src/main/updater-nudge.test.ts src/renderer/src/components/settings/GeneralUpdateSettingsSection.tsx Casks/agent-hub.rb Casks/agent-hub@rc.rb README.md docs/release
git commit -m "chore: rebrand updater and install surfaces"
```

## Task 3: Visible App Copy And CLI Help

**Files:**
- Modify visible `src/main`, `src/renderer/src`, `src/cli`, `src/shared`, `config/scripts`, and `skills` docs that display Orca as the product name.

- [ ] **Step 1: Inventory visible strings**

```bash
rg -n --hidden --glob '!node_modules/**' --glob '!out/**' --glob '!dist/**' --glob '!test-results/**' --glob '!.git/**' "\\bOrca\\b|\\borca\\b|onorca" src config skills README.md docs AGENTS.md NOTICE.md
```

Expected: review results and classify each match as public copy, compatibility key, fixture, or legal attribution.

- [ ] **Step 2: Replace public copy**

Change user-visible `Orca` product references to `Janus Code`. Change documented commands from `orca` to `janus`. Keep code identifiers, persisted keys, and hidden compatibility aliases unchanged.

- [ ] **Step 3: Preserve legal attribution**

Keep `NOTICE.md` attribution to Orca as the upstream MIT project. Update wording so Janus Code is the product and Orca is only upstream attribution.

- [ ] **Step 4: Run focused tests and static checks**

```bash
pnpm run typecheck
pnpm run lint
pnpm exec vitest run --config config/vitest.config.ts src/main/updater.test.ts config/scripts/verify-public-release-identity.test.mjs
git diff --check
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src config skills README.md docs AGENTS.md NOTICE.md
git commit -m "chore: rebrand visible product copy to janus code"
```

## Task 4: Repository Rename And Push

**Files:**
- No source files unless GitHub repo name changes require docs cleanup.

- [ ] **Step 1: Create or rename GitHub repo**

```bash
gh repo create jakedomshoots/janus-code --public --description "Janus Code is a GUI-first desktop workspace for CLI coding agents" --homepage "https://github.com/jakedomshoots/janus-code"
```

If `jakedomshoots/agent-hub` should be renamed instead of creating a new repo, use GitHub settings or `gh api` after confirming no public users depend on the current URL.

- [ ] **Step 2: Add release remote and push**

```bash
git remote remove release 2>/dev/null || true
git remote add release https://github.com/jakedomshoots/janus-code.git
git push release HEAD:main
git push -u release feature/t3code-gui-workspace
```

Expected: both branches push.

- [ ] **Step 3: Dry-run release workflow**

```bash
gh workflow run "Cut Release" --repo jakedomshoots/janus-code --ref main -f kind=rc -f ref=feature/t3code-gui-workspace -F dry_run=true
```

Expected: workflow completes successfully.

- [ ] **Step 4: Commit plan status if updated**

```bash
git add -f docs/superpowers/plans/2026-06-16-janus-code-public-rebrand.md
git commit -m "docs: record janus code rebrand verification"
```

## Self-Review

- Spec coverage: public identity, CLI name, repo owner, compatibility policy, docs, updater, release scripts, and verification are covered.
- Placeholder scan: no task depends on an unnamed command or unspecified file class except Task 3 inventory, which explicitly requires classification before edits.
- Type consistency: `Janus Code`, `janus-code`, `janus`, and `jakedomshoots/janus-code` are used consistently as public identity targets.
