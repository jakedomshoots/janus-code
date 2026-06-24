# Janus Real Dev Gauntlet Run Log

## 2026-06-23 Iteration 1

- Started Looper execution in current session after user confirmed.
- Compiled `looper-output/loop.yaml` successfully into resolved/session artifacts.
- Read styleguide, smoke scripts, and agent-workspace context.
- Plan gate passed with current-session judge: coverage matrix and defect ledger are concrete enough to begin.
- Created fake project and registered it with Janus.
- Created Janus worktree `janus-gauntlet-agent` and launched Codex with a realistic project task.
- Baseline GUI evidence: user prompt appears immediately, agent shows typing dots, right Context panel lists subagent/sources, and terminal tool chatter is not rendered into the GUI chat bubble while running.
- Fixture issue discovered: fake project initially omitted `.gitignore`, so dependency install created 1035 untracked `node_modules` entries in Janus Diff. Treating as fixture noise, not app defect.
- Verified right-panel Output, Diff, Review, and Info surfaces are wired and responsive in the installed app.
- Logged `JDG-001`: Review panel does not capture test evidence shown in the completed GUI response.
- Reproduced `JDG-002`: `/model` after completed-thread follow-up reaches the terminal picker but GUI remains typing-only.

## 2026-06-23 Iteration 2

- Fixed `JDG-002` in code and replayed it against the rebuilt installed app.
- Final Codex installed replay:
  - `gauntlet-slash-polished-4-wait.json`: normal prompt and final answer visible in GUI.
  - `gauntlet-slash-polished-4-model-picker.json`: `/model` rendered as clean GUI choices.
  - `gauntlet-slash-polished-4-reasoning-picker.json`: chained reasoning picker rendered as clean GUI choices.
  - `gauntlet-slash-polished-4-after-choice.json`: GUI returned to completed state with no pending approval or typing bubble.
- OpenCode installed replay passed: `gauntlet-opencode-live-wait.json` shows `opencode gui bridge ready` in a completed GUI thread.
- Kimi installed replay failed: `gauntlet-kimi-live-wait.json` stayed on the empty GUI hero while the Kimi terminal remained connected with the prompt text visible but unexecuted.
- Added `JDG-003` as the honest blocker to production readiness for all CLI agents.
