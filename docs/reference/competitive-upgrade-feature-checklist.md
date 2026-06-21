# Competitive Upgrade Feature Checklist

This checklist turns the competitive upgrade recommendations into a buildable
tracker for Janus Code. It prioritizes trust, control, and power-user workflow
clarity before larger autonomy or multi-agent experiments.

## Guiding Principles

- Preserve Janus Code's provider-neutral CLI-agent model.
- Prefer local, worktree-grounded evidence over marketing-style autonomy.
- Make every agent run answer: what context was used, what changed, what ran,
  what passed, what failed, and what needs the user's decision.
- Keep GitHub-specific affordances behind provider checks so GitLab and other
  review providers remain viable.
- Keep local and SSH execution paths in mind for every feature.

## P0: Trust Foundation

### [x] Agent Flight Recorder

**Goal:** Make each agent run inspectable from the Janus UI.

**Why it matters:** Users cannot trust a coding agent when commands, edits,
approvals, and verification evidence are scattered across terminal output.

**MVP checklist:**

- [x] Define a provider-neutral run event shape for user prompt, agent state,
      command, file-change, approval, error, and verification events.
- [x] Surface a compact run ledger in the agent workspace right panel.
- [x] Show the current step, last command, changed-file count, and attention
      state in the thread chrome.
- [x] Record approval prompts and user responses as first-class run events.
- [x] Keep event capture tolerant of partial CLI support so unsupported agents
      degrade to terminal-derived evidence.
- [x] Add focused tests for event ordering, stale event cleanup, and active
      thread isolation.

**Progress:**

- 2026-06-21: Added selector-derived run events and a right-panel Run ledger for
  agent state history, current state, tool events, approvals, failures, pending
  launches, and partial-telemetry disclosure. Added focused selector and panel
  rendering tests for event ordering and thread-scoped isolation.
- 2026-06-21: Added changed-file evidence and explicit verification-unknown
  evidence to the right-panel Run ledger. The next verification-contract slice
  should replace the unknown state with observed command results.
- 2026-06-21: Added selected-thread run evidence to the workspace header
  chrome: latest actionable step, last observed command, changed-file count,
  and attention state. The summary is derived from thread-scoped run events
  and diffs so other-thread evidence does not leak into the active thread.
- 2026-06-21: Made approval responses first-class in the run event stream:
  requested, approved, denied, and expired approvals now render with distinct
  event titles and statuses instead of a generic update label.
- 2026-06-21: Added focused selector coverage for run-event ordering,
  active-thread isolation, and stale retained-row cleanup. Pending launches now
  suppress retained snapshots for the same pane key so fresh starts do not
  inherit old completed-run evidence.
- 2026-06-21: Verified the Flight Recorder MVP against the focused agent
  workspace pack after the run board work; run ledger, header chrome, approval
  responses, partial telemetry, stale cleanup, and active-thread isolation all
  have coverage in the shared focused suite.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx`
- `src/renderer/src/components/agent-workspace/AgentTimeline.tsx`
- `src/renderer/src/store/slices/agent-status.ts`
- `src/renderer/src/runtime/runtime-terminal-stream.ts`
- `src/main/*/hook-service.ts`

**Definition of done:**

- A user can open one agent thread and see what the agent did without reading
  raw terminal output.
- A fresh thread does not inherit stale run events from another worktree or tab.
- Unsupported agents clearly show limited telemetry instead of pretending the
  run is fully observable.

### [x] Context Tray

**Goal:** Show the exact context that will be sent to or used by an agent run.

**Why it matters:** Agent failures often come from stale files, accidental
browser captures, missing rules, or hidden memory.

**MVP checklist:**

- [x] Create a prompt context manifest at composer submit time.
- [x] List available launch context: workspace, selected thread/terminal,
      browser captures, diff/review notes, verification commands, and memory hints.
- [x] Show project rules or memory hints when the active agent/runtime exposes
      them.
- [x] Add a stale-context warning when context belongs to a different thread,
      worktree, branch, or browser tab.
- [x] Allow users to remove optional context before launch.
- [x] Add tests for browser-context attachment visibility and stale-source
      detection.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerToolCluster.tsx`
- `src/renderer/src/components/agent-workspace/useAgentComposerBrowserContextAttachment.ts`
- `src/renderer/src/store/slices/memory.ts`
- `src/renderer/src/store/slices/tabs.ts`

**Definition of done:**

- Before launch, a user can inspect the meaningful context inputs for the run.
- Context shown in the tray matches what the launch path actually passes along.

**Progress:**

- 2026-06-21: Added the composer Prompt context tray and launch manifest. The
  manifest is passed into `launchAgentInNewTab` and pending launch metadata so
  the visible tray matches the recorded run context.
- 2026-06-21: Added chips for workspace host/path/branch, selected
  thread/terminal, attached browser annotations, scoped changed-file summaries,
  review context, verification commands, and `/memory` availability for agents
  whose slash-command catalog exposes it.
- 2026-06-21: Added stale-source warnings for browser snapshots, changed-file
  summaries, reviews, workspace branch drift, and selected-thread worktree
  drift.
- 2026-06-21: Added removal affordances for optional browser and verification
  context. Browser context is stripped from the draft while preserving typed
  prompt text, and verification context is removed by clearing the command.
- 2026-06-21: No separate attached-file or task-source launch input is exposed
  in this composer surface yet. The completed tray lists the context sources
  this launch path can actually send or record today.

### [x] Verification Contract MVP

**Goal:** Let users define what counts as done before an agent starts.

**Why it matters:** "Finished" is not enough for serious coding work; users need
tests, typechecks, builds, or manual smoke evidence.

**MVP checklist:**

- [x] Add a compact composer control for one required verification command.
- [x] Store the command on the run record, not only in transient UI state.
- [x] Show verification state: not run, running, passed, failed, or unknown.
- [x] Detect command completion from the terminal/runtime stream when possible.
- [x] Store platform-aware and SSH-aware execution context with the command.
- [x] If Janus executes verification itself later, route that command through
      the matching local, SSH, or runtime shell.
- [x] Add tests for command persistence, pass/fail display, and unknown-state
      fallback.

**Progress:**

- 2026-06-21: Added a compact Verification command input to the composer for
  new agent launches. The command now travels into `launchAgentInNewTab`, is
  stored on pending launch metadata, seeds initial agent status as
  `not-run`, and renders in the Run ledger as `Verification not run`.
- 2026-06-21: Added structured tool-event verification detection. When an
  observed tool command matches the configured verification command, Janus now
  records `running`, `passed`, or `failed`; unrelated commands leave the
  verification state untouched. Shared payload normalization now preserves
  verification metadata, and focused tests cover parser normalization, command
  persistence, pass/fail rendering, and unknown-state fallback.
- 2026-06-21: Added verification execution context. Composer launches now bind
  the verification command to the selected workspace host kind, working
  directory, shell platform, and SSH/runtime identifier when available; SSH
  launches use the remote shell platform, pending/startup/status records
  preserve that context, and the Run ledger shows the command with its
  execution target. Janus still observes matching tool events rather than
  self-running the verification command.
- 2026-06-21: Added a verification execution route resolver for local, SSH,
  and runtime shells. The resolver trims the command, preserves cwd/platform,
  requires remote identifiers for SSH/runtime targets, and returns no route for
  incomplete context so future self-run verification cannot silently execute in
  the wrong environment.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentComposerFooter.tsx`
- `src/renderer/src/components/agent-workspace/agent-composer-verification-execution.ts`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceHeader.tsx`
- `src/renderer/src/store/slices/runtime-status.ts`
- `src/renderer/src/runtime/runtime-terminal-stream.ts`
- `src/renderer/src/store/slices/settings.ts`

**Definition of done:**

- A user can attach `pnpm test`, `pnpm run typecheck:web`, or another project
  command to a run and see whether it was observed as completed.
- Verification state is visible from the active thread without opening raw logs.

## P1: Control And Review

### [x] Risk-Gated Action Labels

**Goal:** Make risky actions explicit before they surprise the user.

**MVP checklist:**

- [x] Classify terminal commands into safe read, edit, install, delete,
      migration, deploy, credential, and network categories.
- [x] Show risk labels in approval prompts and the run ledger.
- [x] Add high-risk warnings for `.env`, credential files, destructive git
      commands, database migrations, and production-like targets.
- [x] Keep the classifier path-safe across macOS, Linux, Windows, and SSH.
- [x] Add tests for command classification and false-positive fallbacks.

**Progress:**

- 2026-06-21: Added provider-neutral command risk classification for safe-read,
  edit, install, delete, migration, deploy, credential, and network commands.
  Workspace selectors now attach risk metadata to tool and approval events, the
  Run ledger and approval prompts show compact risk labels, and tests cover
  `.env`/credential paths, destructive delete/git commands, migrations,
  production deploy/apply commands, Windows path forms, and false-positive
  echo fallbacks. This is a labeling/warning slice; future protected-actions
  policy gates can build on the same classifier.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/useAgentWorkspaceApprovalResponse.ts`
- `src/renderer/src/components/terminal-pane/TerminalPane.tsx`
- `src/renderer/src/store/slices/preflight.ts`
- `src/main/agent-trust-presets.ts`

**Definition of done:**

- The user can tell why Janus is asking for attention before approving a risky
  action.

### [x] Review-Only Agent Mode

**Goal:** Let users ask an agent to critique changes without intentionally
editing files.

**MVP checklist:**

- [x] Add a review-only launch action from diff/review surfaces.
- [x] Pass the current diff and review notes as context.
- [x] Use hard no-write/no-command permissions where the selected agent supports
      them.
- [x] Display a soft-enforcement warning when the selected agent cannot enforce
      no-write mode.
- [x] Return findings as prioritized review notes instead of generic chat text.
- [x] Add tests for diff-context handoff and permission-mode selection.

**Progress:**

- 2026-06-21: Added a Review only launch action to the right-panel Changes
  and Review tabs. The action launches the workspace default agent with a
  generated review-only prompt containing changed-file summaries and hosted
  review context, uses Codex `--sandbox read-only` when Codex is selected, and
  shows a best-effort warning for agents without hard read-only enforcement.
  Focused tests cover prompt/context handoff, Codex permission args, visible
  diff/review actions, and the layout-level launch payload.
- 2026-06-21: Added structured review findings ingestion. Review-only prompts
  request a fenced `janus-review-findings` JSON block, Janus parses agent
  timeline output into severity/file/rationale review findings, and the Review
  tab renders them as prioritized notes. Focused tests cover parsing,
  active-thread isolation, severity ordering, prompt contract, and panel
  rendering.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentReviewPanel.tsx`
- `src/renderer/src/components/agent-workspace/AgentDiffPanel.tsx`
- `src/renderer/src/components/editor/ReviewNotesSendMenuContent.tsx`
- `src/renderer/src/store/slices/diffComments.ts`

**Definition of done:**

- A user can run a review pass from a diff and get actionable findings without
  committing to an edit loop.

### [x] Queued Follow-Ups

**Goal:** Let users capture next instructions while an agent is busy.

**MVP checklist:**

- [x] Detect when the active thread is busy or waiting on tool execution.
- [x] Change the composer submit action to queue a follow-up message.
- [x] Show a single editable queued message below or near the composer.
- [x] Send the queued message only after the current run is ready for follow-up.
- [x] Add stale-queue protection when the user switches worktrees or threads.
- [x] Add tests for enqueue, edit, delete, and thread-switch behavior.

**Progress:**

- 2026-06-21: Added one-message queued follow-ups for selected threads with
  active running tool/agent/approval evidence. Composer sends now queue instead
  of writing into a busy agent, show an editable/deletable queued row, auto-send
  only when the same thread becomes ready, and hide without sending after
  thread/worktree switches. Focused tests cover enqueue, edit-and-send, delete,
  and thread-switch protection.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerForm.tsx`
- `src/renderer/src/components/agent-workspace/useAgentComposerStateSync.ts`
- `src/renderer/src/store/slices/agent-status-freshness-scheduler.ts`

**Definition of done:**

- Users can safely queue one follow-up without losing the message or sending it
  to the wrong thread.

### [x] Provider Task-Fit Hints

**Goal:** Help power users choose the right agent/model for the job.

**MVP checklist:**

- [x] Add optional task-fit labels for review, broad refactor, fast edit,
      browser task, local-only, and long-context work.
- [x] Show account/rate-limit warnings when Janus already has usage data.
- [x] Keep hints configurable and avoid ranking providers as a hard truth.
- [x] Add tests for rendering hints and preserving selected provider/model.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentComposerAgentSettingsPopover.tsx`
- `src/renderer/src/components/settings/AgentsPane.tsx`
- `src/renderer/src/components/settings/AccountsPane.tsx`
- `src/renderer/src/store/slices/codex-usage.ts`
- `src/renderer/src/store/slices/claude-usage.ts`

**Progress:**

- 2026-06-21: Added provider task-fit descriptions to the provider picker.
  Built-in labels cover review, broad refactor, fast edit, browser task,
  local-only, and long-context hints without changing provider ordering or
  auto-selecting a winner. Focused composer coverage checks that hints render
  and provider selection still works.
- 2026-06-21: Added a Settings toggle for provider task-fit hints and low-quota
  provider warnings sourced from existing rate-limit data. Focused coverage
  checks disabled hints, existing usage warnings, settings search, the toggle
  update, provider selection, and existing model-selection launch behavior.

**Definition of done:**

- The model/provider selector helps users make a choice without adding a second
  onboarding flow.

### [x] Agent Run Board MVP

**Goal:** Make active and waiting agent work easy to supervise across worktrees.

**MVP checklist:**

- [x] Group visible runs by running, waiting, review-ready, failed, and done.
- [x] Link each row to its worktree and active thread.
- [x] Reuse existing worktree agent rows before adding a new major surface.
- [x] Show limited telemetry states clearly for unsupported agents.
- [x] Add tests for grouping, ordering, and cross-worktree navigation.

**Likely code areas:**

- `src/renderer/src/components/sidebar/WorktreeCardAgents.tsx`
- `src/renderer/src/components/sidebar/worktree-agent-rows.ts`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceThreadTabs.tsx`
- `src/renderer/src/store/slices/worktrees.ts`

**Progress:**

- 2026-06-21: Added a compact Agent run board below the workspace header. It
  groups snapshot threads by running, waiting, review-ready, failed, and done;
  reuses existing thread chrome/run-event evidence for current step and changed
  file counts; labels limited telemetry rows; and opens same-worktree rows in
  the active pane while cross-worktree rows activate the target worktree and
  select the intended thread after activation.

**Definition of done:**

- A user with multiple active agents can see which runs need attention without
  opening every thread.

## P2: Power-User Expansion

### [x] Best-Of-N Worktree Compare

**Goal:** Compare multiple agent attempts safely.

**MVP checklist:**

- [x] Detect two or more attempts in isolated worktrees from the same repo base.
- [x] Track verification status for each attempt.
- [x] Show changed files and risk notes side by side.
- [x] Let the user select a winner without auto-merging.
- [x] Add tests around compare-state isolation, winner selection, and
      cross-worktree attempt opening.

**Likely code areas:**

- `src/renderer/src/store/slices/worktrees.ts`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceAttemptCompare.tsx`
- `src/renderer/src/components/agent-workspace/agent-worktree-compare-selectors.ts`

**Definition of done:**

- Users can compare attempts without losing track of which diff belongs to
  which agent.

**Progress:**

- 2026-06-21: Added a Best-of-N compare band for existing isolated attempts.
  The selector groups the latest thread per worktree by repo id, keeps
  verification, diff totals, and risk notes scoped to each thread, and requires
  at least two distinct worktrees before showing the compare surface.
- 2026-06-21: Added local winner selection and cross-worktree attempt opening.
  Selecting a winner only marks the user's choice in the UI; it does not merge,
  stage, or discard anything. Automated multi-attempt creation and cleanup stay
  in the existing worktree creation flows rather than this compare slice.

### [x] Memory Inspector

**Goal:** Show memory and rule sources that influenced a run.

**MVP checklist:**

- [x] List observable Janus memory/rule sources and explicitly mark opaque
      provider-owned context as unsupported.
- [x] Show memory source, scope, and freshness when available.
- [x] Allow disabling optional Janus-managed context for one run.
- [x] Add privacy warning copy for sensitive memory display.
- [x] Add tests for empty, partial, and unsupported memory states.

**Likely code areas:**

- `src/renderer/src/store/slices/memory.ts`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceMemoryInspector.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerContextTray.tsx`

**Definition of done:**

- Users can distinguish observable Janus context from opaque agent-internal
  context.

**Progress:**

- 2026-06-21: Added a Memory inspector to the agent workspace Context tab. It
  shows Janus-observable resource memory snapshots with freshness, scoped
  workspace session memory when available, fetch-error partial states, empty
  states, and an explicit unsupported row for provider-owned memory/rule files.
- 2026-06-21: Added privacy warning copy and made the optional agent memory
  composer chip removable for one draft. Removing it suppresses the `/memory`
  hint from the prompt context manifest without changing provider settings.

### [x] Protected Resource Policy

**Goal:** Prevent destructive surprises around production resources.

**MVP checklist:**

- [x] Persist user-defined protected path, command, branch, and environment
  patterns in settings.
- [x] Attach protected-policy matches to existing approval and run evidence so
  matching commands are visible before approval and in the ledger.
- [x] Support per-repo and global policy scopes.
- [x] Keep policy matching cross-platform and SSH-compatible.
- [x] Add tests for policy matching, scoped policies, run evidence, approval
  evidence, and unsupported shells.

**Likely code areas:**

- `src/shared/protected-resource-policy.ts`
- `src/renderer/src/components/agent-workspace/orca-agent-run-event-selectors.ts`
- `src/renderer/src/components/agent-workspace/orca-agent-approval-selectors.ts`
- `src/renderer/src/components/agent-workspace/AgentProtectedResourcePolicyBadges.tsx`

**Definition of done:**

- Users can protect production-like actions without disabling useful local agent
  work.

**Progress notes:**

- 2026-06-21: Added shared protected-resource matching with global/per-repo
  scope, command/path/branch/environment patterns, Windows path normalization,
  and explicit unsupported-shell evidence for commands that cannot be parsed
  safely.
- 2026-06-21: Added `protectedResourcePolicies` to global settings and surfaced
  policy matches on command run events, approval rows, and run-ledger badges.

### [x] Voice Prompt Mode

**Goal:** Make long natural-language prompts faster to enter.

**MVP checklist:**

- [x] Add a voice input affordance to the agent composer when dictation is
      configured.
- [x] Show recording, transcribing, inserted, and failed states.
- [x] Insert transcript text into the composer without auto-submitting.
- [x] Respect existing voice settings and privacy controls.
- [x] Add tests for composer insertion and disabled-state rendering.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerVoiceButton.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerToolCluster.tsx`
- `src/renderer/src/components/dictation/DictationController.tsx`

**Definition of done:**

- Users can dictate into the composer and review the text before launch.

**Progress notes:**

- 2026-06-21: Added a composer mic affordance that appears for configured or
  partially configured voice settings, focuses the composer before toggling the
  shared dictation controller, and renders disabled, recording, transcribing,
  inserted, and failed states.
- 2026-06-21: Added dictation session events so inserted/failure outcomes can be
  tied back to the focused composer textarea without bypassing existing voice
  settings, model, permission, and privacy checks.

### [x] Run Replay Export

**Goal:** Make debugging, support, and review handoff easier.

**MVP checklist:**

- [x] Export a run ledger as Markdown.
- [x] Include prompt, context manifest, commands, file changes, approvals,
      verification, and final state.
- [x] Redact configured sensitive values and credential-looking strings.
- [x] Add tests for redaction and stable export ordering.

**Likely code areas:**

- `src/renderer/src/components/agent-workspace/agent-run-replay-export.ts`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx`
- `src/renderer/src/components/agent-workspace/orca-agent-workspace-selectors.ts`

**Definition of done:**

- Users can share a useful run report without exposing obvious secrets.

**Progress notes:**

- 2026-06-21: Added deterministic Markdown replay export with summary, prompt,
  launch context manifest when captured, run ledger, file changes, approvals,
  verification, timeline, and final thread state.
- 2026-06-21: Added redaction for explicit sensitive values, bearer tokens,
  token-like credentials, secret assignments, and URL secret parameters, plus a
  Details-tab Copy replay action.

## Suggested Build Order

1. Agent Flight Recorder
2. Context Tray
3. Verification Contract MVP
4. Risk-Gated Action Labels
5. Review-Only Agent Mode
6. Queued Follow-Ups
7. Agent Run Board MVP
8. Provider Task-Fit Hints
9. Memory Inspector
10. Protected Resource Policy
11. Best-Of-N Worktree Compare
12. Run Replay Export
13. Voice Prompt Mode

## First Slice Recommendation

Build the Agent Flight Recorder first, but keep the first slice intentionally
narrow:

- [ ] Add a run ledger model that can store terminal-derived events.
- [x] Show commands and run state in the right panel.
- [x] Show changed files and verification state in the right panel.
- [x] Do not try to fully parse every agent's private protocol yet.
- [x] Add unsupported/partial telemetry states from the beginning.
- [ ] Prove the data does not leak between threads, tabs, worktrees, or SSH
      sessions.

This slice makes later context, verification, risk, and replay features easier
because they can all attach to the same run-event spine.
