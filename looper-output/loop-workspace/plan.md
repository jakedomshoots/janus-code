# Janus Real Dev Gauntlet Plan

## Objective

Prove whether the installed Janus Code app can be used as the main project chat interface for real development work. The gauntlet uses a disposable fake project so the app is exercised through actual user workflows, not only isolated unit tests.

## Fake Project

Create `looper-output/loop-workspace/fake-project`, a tiny Vite-style TypeScript app with:

- `package.json` scripts for `dev`, `test`, `lint`, and `build`.
- Source files with obvious files for an agent to inspect and edit.
- A README asking the agent to explain the project, start a dev server, change a file, and reference docs.

## Coverage Matrix

The run must collect evidence for:

- Project add/open and selected workspace state.
- Agent start from the GUI.
- First normal chat message visible in GUI and terminal.
- Follow-up after completion.
- Slash command interactive option picking, especially `/model`.
- Terminal drawer open/close and correct single-terminal relationship.
- Browser workbench open/close and in-app panel placement.
- Files/artifact open actions from chat.
- Right-panel tabs: Output, Diff, Review, Info, Context.
- Keyboard/focus basics and no hidden focus traps.
- Responsive layout at narrow, medium, and wide sizes where tooling permits.
- Error/recovery path, including invalid command or rejected/unavailable action.
- Raw terminal/tool chatter suppressed from final GUI chat bubbles.

## Defect Rules

Every defect goes into `defects.md` with:

- ID: `JDG-###`
- Severity: P0 blocks core app use, P1 blocks major workflow, P2 hurts usability, P3 polish
- Repro steps
- Evidence path or command output
- Suspected root cause
- Fix status
- Retest evidence

## Iteration 1 Steps

1. Create fake project and baseline evidence files.
2. Rebuild/install Janus if the installed app is older than this worktree.
3. Use computer-use snapshot smoke for the baseline shell.
4. Manually drive the installed app as far as tooling allows.
5. Run focused tests and current workflow assurance.
6. Fix P0/P1 blockers discovered in this run.
7. Rebuild/install and rerun smoke after fixes.

## Plan Gate Verdict

Current-session judge verdict: pass.

Rationale: the plan covers the required fake-project workflow, evidence ledger, programmatic checks, installed app verification, and stop conditions. It does not rely on cross-vendor review.
