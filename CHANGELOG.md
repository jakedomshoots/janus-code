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
