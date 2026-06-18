# Retro 95 Default Theme Implementation Plan

## Goal

Make Retro 95 the default Janus Code interface while preserving the current Janus Code styling as the modern alternative. This is a visual operating-system skin, not a workflow redesign.

## Product Meaning

Janus represents beginnings and endings. Retro 95 is the beginning: early tactile desktop software, sharp edges, explicit controls, and dense system UI. Modern remains the ending: the current polished Janus interface, available as Modern Auto, Modern Dark, and Modern Light.

## Non-Goals

- Do not move major workflows.
- Do not change routing, persistence, auth, API calls, runtime behavior, keyboard shortcuts, or agent orchestration.
- Do not manually reskin every screen with one-off classes unless a component has hardcoded styling that tokens cannot reach.

## Implementation Phases

1. Theme model
   - Add `retro95` to the persisted app theme preference.
   - Default new profiles and corrupt-state fallback defaults to `retro95`.
   - Resolve `retro95` to light mode for subsystems that only understand light/dark/system.
   - Keep `system`, `dark`, and `light` as modern alternatives.

2. Theme application
   - Add root classes `theme-retro95` and `theme-modern`.
   - Keep `dark` and `light` resolved classes for compatibility with Tailwind and existing color logic.
   - Map Electron `nativeTheme.themeSource` through modern-compatible values.

3. Central tokens
   - Define Retro 95 tokens in global CSS: `--win-bg`, `--win-surface`, `--win-titlebar`, bevel colors, text colors, highlight colors, system fonts, and monospace font.
   - Map existing app tokens like `--background`, `--card`, `--border`, `--accent`, and sidebar tokens to the Retro 95 palette.

4. Shared surface skin
   - Skin shared buttons, inputs, dialogs, popovers, dropdowns, panels, scrollbars, titlebars, and common rounded containers through global selectors and primitives.
   - Preserve component behavior and accessibility.

5. Settings and onboarding
   - Add Retro 95 as the first/default theme choice.
   - Rename existing choices to Modern Auto, Modern Dark, and Modern Light.
   - Show a Retro 95 preview tile.

6. Focused screen polish
   - Patch only high-visibility hardcoded surfaces that tokens cannot reach: main shell, agent workspace, composer, right panel, settings groups, browser/workbench shells.
   - Avoid changing click behavior or layout ownership.

7. Verification
   - Run focused theme tests.
   - Run typecheck, lint, web build, mac build.
   - Reinstall `/Applications/Janus Code.app` from the new build.
   - Commit and push.

## Completion Evidence

- `getDefaultSettings()` returns `theme: 'retro95'`.
- `applyDocumentTheme('retro95')` applies `theme-retro95` and light-compatible root classes.
- Appearance settings can switch between Retro 95 and modern alternatives.
- Terminal/color-scheme consumers resolve Retro 95 safely.
- The app builds successfully.
