# Janus Chat UI Operability Plan

## Goal

Make the installed Janus Code chat workflow reliable enough to use as the
primary project work surface. The workflow must hold together from project
selection through first prompt, agent progress, completed response, follow-up,
terminal/browser/context actions, right-panel inspection, and repeated use.

## Source Context Read

- `docs/STYLEGUIDE.md`: quiet monochrome app chrome, token-first styling,
  shadcn primitives, real focus states, concise state-backed copy, no dead or
  overclaiming controls, SSH/latency-aware feedback.
- `src/renderer/src/assets/main.css`: current floating right panel reserves a
  wide-window chat gutter at `1180px+`; below that the panel overlays the chat
  surface. Retro 95 overrides also affect composer/timeline density.
- `AgentWorkspaceLayout.tsx`: owns selected thread, right panel state, local
  optimistic user timeline entries, and source-control/right-panel routing.
- `AgentWorkspacePane.tsx`: composes thread tabs, timeline, composer, browser
  workbench, tab-group workbench, and terminal drawer callbacks.
- `AgentTimeline.tsx` / `AgentTimelineEntry.tsx`: timeline is an aria-live log,
  auto-scrolls by latest text, renders summary, bubbles, markdown, artifacts,
  and edited-file cards.
- `AgentComposer*.tsx` and submit helpers: send readiness, selected-agent
  setup, completed-thread recovery, optimistic echo, prompt clearing, browser
  context attachment, terminal recovery, and delivery-state strip are split
  across several hooks.
- `useAgentWorkspacePanes.ts`: owns draft tabs and selects newly launched
  threads. Recent fix follows `starting` threads immediately.
- `AgentWorkspaceRightPanel.tsx`: absolute floating card with tabs for output,
  diff, review, info, and context/detail surfaces.
- `AgentTerminalDrawer.tsx`: fixed bottom drawer, no current resize handle in
  this worktree version.
- `launch-agent-in-new-tab.ts`: owns startup and prompt delivery timing across
  inline, draft, and submit-after-ready paths.
- Live installed app: completed-thread follow-up transcript and agent reply are
  visible, but the composer still contains the sent prompt and Send remains
  enabled.

## Initial Findings

### P0-composer-retains-sent-follow-up

The installed app currently shows a completed-thread follow-up where the user
message and agent reply are both visible, but the composer still contains the
sent text. This makes the chat workflow unsafe for repeated use: the user can
accidentally resend a stale prompt, and the surface no longer communicates that
the turn is done.

Likely ownership: `useAgentComposerSubmit`, `AgentComposer`, controlled
textarea handling, and completed-thread follow-up/recovery cleanup. Also verify
the assistive/AX input path because Computer Use can set text differently than
normal keyboard typing.

### P1-right-panel-overlay-and-chat-rail-fragility

The right panel is now an absolute floating surface. At wide widths the CSS
reserves right-side chat/composer gutter, but below `1180px` the right panel
can still overlay the active work area. That may be acceptable as a temporary
overlay, but for an ADE-grade workflow it needs explicit responsive behavior:
collapse, dock, or provide a clear dismissal path before it blocks chat.

### P1-tooling-affordance-confidence

The composer/tool/header controls need a whole-workflow pass: browser, attach
context, terminal, project files, output/diff/review/info/context tabs, approval
actions, and artifact actions must either work or be visibly unavailable with a
specific reason. Icon-only buttons need accessible labels and familiar hover /
focus behavior.

### P1-state-truth-and-stale-context

The right panel summarizes workspace/thread state and can show multi-agent,
sources, plan, and diff counts. Prior defects leaked stale counts from older
threads. The loop must verify every visible count and state label against the
selected thread/workspace snapshot after launching and switching threads.

### P2-visual-density-and-polish

Current chat composition is usable in places but still reads like stitched
subsystems: big empty vertical space, floating card competing with bubbles,
status strips mixed with controls, and terminal/browser surfaces feeling bolted
on. The polish pass should make this feel like one serious operational surface.

## Iteration Strategy

### Batch 1: Message Turn Contract

Fix the highest-risk message workflow first.

- Reproduce and cover composer stale-text retention after completed-thread
  follow-up.
- Verify normal typing and accessibility/set-value style input if feasible.
- Ensure prompt clearing only happens after delivery is truly represented in
  the transcript or recoverable state is intentionally shown.
- Preserve failed-send recovery: do not drop draft text on errors.
- Add focused tests in existing smaller test files, avoiding max-lines growth
  in oversized suites.
- Update `CHANGELOG.md`.

Expected score impact: high. This directly controls whether Janus can be used
for repeated chat turns.

### Batch 2: Workflow Navigation And Control Wiring

Audit and fix the full path of visible controls.

- New session, thread tabs, close thread, new tab, pane actions.
- Browser workbench and attach-context fallback.
- Terminal drawer open/close and recovery entry points.
- Project files action and right-sidebar/right-panel interaction.
- Output, diff, review, info, and context/detail tabs.
- Artifact open/review actions.
- Approval actions if a requested-approval state is present in fixtures.

Expected score impact: high. This removes dead-end and “looks clickable but
doesn’t help” behavior.

### Batch 3: State Truth And Recovery

Make state labels and recovery affordances trustworthy.

- Verify selected thread identity, phase, agent kind, branch, plan, diff,
  sources, and subagent counts after thread switching and launches.
- Keep local optimistic user entries ordered and suppressed correctly when the
  backend catches up.
- Ensure completed-thread recovery controls disappear only after both the user
  prompt and next agent entry appear.
- Make error/blocked messages specific and action-oriented.

Expected score impact: medium-high. This prevents Janus from feeling haunted by
old work or unclear recovery states.

### Batch 4: Responsive Layout And Focus

Make the interface stable at practical desktop and compact widths.

- Exercise 320px, 768px, and 1440px through Playwright or installed-app
  screenshots where possible.
- Ensure the floating right panel cannot block active composer/timeline use.
- Verify terminal drawer does not steal unreachable space.
- Check tab order, focus-visible rings, Enter/Esc behavior, aria-live status,
  and icon-button labels.

Expected score impact: medium-high. This turns a stitched UI into a dependable
desktop tool.

### Batch 5: ADE Polish Pass

Refine the whole screen as one high-end operational product.

- Align timeline, composer, and panel rhythm.
- Reduce generic filler and repeated metadata.
- Keep high-frequency actions visible and push detail into side surfaces.
- Make progress states calm, readable, and backed by real state.
- Avoid new color/shadow/radius inventions; use documented tokens and shadcn
  primitives.

Expected score impact: medium. This is where the workflow stops feeling
patched together.

## Verification Matrix

Programmatic checks for each delivery gate:

- `pnpm vitest run --config config/vitest.config.ts src/renderer/src/components/agent-workspace/AgentWorkspacePaneWorkflow.test.tsx src/renderer/src/components/agent-workspace/AgentComposer.test.tsx src/renderer/src/components/agent-workspace/AgentComposer.recovery.test.tsx src/renderer/src/components/agent-workspace/AgentTerminalDrawer.test.tsx src/renderer/src/components/agent-workspace/agent-workspace-pane-thread-selection.test.ts src/renderer/src/lib/launch-agent-in-new-tab.test.ts src/renderer/src/components/terminal-pane/pty-connection.test.ts`
- `pnpm run verify:janus-workflow-assurance`
- `pnpm run typecheck:web`
- `pnpm run lint:react-doctor:changed`
- `git diff --check`
- `pnpm run build:unpack`
- `pnpm run smoke:janus-workflow`

Installed-app/manual evidence required before any ready claim:

- Reinstall `/Applications/Janus Code.app` from the built app.
- Verify app.asar hash match.
- In the installed app, run a real project chat smoke: new session, send prompt,
  user bubble appears, agent response appears, composer clears or shows only
  intentional recovery, follow-up works, browser/terminal/project-files actions
  route correctly, right panel tabs are not stale, no dead controls, no layout
  overlap.

## Plan Gate Verdict

Current-session operability judge result:

```json
{
  "verdict": "pass",
  "blocking_issues": [],
  "confidence": 0.82,
  "notes": "The plan covers the full Janus chat workflow rather than isolated widgets, starts with the live P0 repeated-turn defect, includes programmatic and installed-app evidence, preserves styleguide constraints, and has clear no-progress stops. The first delivery should be Batch 1."
}
```
