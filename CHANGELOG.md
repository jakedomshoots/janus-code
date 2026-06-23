# Changelog

## Unreleased

- Improved Mobile page responsiveness inside the Janus app shell by making its hero breakpoints respond to the page container, not only the outer window.
- Removed inactive Mobile preview slides from keyboard and screen reader navigation so off-stage mock controls cannot receive focus.
- Auto-collapsed the worktree sidebar when the app viewport enters compact widths, preventing active pages from staying mostly offscreen at 320px.
- Let the compact Mobile page scroll vertically so the stacked phone preview and its active controls remain reachable instead of being clipped.
- Improved Retro 95 contrast for worktree sidebar navigation and Mobile page hero copy by using existing Retro foreground/highlight token pairs.
- Stacked Settings navigation/content and Automations list/detail panes at compact widths so keyboard focus no longer lands in offscreen columns.
- Adjusted the Retro 95 background token slightly so small black and white text both meet WCAG AA on the teal app canvas.
- Clamped the GUI agent workspace switcher at compact widths so preserved terminal chrome cannot push focusable controls past the viewport.
- Raised Retro 95 settings section-description contrast when those descriptions sit directly on the teal canvas.
- Improved Retro 95 contrast for selected rows, tabs, setup cards, and nested Settings content while preserving the documented token pairs.
- Removed closed terminal drawers and floating terminals from keyboard navigation, and tightened compact Browser/terminal toolbar behavior so hidden controls do not receive focus.
- Added a visible focus ring for the web-client browser iframe so keyboard users can see when the Browser Workbench page itself is focused.
- Extended the Automations stacked layout through tablet widths so the detail tabs stay within the viewport at 768px.
- Raised Retro 95 workspace-header, setup-guide active-row, selected tab action, and terminal-error contrast using concrete surface/state token pairs.
- Paired the workspace-board repository badge accent background with its documented accent foreground token.
- Switched task-source active filter chips to documented active-state token pairs across providers and themes.
- Added a tokenized hover state to Cmd+J palette result rows so Modern-dark command results have the same visible pointer feedback as Retro.
- Raised Retro 95 Space page hint-copy contrast when the copy sits directly on the teal app canvas.
- Rendered live assistant reply previews in the workspace timeline while CLI agents are still working, reducing the perceived lag between terminal output and composer chat.
- Upgraded workspace assistant replies from plain pre-wrapped text to compact Markdown formatting for headings, lists, code blocks, links, quotes, and tables.
- Echoed running-thread follow-up messages into the workspace timeline immediately while terminal delivery is pending, with failed sends marked locally without dropping the draft.
- Echoed completed-thread follow-up messages immediately while Janus decides whether to reuse the old terminal or launch a continuation agent.
