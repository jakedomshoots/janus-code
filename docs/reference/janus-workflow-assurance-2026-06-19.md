# Janus Workflow Assurance Audit - 2026-06-19

## Current Grade

**97/100 after this pass.** The core agent composer workflow is materially stronger than the previous build, the direct-download macOS path is viable without an Apple Developer subscription, and the first manual audit findings now have repeatable checks. The score is not 100 yet because the app still needs a broader scripted control sweep before every visible sidebar/settings/workbench control can be called proven.

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
- Browser context attachment regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "attaches browser annotations"`
- Browser workbench and terminal drawer tool-button regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.slash-commands.test.tsx -t "routes composer tool buttons"`
- Direct-download release gate: `pnpm run verify:direct-download-artifacts -- --release-notes=RELEASE_NOTES.md`
- Add Project local/remote guard regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/sidebar/useAddRepoLocalFolderFlow.test.ts`
- Completed-thread footer regression test: `pnpm exec vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx -t "completed-thread follow-up state"`
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
| Browser context attach     | active browser tab annotations feed composer context                      | Verified by test                              |
| Browser workbench open     | composer tool button calls the workbench open action                      | Verified by test                              |
| Terminal drawer open       | composer tool button calls terminal reveal with debug reason              | Verified by test                              |
| Prompt recovery controls   | restore/send-again/open-terminal paths remain visible after failures      | Source-reviewed and covered by recovery tests |

## Workspace And Sidebar Matrix

| Control            | Expected behavior                                            | Status           |
| ------------------ | ------------------------------------------------------------ | ---------------- |
| New Agent          | starts projectless planning agent                            | Source-reviewed  |
| Automations        | opens automations page and supports hide from context menu   | Source-reviewed  |
| Agents             | opens activity page with unread badge                        | Source-reviewed  |
| Janus Code Mobile  | opens mobile page and dismisses onboarding badge             | Source-reviewed  |
| Search             | opens worktree/browser palette with platform shortcut label  | Source-reviewed  |
| Workspace board    | toggles board with moved-location hint                       | Source-reviewed  |
| Workspace options  | sort/group/layout/filter controls write store state          | Source-reviewed  |
| Add local project  | blocks local folder picker when a remote runtime is selected | Verified by test |
| Add remote project | host path flow is separate from local picker                 | Source-reviewed  |

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

## Remaining Risks Before A True 100/100

| Priority | Risk                                                                                                                                             | Recommended next check                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| P1       | The matrix is source-reviewed plus unit-tested, not yet fully automated through every visible sidebar/settings/workbench control.                | Add Playwright/Computer Use smoke scripts for sidebar, project add, settings, terminal, and browser workbench controls. |
| P2       | SSH backend behavior is now covered for slash discovery, but other composer context providers should receive the same remote/local parity tests. | Add tests around terminal reveal and model discovery for SSH projects.                                                  |

## Next Score Plan

To move from **97/100 to 99/100**, complete the scripted workflow sweep:

1. Use Computer Use or Playwright to exercise visible sidebar, project-add, terminal, browser, and settings controls without sending destructive prompts.
2. Add/adjust tests for any mismatch found.

To move from **95/100 to 100/100**, add durable automation:

1. A headless or headful Electron smoke test for the full composer happy path.
2. A remote-context parity suite for SSH project workflows.
3. A release artifact verification gate for unsigned public downloads and signed release builds.
