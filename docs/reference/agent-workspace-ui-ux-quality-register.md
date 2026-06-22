# Agent Workspace UI/UX Quality Register

This register tracks the end-to-end UI/UX quality loop for the competitive
agent-workspace upgrade. It is intentionally evidence-based: each issue needs a
reproduction path, expected behavior, actual behavior, fix status, and
verification method.

## 100-Point Rubric

| Category | Points | Evidence required |
| --- | ---: | --- |
| Workflow completeness | 15 | First launch, project setup, workspace entry, agent launch, follow-up, review, run inspection, and export paths are reachable. |
| Visual hierarchy and layout | 15 | Primary actions are visible, scan order is clear, no overlap/clipping at desktop and narrow widths, and layouts follow `docs/STYLEGUIDE.md`. |
| Interaction clarity | 12 | Buttons, tabs, popovers, disabled states, queued follow-ups, review-only actions, and panel controls have clear labels and state transitions. |
| Trust and evidence | 12 | Context, run ledger, approvals, risk labels, verification, diffs, memory, replay, and protected-resource states match real underlying data. |
| Empty/loading/error/success states | 10 | First-run, no project, no thread, partial telemetry, unsupported runtime, failed verification, empty diffs, and empty memory states are explicit. |
| Accessibility and keyboard | 10 | Landmarks, accessible names, focus defaults, tab order, keyboard labels, and disabled explanations are usable. |
| Responsiveness | 8 | Desktop, smaller desktop, and narrow/mobile-like widths keep primary workflows visible and readable. |
| Copy quality | 8 | Copy is precise, typo-free, and does not overclaim unavailable or unobserved state. |
| Performance perception | 5 | Long-running or unavailable states communicate progress/limits without appearing frozen. |
| Regression coverage | 5 | Focused unit, integration, E2E, visual, or smoke checks cover the highest-risk fixes. |

Current score: **88/100**

Rationale: the audit now has manual first-run web evidence and Electron E2E
coverage for the approval-state agent workspace plus real-git review and
source-control actions at a 1280x720 viewport. The score is not 100 yet because
multi-worktree compare, Plan/replay/protected-resource states, narrow/mobile-like
layouts, and installed-app smoke still need current end-to-end evidence.

## Issue Register

| ID | Severity | Location | Status | Reproduction | Expected | Actual | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UX-001 | P1 | First-run Landing, unpaired web client, 1280x720, Retro 95 theme | Fixed | Open `http://127.0.0.1:5175/` with no paired runtime and no projects. | The primary `Add Project` CTA is visible without scrolling, text labels are spaced, and unavailable local checks name the web-pairing blocker. | `Add Project` and `CreateWorkspace` were below/clipped at the fold; preflight said `Git is not installed` even though the unpaired web fallback could not know host Git state. | Browser measurement after fix: `Add Project` visible at y=550-588, no clipped buttons, `Create Workspace` spaced, and web copy says `Web client is not paired`. Focused Landing tests passed. |
| UX-002 | P1 | Electron agent workspace, approval-state thread, 1280x720 with sidebar open | Fixed | Enable the GUI agent workspace in Electron, seed a waiting-for-approval Codex thread, and inspect the run board, composer, and right panel. | Header commands, run board row, composer controls, panel tabs, and approval actions fit the visible workspace column with no clipped interactive controls. | The workspace switch could keep its min-content width, so the whole agent workspace overflowed behind the viewport edge; the fixed-width right panel also hid approval actions below non-scrollable content. | `tests/e2e/agent-workspace-polish.spec.ts` now seeds this state and asserts no visible interactive controls clip at 1280x720. The focused E2E file passed 6/6 after the latest coverage update. |
| UX-003 | P1 | Electron agent workspace, Review and Changes tabs, 1280x720 with real source-control changes | Fixed | Enable the GUI agent workspace in Electron, create one staged and one unstaged git change in the active worktree, seed a hosted GitLab review, and inspect the right panel. | Review-only, Stage, Discard, Commit, review metadata, staged files, and unstaged files remain visible and usable without clipping. | This path did not have current end-to-end coverage, leaving review-only and source-control action regressions invisible to the audit loop. | `tests/e2e/agent-workspace-polish.spec.ts` now seeds real staged/unstaged git changes and a GitLab review, then verifies Changes, Review, source-control actions, and viewport clipping at 1280x720. The focused E2E file passed 6/6. |

## Next Audit Targets

- Electron agent-workspace manual pass beyond the seeded approval thread.
- Composer states: empty draft, context tray, verification command, provider hints,
  voice disabled/ready states, and queued follow-up while busy.
- Right panel tabs: Plan, replay export, risk/protected-resource
  badges, and unsupported/partial telemetry.
- Run board and Best-of-N compare across multiple seeded worktrees.
- Narrow-width and smaller-height layout checks for the above surfaces.
