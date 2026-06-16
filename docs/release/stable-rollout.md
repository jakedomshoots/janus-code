# Stable Rollout

## Preconditions

- Latest RC passed manual QA.
- Latest RC update flow passed.
- `pnpm run typecheck` passed.
- `pnpm run lint` passed.
- `pnpm run test` passed.
- `pnpm run test:e2e` passed.
- Required release assets were verified for the RC tag.

## Build

Run the release workflow with:

- kind: `patch`
- ref: `feature/t3code-gui-workspace`
- dry_run: `false`

## Publish

- Verify GitHub Release assets.
- Verify the release is not a draft.
- Download and install macOS arm64 artifact.
- Download and install Windows artifact on a Windows host.
- Download and run Linux AppImage on an Ubuntu host.
