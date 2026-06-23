# Janus Chat UI Operability Loop

This folder contains the Looper scaffold for turning the Janus Code chat UI
workflow into a polished, high-operability ADE surface.

## Files

- `loop.yaml`: editable source spec.
- `loop.resolved.json`: compiled spec read by the runner.
- `LOOP.md`: human-readable rendering and ASCII flow preview.
- `RUN_IN_SESSION.md`: default handoff prompt for running in the current LLM session.
- `run-loop.py`: advanced external executor copied from the Looper template.
- `loop-workspace/`: run artifacts such as `plan.md`, delivery notes,
  `state.json`, `run-log.md`, screenshots, and installed-app smoke notes.

## Default Path

Use `RUN_IN_SESSION.md` in this Codex thread. The external Python runner is
available for later repeatable execution, but the current-session path is the
right fit while actively fixing and verifying the Janus UI.

## Privacy

The generated spec defines reviewer and judge members, but cross-model or
external CLI sends require explicit first-send consent. Redactions default to
`.env`, `.env.*`, `secrets/**`, and `**/*.key`.
