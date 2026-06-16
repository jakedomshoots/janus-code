# GUI Workspace Runtime Signal Map

Date: 2026-06-16

This map identifies the structured Orca runtime signals that can power the GUI
agent workspace without parsing terminal text. It also calls out gaps that need
runtime enrichment before the GUI can behave like a first-class desktop agent
surface.

## Sources Reviewed

- `src/shared/agent-status-types.ts`
- `src/main/agent-hooks/server.ts`
- `src/renderer/src/store/slices/agent-status.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/shared/runtime-client-events.ts`
- `src/main/runtime/rpc/methods/client-events.ts`
- `src/main/runtime/rpc/methods/terminal.ts`
- `src/main/runtime/rpc/methods/git.ts`
- `src/main/runtime/orca-runtime.ts`
- `src/main/runtime/orchestration/types.ts`
- `src/renderer/src/components/right-sidebar/git-status-refresh.ts`

## Classification Key

- `structured and ready`: The renderer can consume a typed source today.
- `structured but missing fields`: A typed source exists, but GUI needs extra
  fields or a more explicit lifecycle event.
- `terminal-only`: The only current source is terminal stream or terminal text.
- `not currently available`: No reliable provider-neutral source exists.

## Signal Coverage

| GUI signal | Current source | Classification | Notes |
| --- | --- | --- | --- |
| Agent started | `AgentStatusPayload.state === "working"` via `agentStatus:set`; startup can also seed `initialAgentStatus` in `pty-connection.ts`. | structured but missing fields | Usable as a start signal, but it is a state snapshot rather than a distinct start event. It lacks stable turn id, explicit start reason, and sometimes provider session metadata. |
| Agent output received | `terminal.subscribe` / `terminal.multiplex` streams terminal data chunks. | terminal-only | Output is live and subscribable, but it is raw terminal bytes/text. GUI timeline should not infer semantic assistant messages from this stream except as a debug transcript. |
| Agent waiting for input | `AgentStatusPayload.state === "waiting"` and renderer `AgentStatusEntry.state`. | structured and ready | This is typed and already flows through the agent-status store. Some fallback readiness still depends on recognized OSC/title behavior for unsupported agents. |
| Approval requested | Agent hooks can normalize approval-like states to `waiting`; Claude permission stickiness is handled in `agent-hooks/server.ts`; tool context may include `toolName` and `toolInput`. | structured but missing fields | The GUI can show "needs attention", but there is no provider-neutral `approvalRequested` event with approval id, command/tool payload, risk level, or approved/denied lifecycle. |
| Tool/action started | `toolName` and `toolInput` on `AgentStatusPayload` / `AgentStatusEntry` while state is usually `working`. | structured but missing fields | The renderer receives the current tool snapshot, not a durable tool event. Main sees hook event names and ids for some providers, but those are not exposed in `AgentStatusIpcPayload`. |
| Tool/action completed | Provider hooks can emit post-tool data, but the renderer sees only the latest status snapshot. | structured but missing fields | There is no GUI-ready event with tool id, result status, duration, stdout/stderr summary, or error. The GUI can only infer completion when the current tool fields change or clear. |
| Diff changed | `git.status` returns `GitStatusResult`; Source Control stores entries in `gitStatusByWorktree`; GUI diff selectors already map those entries to `AgentWorkspaceDiffSummary`. | structured and ready | Data is structured today. It is poll/refresh driven rather than a push event for every file-system change, so the GUI should treat it as the latest known source-control state. |
| Plan proposed | No provider-neutral runtime/source-store signal currently fills `AgentWorkspaceSnapshot.plans`. | not currently available | T3-style plan rendering needs a structured plan source. Terminal text and assistant prose should not be parsed as the primary plan contract. |
| Agent completed | `AgentStatusPayload.state === "done"` plus optional `lastAssistantMessage`, `interrupted`, provider session metadata, and retained done rows. | structured and ready | This is typed and usable for timeline completion, thread phase, and final assistant summary. |
| Agent failed | Orchestration has `TaskStatus` / `DispatchStatus` failure states; terminal exit and `terminal.wait` expose exit state; generic agent-status does not include `failed`. | structured but missing fields | The GUI can represent orchestration worker failure and terminal exit, but provider-neutral agent failure needs an explicit status or failure event with reason, exit code, and recoverability. |
| Terminal disconnected | Runtime terminal state reports `running`, `exited`, or `unknown`; `terminal.wait` resolves exit; `RuntimePtyWorktreeRecord.connected` tracks disconnected PTYs. | structured and ready | This is usable for drawer/session health and debug fallback. The terminal stream ending should be treated as transport/session status, not agent completion. |

## Existing Structured Data Worth Reusing

- `AgentStatusEntry` already provides `state`, `prompt`, `agentType`,
  `updatedAt`, `stateStartedAt`, `paneKey`, `terminalHandle`, `worktreeId`,
  `tabId`, `terminalTitle`, `stateHistory`, `toolName`, `toolInput`,
  `lastAssistantMessage`, `interrupted`, `orchestration`, and
  `providerSession`.
- `runtimeAgentOrchestrationByPaneKey` can attach task/dispatch lineage to live
  or retained agent rows.
- `gitStatusByWorktree` is already the right source for GUI diff summaries.
- `terminal.list`, `terminal.read`, `terminal.subscribe`,
  `terminal.multiplex`, `terminal.wait`, and `terminal.inspectProcess` are the
  right debug/terminal support APIs.
- `runtime.clientEvents.subscribe` currently pushes repo/worktree/activation
  events, but not per-agent lifecycle or git-diff events.

## Recommended Enrichment Order

1. Add a provider-neutral structured plan source:
   `plansByPaneKey` or `plansByThreadId` with title, explanation, ordered steps,
   status, markdown, and updatedAt.
2. Add explicit approval lifecycle events:
   requested, approved, denied, expired, with stable approval id and tool/command
   payload.
3. Promote tool lifecycle from snapshot fields to events:
   started, completed, failed, with stable tool id, name, input summary, output
   summary, duration, and provider hook metadata.
4. Add an explicit provider-neutral agent failure status or event:
   failed with reason, exit code when available, source (`hook`, `terminal`,
   `orchestration`), and recoverability.
5. Extend `runtime.clientEvents.subscribe` or add an agent-workspace stream for
   push updates instead of requiring GUI panels to poll multiple stores.
