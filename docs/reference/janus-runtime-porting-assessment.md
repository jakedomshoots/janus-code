# Janus Runtime Porting Assessment

## Decision

Do not start with a full Rust or Tauri rewrite. Keep Electron as the production
desktop host and port only native/runtime responsibilities that can prove a
measurable reliability or maintenance win behind the existing runtime boundary.

The first migration target is the local runtime substrate: PTY lifecycle,
process supervision, filesystem watching, runtime diagnostics, and other
host-side services that do not depend on Electron's browser or window model.

## Current Boundaries

- `src/preload/index.ts` and `src/preload/api-types.ts` are the audited renderer
  contract. Any new host path must preserve this contract or replace one domain
  at a time with compatibility tests.
- `src/main/runtime/runtime-rpc.ts` already provides a transport boundary used
  by local, web, and paired runtime clients. New native services should attach
  behind that boundary instead of creating new renderer-facing channels.
- The embedded browser workbench depends on Electron-specific guest, session,
  permission, download, and annotation behavior. It is not a first-wave porting
  candidate.

## Porting Candidates

Port these only after a small contract test proves the current behavior:

- PTY lifecycle: spawn, write, resize, signal, kill, cold restore, and output
  replay.
- Process supervision: child process cleanup, foreground process detection,
  long-running agent health, and restart diagnostics.
- Filesystem and workspace scanning: watchers, large workspace scans, and
  path-normalized file operations.
- Runtime diagnostics: health checks, structured logs, protocol version checks,
  and crash containment for native-side failures.

Keep these in Electron/TypeScript until a dedicated spike proves parity:

- Browser workbench, browser profiles, grab/annotation, downloads, popups, and
  context menus.
- App shell behavior: windows, menus, dock/tray, updater, packaging identity,
  and platform-specific desktop chrome.
- Provider and review integrations unless a measured hotspot justifies moving a
  narrow parser or transport helper.

## Increment Rule

Each migration change must be small enough to verify before the next one starts:

1. Add or update a focused test that describes the compatibility contract.
2. Make the smallest implementation change behind a feature flag or adapter.
3. Run the focused test and a repo-level guard appropriate to the touched area.
4. Leave the fallback path intact until macOS, Linux, Windows, SSH, and web
   runtime behavior are covered.

## First Implementation Slice

The first code slice should not introduce Rust yet. It should define a typed
host/runtime classification for the preload API domains and add tests that prove
the existing Electron and web runtime adapters agree on one low-risk domain.

Machine-readable contract: domain `runtime-status-diagnostics` maps to runtime
RPC method `status.get`.

Recommended first domain: runtime status and diagnostics. It has clear request
and response shapes, does not require browser parity, and gives future native
sidecars a small compatibility target before touching PTY behavior.
