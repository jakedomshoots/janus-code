# Run `janus-real-dev-gauntlet-loop` In This Session

Use this prompt when the user wants to run the Looper-designed loop in the current LLM session.
This is the default/easy execution path. The Python runner is the advanced path for running later or outside the session.

## Operator Instructions

You are executing a Looper-designed loop in this current session.
Follow the resolved spec below, write handoff files into the workspace, and enforce the caps manually.
Do not use `run-loop.py` unless the user explicitly asks for the advanced external runner.

1. Create the workspace directory if it does not exist.
2. Read the context sources before drafting the plan.
3. Draft `plan.md` in the workspace.
4. Run the plan gate. Apply programmatic checks when available. For judge criteria, use the configured judge only after consent for any non-local egress; otherwise ask the user to approve a human/current-session substitute.
5. Revise until the gate passes or `max_revisions` is reached.
6. Produce `delivery-N.md` in the workspace.
7. Run the delivery gate after each delivery.
8. Stop when all delivery criteria pass, a cap is reached, or the user stops the loop.
9. Keep `state.json` current with status, iteration, last gate, consent, and blockers.
10. Append a compact entry to `run-log.md` after every context read, model call, check, gate verdict, revision, blocker, and stop decision.
11. Compare each blocker against the previous blocker. If the same blocker repeats for the configured no-progress window, stop or ask for the configured human checkpoint instead of revising again.
12. Treat token and USD budgets as operator limits in this session: if exact accounting is unavailable, stop and ask before continuing when the loop appears likely to exceed them.

## Files

- Source spec: `loop.yaml`
- Human summary: `LOOP.md`
- Resolved spec: `loop.resolved.json`
- Workspace: `./loop-workspace`
- State file: `state.json`
- Run log: `run-log.md`

## Goal

Prove whether the installed Janus Code app is ready for real development work by creating a disposable fake project and using Janus end to end: project onboarding, agent launch, chat follow-ups, slash-command prompts, terminal and browser workbench, file/artifact opening, right-panel tabs, diff/review/context/info surfaces, keyboard/focus navigation, responsive layout, error recovery, rebuild/install verification, and no dead controls.

## Definition Of Done

The installed /Applications/Janus Code.app has been rebuilt from this worktree and can run the fake-project gauntlet without lost messages, stuck slash-command pickers, duplicate terminals, stale right-panel state, broken artifact/file open buttons, dead top-level controls, hidden questions, layout overlap, keyboard traps, or raw tool chatter in final chat bubbles. All feasible blockers discovered by the gauntlet are fixed, tested, logged in CHANGELOG.md, rebuilt into the installed app, and committed. If a blocker cannot be fixed inside this session, it is documented with reproduction steps, evidence, severity, likely root cause, and the concrete path to 100%.

## Context Sources

- Read file `./docs/STYLEGUIDE.md`
- Read file `./src/renderer/src/assets/main.css`
- Read file `./CHANGELOG.md`
- Read file `./package.json`
- Read file `./config/scripts/computer-use-smoke.mjs`
- Read file `./config/scripts/run-janus-workflow-assurance.mjs`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspacePage.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspacePane.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceChrome.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTimeline.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTimelineEntry.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentComposerForm.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTerminalDrawer.tsx`
- Read file `./src/renderer/src/lib/active-agent-note-send.ts`
- Read file `./src/renderer/src/lib/active-agent-terminal-choice.ts`
- Read file `./src/renderer/src/lib/terminal-prompt-choices.ts`
- Run command `["git", "status", "--short", "--branch", "--untracked-files=all"]`
- Run command `["rg", "-n", "TODO|placeholder|disabled|throw new Error|onClick=\\{\\(\\) => \\{\\}\\}|Message accepted|terminal-choice|approval|fallbackText|open.*artifact|New session|Browser|Terminal|Files", "src/renderer/src/components/agent-workspace", "src/renderer/src/lib", "config/scripts"]`

## Verification Criteria

- `fake-project-created` programmatic: run `["test", "-f", "looper-output/loop-workspace/fake-project/package.json"]` and expect `exit_zero`
- `defect-ledger-present` programmatic: run `["test", "-f", "looper-output/loop-workspace/defects.md"]` and expect `exit_zero`
- `focused-workflow-tests` programmatic: run `["pnpm", "exec", "vitest", "run", "src/renderer/src/lib/active-agent-note-send.test.ts", "src/renderer/src/components/agent-workspace/AgentTimeline.test.tsx", "src/renderer/src/components/agent-workspace/orca-agent-timeline-selectors.test.ts", "src/shared/agent-status-types.test.ts", "--config", "config/vitest.config.ts", "--maxWorkers=1"]` and expect `exit_zero`
- `workflow-assurance` programmatic: run `["pnpm", "run", "verify:janus-workflow-assurance"]` and expect `exit_zero`
- `typecheck` programmatic: run `["pnpm", "run", "typecheck"]` and expect `exit_zero`
- `lint` programmatic: run `["pnpm", "run", "lint"]` and expect `exit_zero`
- `diff-whitespace` programmatic: run `["git", "diff", "--check"]` and expect `exit_zero`
- `packaged-build` programmatic: run `["pnpm", "run", "build:unpack"]` and expect `exit_zero`
- `installed-smoke` programmatic: run `["pnpm", "run", "smoke:janus-workflow"]` and expect `exit_zero`
- `gauntlet-evidence` judge rubric: Pass only if loop-workspace contains a fake-project test record covering project add/open, agent start, normal chat, follow-up after completion, slash-command option picking, terminal drawer, browser workbench, file or artifact open buttons, right-panel Output/Diff/Review/Info/Context tabs, keyboard/focus navigation, responsive layout at narrow/medium/wide widths, and at least one error/recovery path. Every failure must have a defect ID, severity, reproduction steps, evidence, status, and next action. Do not pass on generic statements without evidence.

- `production-readiness` judge rubric: Pass only if the installed app can plausibly be used for real dev work through Janus without terminal workarounds for core chat flow. Blocking issues include: hidden terminal questions, lost or delayed user turns, stuck typing state, duplicate unmanaged terminals, raw tool chatter in GUI final responses, dead visible controls, broken artifact/file opens, stale thread/right-panel metadata, layout overlap at supported widths, failed build/smoke checks, or uncommitted fixes.

- `final-human-stop` human signoff: Stop only after the current session has either reached evidence-backed production readiness or documented honest blockers with a specific path to readiness.


## Council

- `current-session-reviewer` reviewer via `["codex", "exec"]` (local; timeout 900s)
- `current-session-judge` judge via `["codex", "exec"]` (local; timeout 900s)

## Gates

### plan_gate

- When: `after_plan`
- Policy: `revise_until_clean`
- Verdict source: `current-session-judge`
- Criteria: `gauntlet-evidence, production-readiness`
- Max revisions: `2`

### delivery_gate

- When: `after_each_delivery`
- Policy: `revise_until_clean`
- Verdict source: `current-session-judge`
- Criteria: `fake-project-created, defect-ledger-present, focused-workflow-tests, workflow-assurance, typecheck, lint, diff-whitespace, packaged-build, installed-smoke, gauntlet-evidence, production-readiness, final-human-stop`
- Max revisions: `3`

## Loop Control

- Max iterations: `10`
- Budget: `{"tokens": 8000000, "wall_clock_min": 360}`
- No-progress: `{"action": "human_checkpoint", "max_stalled_iterations": 2, "signals": ["same defect or smoke failure repeats after a targeted fix", "no new gauntlet coverage is added in an iteration", "verifier output is unchanged", "installed app cannot be controlled or inspected after rebuild"]}`
- Human checkpoints: `before sending context to any non-current-session model, before destructive file operations outside this worktree or fake project, before claiming production readiness`
- Stop conditions:
  - all programmatic checks pass
  - fake-project gauntlet has evidence for every required surface
  - no P0 or P1 app-workflow blockers remain
  - all feasible P2 blockers discovered in this loop are fixed or explicitly deferred with rationale
  - max_iterations reached
  - same blocker repeats for 2 iterations without new evidence
  - wall-clock or token budget cap is reached

## Execution Boundary

- Mode: `in_session`
- Isolation: `current_workspace`
- Side effects: `{"allowed_without_extra_approval": ["reading files", "editing files in this worktree", "creating and deleting files under looper-output/loop-workspace/fake-project", "running tests and builds", "rebuilding and reinstalling /Applications/Janus Code.app for verification"], "approval_required": ["pushing branches", "creating pull requests", "deleting files outside this worktree or fake project", "sending context to any non-current-session model CLI"], "duplicate_action_check": true, "requires_approval": true}`

If the loop needs scheduled runs, child-agent lifecycle management, concurrency control, or restart-safe step retries, stop and tell the user this Looper spec should be handed to a durable orchestrator.

## Observability

- State file: `state.json`
- Run log: `run-log.md`
- Checkpoint granularity: `gate`

Use `state.json` for the latest resumable status and `run-log.md` for the append-only history of what happened.

## Privacy

- Before sending `plan, deliveries, selected source snippets, verification output` to `current-session-reviewer`, confirm consent and apply redactions `.env, .env.*, secrets/**, **/*.key`.
- Before sending `plan, deliveries, selected source snippets, verification output` to `current-session-judge`, confirm consent and apply redactions `.env, .env.*, secrets/**, **/*.key`.

## Start Now

If the user asked to run now, begin at step 1 under Operator Instructions and keep going until a stop condition is reached.
