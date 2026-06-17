# Janus GUI Polish Handoff

This handoff captures the remaining Janus Code GUI polish work after the browser
workbench integration landed. It is written for a follow-up coding agent that
should continue from the current `feature/t3code-gui-workspace` branch without
rebuilding the browser or agent orchestration stacks from scratch.

## Current State

- The chat composer has a browser workbench button next to the terminal button.
- The button creates or reuses an existing Orca browser tab for the active
  worktree, focuses the active browser page through `focusBrowserTabInWorktree`,
  and opens the preserved workbench drawer with a browser-specific title.
- This intentionally reuses Orca's existing browser implementation instead of
  mounting a second `BrowserPane`. Do not add another independent `BrowserPane`
  tree for the same tab; the terminal/worktree surface already documents that
  duplicate webview trees can race over the same Electron webview.
- The installed local app was refreshed at `/Applications/Janus Code.app` from
  `dist/mac-arm64/Janus Code.app`.

Important files:

- `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerFooter.tsx`
- `src/renderer/src/components/agent-workspace/AgentTerminalDrawer.tsx`
- `src/renderer/src/components/agent-workspace/agent-terminal-visibility.ts`
- `src/renderer/src/components/browser-pane/BrowserPane.tsx`
- `src/renderer/src/components/browser-pane/useGrabMode.ts`
- `src/renderer/src/store/slices/browser.ts`
- `src/renderer/src/components/Terminal.tsx`
- `src/renderer/src/components/browser-pane/BrowserPaneOverlayLayer.tsx`

## 1. Make Browser A First-Class Workspace Tab

Problem:

The browser workbench is correctly wired, but it still feels like a drawer
opened from chat. The next polish target is making Browser feel like a native
Janus workspace tab alongside agent sessions.

Suggested direction:

- Add a browser tab affordance into the agent workspace tab strip or a sibling
  workbench tab strip.
- Reuse the existing browser tab state from `browserTabsByWorktree`,
  `activeBrowserTabIdByWorktree`, and `focusBrowserTabInWorktree`.
- Keep the actual rendering in the existing Orca worktree/browser surface unless
  a single-owner webview mount point is designed. Avoid duplicate `BrowserPane`
  mounting.
- If a new visual tab is introduced, it should activate the existing browser
  workbench and not create another browser page unless no browser tab exists.

Acceptance:

- Opening Browser from Janus shows the same browser tab if one already exists.
- Creating a browser from Janus creates exactly one browser workspace/page.
- Browser tab label, close behavior, and active state are obvious.
- Switching between agent sessions and Browser does not reload the webview.
- Grab and annotation controls still work in the browser toolbar.

## 2. Add Visible Annotation Handoff To Agent Sessions

Problem:

Orca can grab and annotate browser elements, but Janus does not yet make the
agent handoff visible from the GUI. Users need to understand how annotations
become agent context.

Suggested direction:

- Add a visible "Attach browser context" or "Send annotations" affordance in the
  browser workbench or composer context row.
- Reuse existing browser annotation output helpers:
  `formatGrabPayloadAsText` and `formatBrowserAnnotationsAsMarkdown`.
- Preserve the existing browser annotation data shape from
  `shared/browser-grab-types`.
- Prefer adding annotations to the composer draft or active agent send payload
  over creating a parallel annotation store.

Acceptance:

- User can annotate one or more elements and see a clear way to attach them to
  the current agent session.
- Attached browser context is visible before sending.
- Sent context includes page URL/title and element annotation text.
- Empty annotation state has a disabled or explanatory action, not a dead button.

## 3. Turn Terminal And Browser Into A Compact Tool Cluster

Problem:

Terminal and Browser are currently icon buttons in the composer footer. That is
functional, but it will scale poorly as Files, Diff, Context, Preview, or other
tools are added.

Suggested direction:

- Create a small tool cluster component for composer-adjacent workspace tools.
- Keep controls compact and icon-led, with accessible labels and tooltips.
- Candidate tools: Browser, Terminal, Files/Diff, Context.
- Do not add explanatory in-app copy around the cluster; make the buttons work
  and keep the composer focused on prompting.

Acceptance:

- Terminal and Browser buttons remain available and correctly wired.
- Button layout does not wrap awkwardly on narrow windows.
- Every icon button has `aria-label` and a tooltip/title.
- The composer footer still fits model, provider, permissions, thinking, and
  send controls without visual crowding.

## 4. Polish Multi-Pane Agent Orchestration

Problem:

The GUI pane/session tabs are functional, but they still do not feel as natural
as a browser tab system or Orca's original multi-pane orchestration.

Suggested direction:

- Improve tab naming for draft sessions, running sessions, and browser tabs.
- Make active pane state clearer without adding heavy outlines everywhere.
- Review split-right, split-down, close-pane, and new-session behavior for
  duplicates and awkward placeholder tabs.
- Consider drag/reorder later, but first make keyboard and click behavior
  predictable.
- Keep implementation in the existing `AgentWorkspaceLayout` and
  `AgentWorkspaceThreadTabs` flow unless a clear abstraction reduces complexity.

Acceptance:

- New session appears once, not duplicated as both placeholder and button.
- Split panes inherit the expected selected session.
- Closing a pane selects a neighboring pane predictably.
- The active pane is visually clear but not noisy.
- Empty panes still provide a direct way to start work.

## 5. Tighten Empty States And First-Run Actions

Problem:

The old scaffold text was removed, but the empty Janus screen can still be more
useful. It should present direct actions, not tutorial text.

Suggested direction:

- Keep the main empty screen centered around "Janus Code".
- Add one action row: New session, Open browser, Open terminal.
- Avoid long descriptive copy or feature explanations.
- Wire the actions to the same code paths used by the composer/workbench.

Acceptance:

- Empty state contains no old Orca branding.
- Empty state action buttons work.
- Browser action creates/reuses a browser tab for the selected worktree.
- Terminal action opens the terminal drawer when a terminal is available.
- No disabled placeholder controls are shown without a clear reason.

## 6. Unify Settings And Permission Entry Points

Problem:

Permissions, thinking mode, provider, model picker, browser access, and
agent/browser context controls are spread across the composer and workbench.
They should feel like one coherent control system.

Suggested direction:

- Keep the current permission, thinking, provider, and model selects in the
  composer for now.
- Add browser context permission/state near the browser handoff affordance.
- Consider a single compact "Context" or "Permissions" popover only if it
  reduces clutter without hiding critical state.
- Make sure each provider/model change is still wired through the provider CLI
  launch path in `agent-composer-launch.ts`.

Acceptance:

- Model picker still persists per provider through `settings.agentModelSelections`.
- Permission mode still maps to provider CLI args/env through
  `tui-agent-permissions`.
- Browser context attachment has clear user intent before it is sent.
- No duplicate or conflicting permission controls appear.

## Verification Baseline

The current implementation passed:

```bash
pnpm exec vitest run --config config/vitest.config.ts \
  src/renderer/src/components/agent-workspace/AgentComposer.test.tsx \
  src/renderer/src/components/agent-workspace/AgentComposer.stale-commit.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspacePaneWorkflow.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspacePage.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspaceLayoutProjectActions.test.tsx \
  src/renderer/src/components/agent-workspace/AgentTerminalDrawer.test.tsx

pnpm run typecheck
pnpm run verify:localization-catalog
pnpm run verify:localization-coverage
pnpm run lint:switch-exhaustiveness
pnpm run build:electron-vite
pnpm run build:unpack
git diff --check
```

Known caveats:

- `pnpm run build:cli` may print a nonfatal `/usr/local/bin/orca-dev:
  Permission denied` symlink warning on this machine.
- Desktop UI smoke through `orca computer` is blocked until macOS grants
  Accessibility and Screenshots permissions to
  `/Applications/Janus Code.app/Contents/Resources/Orca Computer Use.app`.
- The local branch was ahead of `release/feature/t3code-gui-workspace` before
  this handoff commit; confirm branch/remotes before pushing.

