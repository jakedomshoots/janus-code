# janus-real-dev-gauntlet-loop

Run Janus Code against a disposable fake software project as if it were a real production development environment, then fix or document every blocker that prevents confident real-world use.

## Goal

Prove whether the installed Janus Code app is ready for real development work by creating a disposable fake project and using Janus end to end: project onboarding, agent launch, chat follow-ups, slash-command prompts, terminal and browser workbench, file/artifact opening, right-panel tabs, diff/review/context/info surfaces, keyboard/focus navigation, responsive layout, error recovery, rebuild/install verification, and no dead controls.

## Definition of Done

The installed /Applications/Janus Code.app has been rebuilt from this worktree and can run the fake-project gauntlet without lost messages, stuck slash-command pickers, duplicate terminals, stale right-panel state, broken artifact/file open buttons, dead top-level controls, hidden questions, layout overlap, keyboard traps, or raw tool chatter in final chat bubbles. All feasible blockers discovered by the gauntlet are fixed, tested, logged in CHANGELOG.md, rebuilt into the installed app, and committed. If a blocker cannot be fixed inside this session, it is documented with reproduction steps, evidence, severity, likely root cause, and the concrete path to 100%.

## Verification

- `fake-project-created` (programmatic)
- `defect-ledger-present` (programmatic)
- `focused-workflow-tests` (programmatic)
- `workflow-assurance` (programmatic)
- `typecheck` (programmatic)
- `lint` (programmatic)
- `diff-whitespace` (programmatic)
- `packaged-build` (programmatic)
- `installed-smoke` (programmatic)
- `gauntlet-evidence` (judge)
- `production-readiness` (judge)
- `final-human-stop` (human)

## Council

- `current-session-reviewer`: reviewer via codex (current-session)
- `current-session-judge`: judge via codex (current-session)

## Gates

- Plan gate: revise_until_clean
- Delivery gate: revise_until_clean

## Loop Control

- Max iterations: 10
- Budget: `{"tokens": 8000000, "wall_clock_min": 360}`
- No-progress: `{"action": "human_checkpoint", "max_stalled_iterations": 2, "signals": ["same defect or smoke failure repeats after a targeted fix", "no new gauntlet coverage is added in an iteration", "verifier output is unchanged", "installed app cannot be controlled or inspected after rebuild"]}`

## Execution Boundary

- Mode: `in_session`
- Isolation: `current_workspace`
- Side effects: `{"allowed_without_extra_approval": ["reading files", "editing files in this worktree", "creating and deleting files under looper-output/loop-workspace/fake-project", "running tests and builds", "rebuilding and reinstalling /Applications/Janus Code.app for verification"], "approval_required": ["pushing branches", "creating pull requests", "deleting files outside this worktree or fake project", "sending context to any non-current-session model CLI"], "duplicate_action_check": true, "requires_approval": true}`

## Observability

- State file: `state.json`
- Run log: `run-log.md`
- Checkpoint granularity: `gate`

## Flow Preview

```text
+--------------------------------+
| 1. Goal + context              |
| read sources                   |
+--------------------------------+
               |
               v
+--------------------------------+
| 2. Draft plan.md               |
| state -> state.json            |
+--------------------------------+
               |
               v
+--------------------------------+
| 3. Plan gate                   |
| verdict: current-session-judge |
+--------------------------------+
               | needs work -> revise <= 2 -> step 2
               | pass
               v
+--------------------------------+
| 4. Write delivery-N.md         |
| log -> run-log.md              |
+--------------------------------+
               |
               v
+--------------------------------+
| 5. Delivery gate               |
| verdict: current-session-judge |
+--------------------------------+
               | needs work -> revise <= 3 -> step 4
               | pass
               v
+--------------------------------+
| 6. Final output                |
| all gates clean                |
+--------------------------------+

Stops: pass gates | max 10 iterations | no progress x2 | budget 360m, 8000000 tokens
```
