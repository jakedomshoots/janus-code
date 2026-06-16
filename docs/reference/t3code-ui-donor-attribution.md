# T3 Code UI Donor Attribution

The GUI agent workspace keeps Orca as the application base and uses T3 Code as
an interaction and layout reference. The implementation in
`src/renderer/src/components/agent-workspace/` is Orca-local code built on Orca
state, stores, selectors, IPC, source-control helpers, terminal infrastructure,
and style tokens.

## Donor Reference

T3 Code repository: `../t3code`

License: MIT, copyright (c) 2026 T3 Tools Inc. See
`THIRD_PARTY_NOTICES.md` for the preserved license notice.

## Reference Map

| T3 Code reference | Orca destination | Usage |
| --- | --- | --- |
| `apps/web/src/components/AppSidebarLayout.tsx` | `src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx` | Referenced for the three-region app shell pattern. |
| `apps/web/src/components/Sidebar.tsx` | `src/renderer/src/components/agent-workspace/AgentWorkspaceSidebar.tsx` | Referenced for thread/project navigation density. |
| `apps/web/src/components/ChatView.tsx` | `src/renderer/src/components/agent-workspace/AgentWorkspacePage.tsx` | Referenced for the central thread workspace shape. |
| `apps/web/src/components/chat/MessagesTimeline.tsx` | `src/renderer/src/components/agent-workspace/AgentTimeline.tsx` | Referenced for timeline ordering and message grouping behavior. |
| `apps/web/src/components/chat/ChatComposer.tsx` | `src/renderer/src/components/agent-workspace/AgentComposer.tsx` | Referenced for composer placement and provider-aware controls. |
| `apps/web/src/components/PlanSidebar.tsx` | `src/renderer/src/components/agent-workspace/AgentPlanPanel.tsx` | Referenced for plan panel hierarchy. |
| `apps/web/src/components/DiffPanel.tsx` | `src/renderer/src/components/agent-workspace/AgentDiffPanel.tsx` | Referenced for file-list and diff-review panel behavior. |
| `apps/web/src/components/ThreadTerminalDrawer.tsx` | `src/renderer/src/components/agent-workspace/AgentTerminalDrawer.tsx` | Referenced for keeping raw terminal output available as an advanced drawer. |

## Copied Source

No T3 Code source files are copied verbatim into Orca in this checkpoint. If a
future change copies or substantially adapts T3 Code source, update this file
with the copied source path, destination path, and the relevant license notice.
