# Janus GUI Polish Status

This note captures the current Janus Code GUI state on
`feature/t3code-gui-workspace`. The six polish items below are implemented in
the source tree and are intended to preserve Orca's native browser,
annotation, terminal, and workspace orchestration plumbing while presenting them
through the Janus chat-first GUI.

## Current State

- Browser workbench access is centralized in
  `src/renderer/src/components/agent-workspace/useAgentBrowserWorkbench.ts`.
- The composer, empty state, and workspace tab strip all use the same browser
  workbench path instead of each creating separate browser behavior.
- Browser tabs are still owned by Orca's existing browser store and worktree
  surface. Do not mount a second independent `BrowserPane` for the same page.
- Browser annotations can be attached into the composer draft through the tool
  cluster before the user sends a prompt.
- Terminal and browser controls are grouped into one compact composer tool
  cluster.
- Empty workspace panes show only `Janus Code` plus direct actions.

Important files:

- `src/renderer/src/components/agent-workspace/useAgentBrowserWorkbench.ts`
- `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerFooter.tsx`
- `src/renderer/src/components/agent-workspace/AgentComposerToolCluster.tsx`
- `src/renderer/src/components/agent-workspace/AgentTimeline.tsx`
- `src/renderer/src/components/agent-workspace/AgentWorkspacePane.tsx`
- `src/renderer/src/components/agent-workspace/AgentWorkspaceThreadTabs.tsx`
- `src/renderer/src/components/browser-pane/BrowserPane.tsx`
- `src/renderer/src/components/browser-pane/useGrabMode.ts`
- `src/renderer/src/components/browser-pane/browser-annotation-output.ts`
- `src/renderer/src/store/slices/browser.ts`

## 1. Browser As A First-Class Workspace Tab

Implemented:

- `AgentWorkspaceThreadTabs` now includes a Browser tab affordance when the
  selected worktree can open the browser workbench.
- The tab displays the existing browser tab count from
  `browserTabsByWorktree`.
- Clicking Browser focuses the current pane, creates a browser tab only if one
  does not exist, focuses the active browser page with
  `focusBrowserTabInWorktree`, and opens the existing browser drawer.

Design note:

- The Browser tab is an activation affordance for the preserved Orca browser
  surface. It intentionally does not create a second webview mount point.

## 2. Visible Annotation Handoff To Agent Sessions

Implemented:

- The composer tool cluster includes an Attach browser context button.
- The action is disabled until the active browser page has annotations.
- When used, it appends the current annotations to the composer draft using
  `formatBrowserAnnotationsAsMarkdown`.
- The composer shows `Browser context attached.` after the handoff.

Acceptance covered:

- Browser context is visible in the draft before sending.
- Attached context includes the existing annotation markdown shape from Orca's
  browser annotation helpers.
- Empty annotation state is disabled instead of acting like a dead control.

## 3. Compact Terminal And Browser Tool Cluster

Implemented:

- `AgentComposerFooter` now renders a `ComposerToolCluster`.
- The cluster contains Browser, Attach browser context, and Terminal controls.
- Each control has accessible labels and titles.
- Annotation count is shown as a compact badge on the attach button.

Future candidate:

- Files, Diff, Preview, and Context controls should join this same cluster if
  they are added later.

## 4. Multi-Pane Agent Orchestration Polish

Implemented:

- Workspace thread tabs now mix agent session tabs and the Browser workbench tab
  in the same horizontal strip.
- Split and close controls remain in the existing pane chrome.
- Empty panes route through the same `onNewSession`, browser, and terminal
  callbacks used elsewhere, so there are no duplicate placeholder buttons.

Still worth checking manually:

- Multi-pane keyboard behavior.
- Pane close selection after several split/close cycles.
- Whether Browser should show active styling after the drawer is open.

## 5. Empty States And First-Run Actions

Implemented:

- Empty timeline state now shows only `Janus Code`.
- The action row contains New session, Browser, and Terminal when available.
- Browser and Terminal actions call the same workbench/drawer plumbing used by
  the composer.

Acceptance covered:

- No old Orca branding appears in this empty state.
- No long tutorial copy is shown.
- Unavailable Browser or Terminal actions are hidden instead of shown as broken
  placeholders.

## 6. Unified Settings, Permission, And Context Entry Points

Implemented:

- Provider, model, permission, and thinking controls remain in the composer
  footer where the agent launch plumbing already reads them.
- Browser context handoff now lives beside terminal/browser tools rather than in
  a separate panel.
- The model picker remains wired through the existing selected agent/provider
  flow and persists via `settings.agentModelSelections`.

Still worth checking manually:

- Launch each provider CLI once from the GUI and verify the chosen model is
  passed through the provider-specific launch path.
- Confirm permission mode still maps correctly for Codex, Claude, and any other
  enabled CLI agents.

## Verification Baseline

This implementation passed:

```bash
pnpm exec vitest run --config config/vitest.config.ts \
  src/renderer/src/components/agent-workspace/AgentComposer.test.tsx \
  src/renderer/src/components/agent-workspace/AgentComposer.stale-commit.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspacePaneWorkflow.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspacePage.test.tsx \
  src/renderer/src/components/agent-workspace/AgentWorkspaceLayoutProjectActions.test.tsx \
  src/renderer/src/components/agent-workspace/AgentTerminalDrawer.test.tsx

pnpm run typecheck
pnpm run sync:localization-catalog
pnpm run verify:localization-catalog
pnpm run verify:localization-coverage
pnpm run lint:react-doctor:changed
pnpm run lint:switch-exhaustiveness
pnpm run build:electron-vite
```

Known caveats:

- `pnpm run lint:react-doctor:changed` reports an existing
  `no-derived-state-effect` warning in `AgentComposer.tsx`; the command exits
  successfully.
- `pnpm run build:cli` or packaging may print a nonfatal
  `/usr/local/bin/orca-dev: Permission denied` symlink warning on this machine.
- Desktop UI smoke through `orca computer` still depends on macOS Accessibility
  and Screenshots permissions for
  `/Applications/Janus Code.app/Contents/Resources/Orca Computer Use.app`.
