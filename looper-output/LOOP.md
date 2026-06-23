# janus-chat-ui-operability-loop

Drive Janus Code's chat-first project workflow from buggy-but-present toward a polished ADE-grade interface through repeated discovery, implementation, installed-app verification, and judge-gated review.

## Goal

Make the Janus Code chat UI workflow highly operable for real project work: a user can open a project workspace, start or select an agent thread, send a prompt, immediately see the user turn, watch agent progress, receive the response, follow up after completion, use browser and terminal affordances, inspect context/output/diff/review/info surfaces, and keep working without dead controls, lost messages, stale thread state, broken layout, or visual regressions.

## Definition of Done

Janus Code's installed app can be used as the primary project chat surface without workarounds: the full create/send/progress/respond/follow-up/tooling workflow is verified in /Applications/Janus Code.app, all touched controls are wired, message delivery and thread selection are reliable, right-panel and floating-card state is live and non-overlapping, keyboard/focus behavior is sane, visual language follows the Janus styleguide, CHANGELOG.md records each batch, and all configured programmatic and judge gates pass or an honest external blocker is documented with the next concrete path to green.

## Verification

- `focused-agent-workspace-tests` (programmatic)
- `workflow-assurance-tests` (programmatic)
- `typecheck-web` (programmatic)
- `changed-react-lint` (programmatic)
- `diff-whitespace` (programmatic)
- `packaged-build` (programmatic)
- `installed-janus-smoke` (programmatic)
- `ade-chat-operability` (judge)
- `visual-polish-and-styleguide` (judge)
- `user-ready-signoff` (human)

## Council

- `workflow-reviewer`: reviewer via codex (current-session)
- `operability-judge`: judge via codex (current-session)

## Gates

- Plan gate: revise_until_clean
- Delivery gate: revise_until_clean

## Loop Control

- Max iterations: 10
- Budget: `{"tokens": 8000000, "wall_clock_min": 360}`
- No-progress: `{"action": "human_checkpoint", "max_stalled_iterations": 2, "signals": ["same blocking issue repeats", "delivery artifact has no material change", "verifier output is unchanged", "installed-app smoke fails at the same step after a targeted fix"]}`

## Execution Boundary

- Mode: `in_session`
- Isolation: `current_workspace`
- Side effects: `{"allowed_without_extra_approval": ["reading files", "editing files in this worktree", "running tests and builds", "rebuilding and reinstalling /Applications/Janus Code.app for verification"], "approval_required": ["pushing branches", "creating pull requests", "deleting files outside this worktree", "sending context to any non-current-session model CLI"], "duplicate_action_check": true, "requires_approval": true}`

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
| verdict: operability-judge     |
+--------------------------------+
               | needs work -> revise <= 3 -> step 2
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
| verdict: operability-judge     |
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
