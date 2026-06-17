---
name: janus-cli
description: >-
  Use the public `janus` CLI to operate Janus-managed worktrees/workspaces,
  terminals, repos, automations, worktree comments, and the browser embedded
  inside the Janus Code app. Use when the user says "$janus-cli", "use janus cli",
  "Janus Code worktree/workspace", "child workspace", "spawn codex/claude in a
  workspace", "read/wait/send Janus Code terminal", "terminal send", "Janus Code browser", or "control the
  browser inside Janus Code". Prefer this over raw `git worktree`, ad hoc PTYs,
  Playwright, or Computer Use when the task touches Janus-managed state. Use
  Computer Use for browser windows, webviews, or desktop UI outside Janus Code's
  embedded browser.
---

# Janus Code CLI

Use `janus` when Janus Code's running editor/runtime is the source of truth. On Linux, use `janus` wherever this file says `janus`.

**Dev builds (`pnpm dev`):** after `pnpm build:cli`, the dev CLI is exposed as `janus-dev` (the global shim points at this checkout's wrapper + out/cli). Inside a dev Janus Code's terminals use `janus-dev emulator ...` (or `./config/scripts/janus-dev.mjs emulator ...` for worktree-local invocation that does not depend on the /usr/local/bin symlink). Plain `janus` targets any installed production Janus Code. The app's own agent preambles use `janus-dev` automatically in dev mode.

Use plain shell tools when Janus Code state does not matter.

## Start Here

```bash
command -v janus || command -v janus
janus status --json
janus worktree ps --json
janus terminal list --json
```

If Janus Code is not running, start it:

```bash
janus open --json
janus status --json
```

Prefer `--json` for agent-driven calls. If the CLI is missing, say so explicitly instead of inspecting source files first.

## Worktrees

An Janus Code worktree/workspace is Janus Code's tracked view of a repo checkout, its metadata, terminals, browser tabs, and UI state.

Common commands:

```bash
janus repo list --json
janus repo show --repo id:<repoId> --json
janus repo add --path /abs/repo --json
janus repo set-base-ref --repo id:<repoId> --ref origin/main --json
janus repo search-refs --repo id:<repoId> --query main --limit 10 --json
janus worktree list --repo id:<repoId> --json
janus worktree ps --json
janus worktree current --json
janus worktree show --worktree <selector> --json
janus worktree create --repo id:<repoId> --name related-task --json
janus worktree create --name child-task --agent codex --prompt "hi" --json
janus worktree create --name independent-task --no-parent --json
janus worktree set --worktree id:<worktreeId> --display-name "My Task" --json
janus worktree set --worktree active --comment "reproduced bug; testing fix" --json
janus worktree rm --worktree id:<worktreeId> --force --json
```

Selectors:

- `id:<worktreeId>`, `path:<absolutePath>`, `branch:<branchName>`, `issue:<number>`
- `active` / `current` for the enclosing Janus-managed worktree from the shell cwd

Lineage rules:

- When creating from inside an Janus-managed worktree, Janus Code infers the current workspace as the parent when it can.
- Use `--parent-worktree active` when the child relationship should be explicit.
- Use `--no-parent` only when the new work is independent.
- If `--repo` is omitted, Janus Code infers the repo from the current Janus Code worktree when possible.

Agent/setup flags:

```bash
janus worktree create --name task --agent codex --prompt "hi" --json
janus worktree create --name task --agent claude --setup run --json
janus worktree create --name task --setup skip --json
janus worktree create --name task --run-hooks --json
```

- `--agent <id>` launches that agent in the first terminal; `--prompt <text>` sends initial work to it.
- `--setup run|skip|inherit` controls repo setup hooks. Default is `inherit`, which follows the repo's setup policy.
- `--run-hooks` is a legacy alias for `--setup run`; it also reveals/activates the new worktree.
- `--agent`, `--activate`, and `--run-hooks` reveal the new worktree. Plain create stays in the background.
- Let Janus Code choose setup terminal placement from repo settings, including tab vs split behavior. Do not manually create extra setup terminals.
- If an older installed CLI rejects `--agent`, `--prompt`, or `--setup`, create the worktree normally, then run `janus terminal create --worktree <selector> --command "codex"` and `janus terminal send` if a prompt is needed.

## Worktree Comments

A worktree comment is the short status text shown in Janus Code's workspace list/card for quick progress visibility.

Coding agents should update the active worktree comment at meaningful checkpoints:

```bash
janus worktree set --worktree active --comment "fix implemented; running integration tests" --json
```

Update after meaningful state changes such as repro, fix, validation, handoff, or blocker. Keep comments short/current; failures are best-effort unless Janus Code state was requested.

## Terminals

Common commands:

```bash
janus terminal list --worktree id:<worktreeId> --json
janus terminal show --terminal <handle> --json
janus terminal read --terminal <handle> --json
janus terminal read --terminal <handle> --cursor <cursor> --limit 1000 --json
janus terminal read --json
janus terminal send --terminal <handle> --text "continue" --enter --json
janus terminal send --text "echo hello" --enter --json
janus terminal wait --terminal <handle> --for exit --timeout-ms 5000 --json
janus terminal wait --terminal <handle> --for tui-idle --timeout-ms 300000 --json
janus terminal stop --worktree id:<worktreeId> --json
janus terminal create --json
janus terminal create --title "Worker" --json
janus terminal create --worktree active --command "codex" --json
janus terminal split --terminal <handle> --direction vertical --json
janus terminal split --terminal <handle> --direction horizontal --command "npm test" --json
janus terminal rename --terminal <handle> --title "New Name" --json
janus terminal switch --terminal <handle> --json
janus terminal close --terminal <handle> --json
```

Terminal rules:

- `--terminal` is optional for most commands; omitted means the active terminal in the current worktree.
- Use `terminal read` before `terminal send` unless the next input is obvious.
- Use `terminal send` only for direct terminal input or one-off prompts where no task state, inbox, or reply tracking is needed.
- For structured coordination, invoke the `orchestration` skill; it uses `janus orchestration ...` commands for messages, handoffs, task DAGs, dispatches, inbox/reply flows, and coordinator loops.
- Use `terminal wait --for tui-idle` for agent CLIs such as Claude Code, Gemini, and Codex; always pass `--timeout-ms`.
- Terminal handles are runtime-scoped. If Janus Code restarts or returns `terminal_handle_stale`, reacquire with `terminal list`.
- For long output, use cursor reads. After a limited tail preview, page from `oldestCursor`; after a cursor read, continue with `nextCursor` while `limited` is true and `nextCursor !== latestCursor`.
- `--direction horizontal` splits left/right. `--direction vertical` splits top/bottom.

## Automations

An automation is a scheduled Janus Code prompt run by a chosen provider against either a repo-created worktree or an existing workspace.

```bash
janus automations list --json
janus automations show <automationId> --json
janus automations create --name "Daily review" --trigger daily --time 09:00 --prompt "Review open changes" --provider codex --repo id:<repoId> --json
janus automations create --name "Weekday triage" --trigger "0 9 * * 1-5" --prompt "Triage issues" --provider claude --repo path:/abs/repo --disabled --json
janus automations create --name "Inbox digest" --trigger hourly --prompt "Summarize unread mail" --provider codex --workspace active --reuse-session --json
janus automations edit <automationId> --trigger weekdays --time 09:30 --fresh-session --json
janus automations run <automationId> --json
janus automations runs --id <automationId> --json
janus automations remove <automationId> --json
```

Schedules accept `hourly`, `daily`, `weekdays`, `weekly`, 5-field cron, or RRULE. Use `--time <HH:MM>` with `daily`/`weekdays`/`weekly`, and `--day <0-6>` only with `weekly` where Sunday is `0`.

Use `--repo <selector>` for a new worktree per run, or `--workspace <selector>` / `--workspace-mode existing` for an existing Janus Code worktree. `--repo` and `--workspace` are mutually exclusive. Use `--reuse-session` only for existing-workspace automations; if the previous terminal is gone, Janus Code falls back to a fresh session. Prefer `--disabled` while testing setup.

## Built-In Browser

The built-in browser is Janus Code's embedded browser tab surface, scoped to Janus Code worktrees; it is not Chrome/Safari or desktop app UI.

These commands control only Janus Code's embedded browser tabs. For external Chrome/Safari/webviews or Janus Code app chrome/settings, use the Computer Use skill/tool. If the user explicitly asks for Janus Code CLI desktop control, use `janus computer ...`; do not use browser commands for desktop UI.

Use a snapshot-interact-re-snapshot loop:

```bash
janus goto --url https://example.com --json
janus snapshot --json
janus click --element @e3 --json
janus snapshot --json
```

Common commands:

```bash
janus goto --url <url> --json
janus back --json
janus reload --json
janus snapshot --json
janus screenshot --json
janus full-screenshot --json
janus pdf --json
janus click --element <ref> --json
janus fill --element <ref> --value <text> --json
janus type --input <text> --json
janus select --element <ref> --value <value> --json
janus check --element <ref> --json
janus scroll --direction down --amount 1000 --json
janus hover --element <ref> --json
janus focus --element <ref> --json
janus keypress --key Enter --json
janus upload --element <ref> --files <paths> --json
janus wait --text <text> --json
janus wait --url <substring> --json
janus wait --selector <css> --json
janus wait --load networkidle --json
janus eval --expression <js> --json
janus tab list --json
janus tab create --url <url> --json
janus tab switch --index <n> --json
janus tab close --index <n> --json
janus cookie get --json
janus capture start --json
janus console --limit 50 --json
janus network --limit 50 --json
janus exec --command "help" --json
```

Browser rules:

- Re-snapshot after navigation, tab switches, clicks that change the page, and any `browser_stale_ref`.
- Refs like `@e1` are assigned by `snapshot`, scoped to one tab, and invalidated by navigation or tab switch.
- Browser commands default to the current worktree and its active tab. Use `--worktree all` only intentionally.
- For concurrent browser work, run `janus tab list --json`, read `tabs[].browserPageId`, and pass `--page <browserPageId>` on later commands.
- Use typed tab commands (`janus tab list/create/close/switch`), not `janus exec --command "tab ..."`, so Janus Code keeps UI state synchronized.
- Prefer `wait --text`, `--url`, `--selector`, or `--load` after async page changes instead of bare timeouts.
- Less common workflows can use typed commands above or `janus exec --command "<agent-browser command>"` passthrough.
- If `fill` or `type` fails on a custom input, try `janus focus --element @e1 --json` then `janus inserttext --text "text" --json`.

Common recoveries:

- `browser_no_tab`: open a tab with `janus tab create --url <url> --json`.
- `browser_stale_ref`: run `janus snapshot --json` and retry with fresh refs.
- `browser_tab_not_found`: run `janus tab list --json` before switching or closing.

## Next Action

Confirm `janus status --json` unless already checked this turn, then choose the narrowest command for the job: `worktree ps/current/create`, `terminal list/read/wait/send`, `automations list`, or built-in browser `snapshot`.

## Mobile Emulator (iOS Simulator via serve-sim)

The mobile emulator surface is workspace-scoped like browser tabs (active per worktree for unqualified; explicit --worktree/--device/--emulator for targeting). Always prefer `janus emulator ...` over raw `npx serve-sim` or simctl when inside Janus Code (the bridge owns lifecycle, scoping, and registration with the live pane).

See the dedicated `janus-emulator` skill for the full table (tap/type/gesture/button/rotate/camera/permissions/ax/list/attach/exec/kill + --json + gotchas like tap preferred, normalized 0-1, name->UDID early resolve in bridge, US ASCII type, camera one-time builds, stale state cleanup, no auto-focus on attach except --focus flag mirroring browser exactly, AX via HTTP endpoint from state).

Common:

```sh
janus emulator list --json
janus emulator attach "iPhone 17 Pro" --json
janus emulator tap 0.5 0.7 --json
janus emulator type "hello" --json
janus emulator gesture '[{"type":"begin","x":0.5,"y":0.8},{"type":"move","x":0.5,"y":0.4},{"type":"end","x":0.5,"y":0.2}]' --json
janus emulator button home --json
janus emulator exec --command "tap 0.5 0.7" --json   # no "serve-sim" in the command string
janus emulator kill --json
```

Rules (mirror browser):

- Default: current worktree's active (pane open or attach sets it; unqualified "just works").
- Explicit: --device <udid|name> or --emulator <JanusId from list> (bridge resolves names early to avoid serve-sim control bug).
- --worktree all only for list.
- Recoveries: 'emulator_no_active' → janus emulator attach or open pane; stale → list/kill/attach.
- No raw serve-sim in agent prompts/skills (use janus wrappers; see janus-emulator skill).

The live pane (when implemented) registers its stream with the bridge for default targeting (seamless, recommended option per design).

## Next Action (continued)

... or emulator list/attach/tap while the live view is visible.
