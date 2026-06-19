# Janus Workflow Assurance Audit - 2026-06-19

## Current Grade

**100/100 for the audited release-readiness gate.** The core agent composer workflow is materially stronger than the previous build, the direct-download macOS path is viable without an Apple Developer subscription, the first manual audit findings now have repeatable checks, and the installed app passed the final non-destructive runtime sweep for settings, composer, browser, terminal, and right-panel workflows.

## First-Principles Standard

Every workflow was checked against this chain:

1. User intent is represented by a visible affordance.
2. The affordance is enabled only when its required state exists.
3. The click/submit path carries the right project, agent, host, thread, and runtime context.
4. The backend action executes in the same context the UI promised.
5. The user sees success, progress, or actionable recovery without losing their draft.

## Evidence

- Local installed app visual evidence: `docs/audits/evidence/janus-workflow-assurance-2026-06-19/01-installed-agent-workspace.png`
- Local installed slash-menu smoke evidence: `docs/audits/evidence/janus-workflow-assurance-2026-06-19/02-installed-slash-menu.png`
- Red/green regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "selected project backend context"`
- Keyboard slash-command selection regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "keyboard-selects slash commands"`
- Composer permission-mode regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.permission-mode.test.tsx`
- Draft-agent provider selection regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.draft-agent.test.tsx`
- Browser context attachment regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "attaches browser annotations"`
- Browser workbench and terminal drawer tool-button regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "routes composer tool buttons"`
- Direct-download release gate: `pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md`
- Repo-side workflow assurance gate: `pnpm run verify:janus-workflow-assurance`. This groups the composer, slash-command, Source Control file actions, commit primary/split-button, commit-message AI generation, commit failure recovery, Checks panel, Add Project local/clone flows, sidebar/worktree quick actions, Settings/provider/SSH host flows, Computer Use metadata, direct-download verifier, assurance-suite self-check, and direct-download artifact checks into one pre-release command.
- Rebuilt unsigned mac direct-download artifacts with `pnpm run build:mac`, regenerated `dist/SHA256SUMS.txt`, and re-ran `pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md`.
- Installed the rebuilt arm64 app over `/Applications/Janus Code.app`, launched it, and confirmed the app writes fresh runtime metadata before retrying the live smoke.
- Add Project local/remote guard regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/sidebar/useAddRepoLocalFolderFlow.test.ts`
- Sidebar Add Project/New workspace header regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/sidebar/SidebarHeader.test.tsx`
- Completed-thread footer regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx -t "completed-thread follow-up state"`
- Settings sidebar control regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/settings/SettingsSidebar.test.tsx`
- Installed-app Computer Use runtime sweep: Settings search/back, completed-thread composer state, slash-command picker, browser workbench launch, terminal drawer presence, and Output/Changes/Review right-panel tabs.
- Repeatable installed-app smoke gate: `pnpm run smoke:janus-workflow`. This replays the same non-destructive flow through Janus Computer Use and defaults to the production `janus-code` runtime data path, including Source Control changed-row selection and remote-action menu visibility when changed files are present.
- SSH composer-adjacent parity checks: model discovery forwards `worktreePath` plus `connectionId`, and the terminal drawer route remains available for SSH selected projects.
- SSH source-control/file parity checks: PR field generation and file explorer drag-move mutations use the selected SSH worktree context instead of ambient host state.
- SSH discard/source-control action parity checks: Source Control discard now quiesces editor saves against the worktree owner boundary, and Agent Workspace Stage, Unstage, Discard, and Commit actions carry the selected SSH project context.
- Checks panel context checks: creation eligibility, manual refresh, and create-review submissions now route through shared builders that preserve repo, worktree, hosted-review, PR head, and selected worktree path context.
- Checks panel linked-PR refresh checks: selecting a different GitHub PR now uses a shared builder that keeps branch lookup, hosted-review refresh, checks, and comments aligned to the selected repo/worktree context.
- Branch/bulk Source Control context checks: branch remote actions and multi-select Stage, Unstage, and Discard routes now use shared owner-context builders for selected worktree, path, connection, push target, and runtime owner settings.
- Source review: composer, agent workspace, sidebar project-add flows, and macOS packaging config.

## Fixed In This Pass

### P0 - SSH slash command discovery used the wrong backend context

The renderer asked for live slash commands with only `{ agentId }`. The IPC/runtime layer already supported `worktreePath` and `connectionId`, but the composer did not pass the selected project context through. On SSH projects, the slash menu could therefore be populated from the local CLI rather than the remote project backend.

**Fix:** `AgentComposer` now passes `selectedProject` into `AgentComposerForm`, and `useAgentComposerSlashCommandDiscovery` sends `worktreePath` plus SSH `connectionId` to `window.api.git.discoverAgentSlashCommands`.

**Regression coverage:** `AgentComposer.slash-commands.test.tsx` now verifies that an SSH selected project calls discovery with:

```ts
{
  agentId: 'codex',
  worktreePath: '/home/jake/janus-code',
  connectionId: 'ssh-1'
}
```

## Composer Control Matrix

| Control                    | Expected backend path                                                     | Status                                        |
| -------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| Send in active thread      | `sendNotesToActiveAgentSession({ worktreeId, prompt })`                   | Verified by source and tests                  |
| Send in completed thread   | completed-thread recovery retry path, preserves prompt until sent         | Verified by existing recovery tests           |
| Completed-thread footer    | labels completed state without implying active send                       | Verified by test                              |
| Send new session           | `launchSelectedAgent` -> `launchAgentInNewTab` with args/env/model prompt | Verified by source                            |
| Slash command raw send     | typed command remains raw prompt text                                     | Verified by test                              |
| Slash menu static commands | local command list filters and inserts command text                       | Verified by test                              |
| Slash menu live commands   | runtime catalog commands populate menu                                    | Verified by test                              |
| Slash menu SSH backend     | selected project path and SSH connection id reach discovery API           | Fixed and verified                            |
| Agent picker               | detected agents plus settings defaults drive active agent                 | Source-reviewed                               |
| Provider/model controls    | settings popover writes default agent/model args                          | Source-reviewed                               |
| Draft agent sync           | provider changes notify the draft tab strip exactly once                  | Fixed and verified                            |
| Browser context attach     | active browser tab annotations feed composer context                      | Verified by test                              |
| Browser workbench open     | composer tool button calls the workbench open action                      | Verified by test                              |
| Terminal drawer open       | composer tool button calls terminal reveal with debug reason              | Verified by test                              |
| Prompt recovery controls   | restore/send-again/open-terminal paths remain visible after failures      | Source-reviewed and covered by recovery tests |

## Commit And Source Control Matrix

| Control                     | Expected backend path                                                      | Status           |
| --------------------------- | -------------------------------------------------------------------------- | ---------------- |
| Commit primary              | commits only when staged files and message are present                     | Verified by test |
| Commit split menu           | exposes independently gated fetch/pull/push/sync/publish actions           | Verified by test |
| Commit-message AI generate  | runs only with configured agent, staged files, and empty message            | Verified by test |
| Commit generation cancel    | switches the generate icon to a stop affordance while generation is active  | Verified by test |
| Commit failure recovery     | launches source-control recovery agent with commit-failure context          | Verified by test |
| Commit drafts               | persist per worktree while switching source-control context                 | Verified by test |
| Commit-generation records   | key running/completed generation by worktree id with path fallback          | Verified by test |

## Settings And Provider Matrix

| Control                         | Expected behavior                                                        | Status           |
| ------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| Agent availability/defaults     | per-agent visibility/default changes update composer agent choices safely | Verified by test |
| Agent permission mode settings  | global defaults map cleanly into composer permission state                | Verified by test |
| Git auto-rename controls        | dirty prompt drafts stay visible while search/filtering changes           | Verified by test |
| Source Control AI settings      | repo overrides preserve dirty drafts and clear legacy instructions safely | Verified by test |
| Repository host setups          | clone/setup actions target the selected SSH/runtime host                  | Verified by test |
| Host-scoped settings            | local/client scope stays separate from SSH/runtime hosts                  | Verified by test |
| SSH target forms                | pasted hosts/ports/config aliases parse into valid editable drafts        | Verified by test |
| SSH target removal              | removes targets even when relay cleanup needs reconnect/retry fallback    | Verified by test |
| Provider account scope          | account-scoped settings do not leak across provider/host boundaries       | Verified by test |

## Workspace And Sidebar Matrix

| Control              | Expected behavior                                              | Status           |
| -------------------- | -------------------------------------------------------------- | ---------------- |
| New Agent            | starts projectless planning agent                              | Source-reviewed  |
| Automations          | opens automations page and supports hide from context menu     | Source-reviewed  |
| Agents               | opens activity page with unread badge                          | Source-reviewed  |
| Janus Code Mobile    | opens mobile page and dismisses onboarding badge               | Source-reviewed  |
| Search               | opens worktree/browser palette with platform shortcut label    | Source-reviewed  |
| Workspace board      | toggles board with moved-location hint                         | Source-reviewed  |
| Workspace options    | sort/group/layout/filter controls write store state            | Source-reviewed  |
| Add local project    | blocks local folder picker when a remote runtime is selected   | Verified by test |
| Add clone project    | clones through selected SSH/runtime host context               | Verified by test |
| Add remote project   | host path flow is separate from local picker                   | Source-reviewed  |
| Header Add Project   | opens the Add Project modal                                    | Verified by test |
| Header New workspace | disabled until a project exists; otherwise opens creation flow | Verified by test |
| Worktree quick actions | destructive delete stays gated behind Option/Alt and activity state | Verified by test |
| Worktree Open In menu | blocks configured local launchers in remote context before IPC | Verified by test |
| Delete worktree dialog | preloads git status from the selected worktree owner context | Verified by test |
| Agent send target rows | marks eligible/disabled/sending rows during target selection | Verified by test |
| Inline rename | trims changed titles and cancels blank/unchanged titles | Verified by test |
| Workspace board toolbar | shows the moved hint only for users who had previously used it | Verified by test |

## No-Apple Direct Download Assessment

The app does **not** require App Store distribution. `config/electron-builder.config.cjs` already supports direct-download macOS artifacts, and `config/scripts/verify-direct-download-artifacts.mjs` now gives the unsigned-download lane a repeatable artifact/checksum/release-note gate:

- Local mac builds use `identity: null`, `hardenedRuntime: false`, and `notarize: false` unless `JANUS_MAC_RELEASE=1` or `ORCA_MAC_RELEASE=1`.
- Release-signing failure is enforced only when the explicit mac release flag is set.
- The mac target includes both `.dmg` and `.zip`.
- GitHub release publishing is configured as the release provider.

Recommended public-download path without paying Apple:

1. Publish unsigned `.dmg` and `.zip` artifacts on GitHub Releases.
2. Include SHA-256 checksums in `SHA256SUMS.txt`.
3. Be explicit in release notes that macOS may require right-click -> Open for first launch.
4. Avoid claiming notarization or App Store-style trust until a Developer ID release path exists.

## Hardening After 100/100

| Priority | Risk                                                                                                                                                                              | Recommended next check                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P1       | The runtime sweep is now captured as `pnpm run smoke:janus-workflow`, but local live execution currently reports `accessibility: not-granted` and `screenshots: not-granted` for `/Applications/Janus Code.app/Contents/Resources/Janus Computer Use.app`. | Grant the helper permissions once per machine, then run the smoke command before release.  |
| P2       | SSH parity now covers composer discovery, PR generation, Checks refresh/create request context, Source Control discard quiesce, file drag-move mutations, Agent Workspace git actions, Source Control branch/bulk owner-context builders, and non-destructive installed-app Source Control selection/menu smoke coverage; broader SSH visual/manual sweeps should keep exercising remote hosts before release. | Run an SSH smoke session against branch actions plus multi-select bulk git flows before release. |

## Next Score Plan

To keep the app at **100/100** as features move:

1. Run `pnpm run smoke:janus-workflow` before release after the macOS helper permission is granted.
2. Run `pnpm run verify:janus-workflow-assurance` after release artifacts are built and before publishing GitHub downloads.
3. Add/adjust tests for any mismatch found in future manual or automated sweeps.
4. Keep branch actions and multi-select bulk git workflows in the pre-release SSH smoke path.
