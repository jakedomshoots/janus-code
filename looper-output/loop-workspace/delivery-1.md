# Delivery 1: Message Turn Contract

## Result

Passed with two non-UI gate blockers documented.

## Fixed

- `P0-composer-retains-sent-follow-up`: completed-thread recovery drafts now clear only after matching transcript evidence, preserving edited drafts.
- `P0-composer-retains-launched-follow-up`: launched fallback prompts now clear once the matching non-failed user entry appears in the new thread timeline.

## Evidence

- `AgentComposer.recovery.test.tsx`: 8 tests passed.
- Focused agent-workspace bundle: 7 files, 222 tests passed.
- `pnpm run typecheck:web`: passed.
- `pnpm run lint:react-doctor:changed`: passed.
- `git diff --check`: passed.
- `pnpm run build:unpack`: passed.
- Installed `/Applications/Janus Code.app` from `dist/mac-arm64/Janus Code.app`; app.asar hash matched: `346dd06be6bf5f0bcfe22c22cde4c4d6538541a9c1406a4a622e41f29f397d06`.
- Live installed-app smoke sent `reply only: final loop smoke ok`; transcript showed user and agent turns; composer stayed blank and Send disabled.

## Honest Blockers

- `pnpm run verify:janus-workflow-assurance` passed its Vitest phase, then failed because direct-download release `.dmg`, `.zip`, and `SHA256SUMS.txt` artifacts are absent.
- `pnpm run smoke:janus-workflow` is blocked until Accessibility is granted to the installed Janus Computer Use helper.

## Next Batch

Batch 2 should audit and wire the visible workflow controls: new session, tabs, pane actions, browser, attach context, terminal, project files, and right-panel tabs.
