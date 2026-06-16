# GUI Workspace Transition

Orca is now GUI-first for agent workspaces. New profiles default to the GUI agent workspace, where projects, agent threads, plans, diffs, hosted reviews, approvals, and provider-aware composer controls are visible without making the terminal the primary surface.

The classic terminal workspace remains available as a fallback. Users can enable it from Settings > Experimental > Classic terminal workspace. Enabling that option makes the terminal-first workspace primary again.

xterm remains part of the app by design. Agent CLIs still execute through terminal infrastructure, and the GUI workspace keeps the terminal available as a debug drawer for raw output, troubleshooting, and workflows that still need direct shell access.
