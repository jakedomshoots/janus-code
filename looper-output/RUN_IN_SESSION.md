# Run `janus-chat-ui-operability-loop` In This Session

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

Make the Janus Code chat UI workflow highly operable for real project work: a user can open a project workspace, start or select an agent thread, send a prompt, immediately see the user turn, watch agent progress, receive the response, follow up after completion, use browser and terminal affordances, inspect context/output/diff/review/info surfaces, and keep working without dead controls, lost messages, stale thread state, broken layout, or visual regressions.

## Definition Of Done

Janus Code's installed app can be used as the primary project chat surface without workarounds: the full create/send/progress/respond/follow-up/tooling workflow is verified in /Applications/Janus Code.app, all touched controls are wired, message delivery and thread selection are reliable, right-panel and floating-card state is live and non-overlapping, keyboard/focus behavior is sane, visual language follows the Janus styleguide, CHANGELOG.md records each batch, and all configured programmatic and judge gates pass or an honest external blocker is documented with the next concrete path to green.

## Context Sources

- Read file `./docs/STYLEGUIDE.md`
- Read file `./src/renderer/src/assets/main.css`
- Read file `./CHANGELOG.md`
- Read file `./package.json`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspacePage.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspacePane.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceChrome.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTimeline.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTimelineEntry.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentComposerForm.tsx`
- Read file `./src/renderer/src/components/agent-workspace/useAgentWorkspacePanes.ts`
- Read file `./src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx`
- Read file `./src/renderer/src/components/agent-workspace/AgentTerminalDrawer.tsx`
- Read file `./src/renderer/src/lib/launch-agent-in-new-tab.ts`
- Run command `["git", "status", "--short", "--branch", "--untracked-files=all"]`
- Run command `["rg", "-n", "TODO|placeholder|disabled|throw new Error|onClick=\\{\\(\\) => \\{\\}\\}|Message accepted|starting|completed thread|recover", "src/renderer/src/components/agent-workspace", "src/renderer/src/lib/launch-agent-in-new-tab.ts"]`

## Verification Criteria

- `focused-agent-workspace-tests` programmatic: run `["pnpm", "vitest", "run", "--config", "config/vitest.config.ts", "src/renderer/src/components/agent-workspace/AgentWorkspacePaneWorkflow.test.tsx", "src/renderer/src/components/agent-workspace/AgentComposer.test.tsx", "src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx", "src/renderer/src/components/agent-workspace/AgentTerminalDrawer.test.tsx", "src/renderer/src/components/agent-workspace/agent-workspace-pane-thread-selection.test.ts", "src/renderer/src/lib/launch-agent-in-new-tab.test.ts", "src/renderer/src/components/terminal-pane/pty-connection.test.ts"]` and expect `exit_zero`
- `workflow-assurance-tests` programmatic: run `["pnpm", "run", "verify:janus-workflow-assurance"]` and expect `exit_zero`
- `typecheck-web` programmatic: run `["pnpm", "run", "typecheck:web"]` and expect `exit_zero`
- `changed-react-lint` programmatic: run `["pnpm", "run", "lint:react-doctor:changed"]` and expect `exit_zero`
- `diff-whitespace` programmatic: run `["git", "diff", "--check"]` and expect `exit_zero`
- `packaged-build` programmatic: run `["pnpm", "run", "build:unpack"]` and expect `exit_zero`
- `installed-janus-smoke` programmatic: run `["pnpm", "run", "smoke:janus-workflow"]` and expect `exit_zero`
- `ade-chat-operability` judge rubric: Judge the plan or delivery against the actual Janus chat workflow, not isolated widgets. A pass requires explicit coverage for: project/thread selection, new session launch, first user turn visibility, running and completed states, follow-up recovery, terminal drawer, browser/workbench routing, context/output/diff/review/info surfaces, keyboard/focus, empty and error states, no stale workspace metadata, no dead placeholder controls, and no layout overlap at narrow, medium, and wide widths. Blocking issues must identify the missing workflow step or evidence.

- `visual-polish-and-styleguide` judge rubric: Judge whether the delivery feels like a high-end polished ADE. A pass requires restrained operational density, clear hierarchy, intentional microstates, readable contrast, styleguide token usage, consistent spacing, professional timeline/composer/right-panel composition, and no generic AI-dashboard ornament or contradictory chrome. Blocking issues must cite the visible surface and why it harms real use.

- `user-ready-signoff` human signoff: Confirm the installed Janus Code app is ready to use as the primary chat interface for real project work, or list the remaining blocker that prevents that.


## Council

- `workflow-reviewer` reviewer via `["codex", "exec"]` (non-local; timeout 900s)
- `operability-judge` judge via `["codex", "exec"]` (non-local; timeout 900s)

## Gates

### plan_gate

- When: `after_plan`
- Policy: `revise_until_clean`
- Verdict source: `operability-judge`
- Criteria: `ade-chat-operability, visual-polish-and-styleguide`
- Max revisions: `3`

### delivery_gate

- When: `after_each_delivery`
- Policy: `revise_until_clean`
- Verdict source: `operability-judge`
- Criteria: `focused-agent-workspace-tests, workflow-assurance-tests, typecheck-web, changed-react-lint, diff-whitespace, packaged-build, installed-janus-smoke, ade-chat-operability, visual-polish-and-styleguide, user-ready-signoff`
- Max revisions: `3`

## Loop Control

- Max iterations: `10`
- Budget: `{"tokens": 8000000, "wall_clock_min": 360}`
- No-progress: `{"action": "human_checkpoint", "max_stalled_iterations": 2, "signals": ["same blocking issue repeats", "delivery artifact has no material change", "verifier output is unchanged", "installed-app smoke fails at the same step after a targeted fix"]}`
- Human checkpoints: `before external model or vendor egress, before any destructive git operation, before final ready-to-use claim`
- Stop conditions:
  - all delivery criteria pass clean
  - user confirms the installed app is ready to use for real project chat work
  - max_iterations reached
  - same blocker repeats for 2 iterations without new evidence
  - wall-clock or token budget cap is reached

## Execution Boundary

- Mode: `in_session`
- Isolation: `current_workspace`
- Side effects: `{"allowed_without_extra_approval": ["reading files", "editing files in this worktree", "running tests and builds", "rebuilding and reinstalling /Applications/Janus Code.app for verification"], "approval_required": ["pushing branches", "creating pull requests", "deleting files outside this worktree", "sending context to any non-current-session model CLI"], "duplicate_action_check": true, "requires_approval": true}`

If the loop needs scheduled runs, child-agent lifecycle management, concurrency control, or restart-safe step retries, stop and tell the user this Looper spec should be handed to a durable orchestrator.

## Observability

- State file: `state.json`
- Run log: `run-log.md`
- Checkpoint granularity: `gate`

Use `state.json` for the latest resumable status and `run-log.md` for the append-only history of what happened.

## Privacy

- Before sending `plan, deliveries, selected source snippets, verification output` to `workflow-reviewer`, confirm consent and apply redactions `.env, .env.*, secrets/**, **/*.key`.
- Before sending `plan, deliveries, selected source snippets, verification output` to `operability-judge`, confirm consent and apply redactions `.env, .env.*, secrets/**, **/*.key`.

## Start Now

If the user asked to run now, begin at step 1 under Operator Instructions and keep going until a stop condition is reached.
