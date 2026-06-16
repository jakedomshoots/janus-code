# RC Rollout

## Build

Run the release workflow with:

- kind: `rc`
- ref: `feature/t3code-gui-workspace`
- dry_run: `false`

## Validate

- Download macOS arm64 DMG from the GitHub RC release.
- Install into `/Applications`.
- Launch once from Finder.
- Confirm Gatekeeper accepts the notarized build.
- Confirm the app opens into the GUI-first workspace.
- Confirm in-app update can see the next RC after a second RC is cut.

## Promote

Promote to stable only after the manual QA checklist in
`docs/release/manual-qa-gui-first.md` is complete.
