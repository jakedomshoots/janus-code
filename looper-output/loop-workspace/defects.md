# Janus Real Dev Gauntlet Defects

## JDG-001 - Review Panel Misses Test Evidence From Completed Agent Output

- Severity: P2
- Status: open
- Surface: Agent workspace Review tab
- Repro:
  1. Run the fake-project Codex task asking the agent to run `pnpm test` and `pnpm run build`.
  2. Wait for the GUI response to complete.
  3. Confirm the final chat response lists both commands as passed.
  4. Open the right-panel Review tab.
- Evidence:
  - `gauntlet-completed-state.json`: final chat response includes `pnpm test: passed` and `pnpm run build: passed`.
  - `gauntlet-review-changes.json`: Review tab says `No test command has been captured in this timeline yet.`
- Suspected root cause: review evidence only reads structured tool/test events, not terminal-derived or final-response test evidence from CLI agents.
- Impact: Review mode under-reports verification, making a successful agent run look less trustworthy.
- Next action: inspect review evidence selectors and bridge completed CLI test summaries into the review evidence model, or label the panel more honestly when only structured test events count.

## JDG-002 - Slash Command Picker Still Hidden After Completed-Thread Follow-Up

- Severity: P1
- Status: fixed
- Surface: Completed-thread follow-up composer and terminal/GUI bridge
- Repro:
  1. Complete a Codex agent task in the fake-project worktree.
  2. Type `/model` into the completed-thread follow-up composer.
  3. Click Send.
  4. Inspect the terminal and GUI.
- Evidence:
  - `gauntlet-model-picker.json`: GUI shows `/model` user turn and then only `Agent is typing`.
  - `terminal list` after repro shows the active terminal preview contains numbered model choices and `Press enter to confirm or esc to go back`.
  - Reading the previous terminal handle returns `terminal_handle_stale`.
- Suspected root cause: slash-command prompt projection reads/waits using the pre-send terminal handle; completed-thread continuation can rotate/rebind the terminal handle before the picker appears.
- Impact: user must open the terminal to answer model choices, which breaks the core GUI wrapper promise.
- Fix:
  - Re-resolved the active runtime terminal before slash-command prompt projection.
  - Re-projected chained terminal choices after each GUI selection.
  - Trimmed terminal-history noise before and after numbered picker prompts.
  - Scoped accepted-draft clearing to same-thread phase changes so unrelated thread switches keep the draft.
- Validation:
  - `gauntlet-slash-polished-4-model-picker.json`: GUI shows a clean `/model` model picker with buttons.
  - `gauntlet-slash-polished-4-reasoning-picker.json`: GUI shows a clean chained reasoning picker with buttons.
  - `gauntlet-slash-polished-4-after-choice.json`: final choice returns to a completed thread with no pending approval or typing state.

## JDG-003 - Kimi Persistent TUI Prompt Does Not Execute After GUI Launch

- Severity: P1
- Status: open blocker
- Surface: Kimi agent launch/send adapter
- Repro:
  1. Create a fake-project worktree with `--agent kimi`.
  2. Launch with prompt `Reply exactly: kimi gui bridge ready.`
  3. Wait for GUI transcript completion.
- Evidence:
  - `gauntlet-kimi-live-wait.json`: installed GUI remains on the empty Janus Code hero for the Kimi workspace.
  - Runtime terminal `term_45ed6c17-76fe-4393-a045-e7d29a280cc6` is connected and writable.
  - Terminal read shows the prompt text and Kimi banner, but no submitted response.
  - Sending Enter directly to the terminal did not execute the prompt.
- Suspected root cause: Kimi's persistent TUI does not accept Janus' shared bracketed-paste-plus-Enter submit path. Kimi exposes `--prompt`, but that is non-interactive print mode and would not preserve the ADE chat workflow.
- Impact: Codex and OpenCode are usable through the GUI bridge, but Kimi is not ready for real project work from the Janus GUI.
- Next action: build a Kimi-specific persistent TUI submit adapter or Kimi ACP/server adapter, then replay the same fake-project GUI gauntlet.
