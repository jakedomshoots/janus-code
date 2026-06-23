# Janus Agent Trust Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Janus agent-workspace improvements 1-7: evidence rail, review mode, implementation candidates, composer delivery states, unified inspection frame, preview recovery, and task lifecycle UI.

**Architecture:** Extend the existing `agent-workspace` surface instead of creating a new route. Keep derived product concepts in focused pure model files with Vitest coverage, then render them inside the existing right rail and composer footer using current tokens and shadcn primitives.

**Tech Stack:** React 19, TypeScript, Zustand selectors, Vitest, happy-dom component tests, Tailwind v4 tokens from `src/renderer/src/assets/main.css`.

---

### Task 1: Evidence, lifecycle, candidates, preview recovery

**Files:**
- Create: `src/renderer/src/components/agent-workspace/agent-workspace-lifecycle.ts`
- Create: `src/renderer/src/components/agent-workspace/agent-workspace-candidates.ts`
- Create: `src/renderer/src/components/agent-workspace/agent-workspace-evidence.ts`
- Create: `src/renderer/src/components/agent-workspace/AgentWorkspaceEvidenceRail.tsx`
- Modify: `src/renderer/src/components/agent-workspace/AgentWorkspaceLayout.tsx`
- Modify: `src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanel.tsx`
- Modify: `src/renderer/src/components/agent-workspace/AgentWorkspaceRightPanelSummary.tsx`
- Modify: `src/renderer/src/components/agent-workspace/agent-workspace-right-panel-sections.tsx`
- Test: model tests and `AgentWorkspaceRightPanel.test.tsx`

- [x] **Step 1: Write failing tests** for lifecycle mapping, candidate selection, evidence summaries, and right-panel rendering.
- [x] **Step 2: Run tests and confirm expected failures** from missing modules/labels.
- [x] **Step 3: Implement pure models** with no hardcoded colors and no overclaiming state.
- [x] **Step 4: Implement rail UI** with wired candidate selection, terminal, preview, review, and copy-context actions.
- [x] **Step 5: Run targeted tests and commit.**

### Task 2: Composer delivery states

**Files:**
- Modify: `src/renderer/src/components/agent-workspace/agent-composer-submit.ts`
- Modify: `src/renderer/src/components/agent-workspace/agent-composer-message-sent.ts`
- Modify: `src/renderer/src/components/agent-workspace/AgentComposerFooter.tsx`
- Modify: `src/renderer/src/components/agent-workspace/AgentComposer.tsx`
- Test: `agent-composer-submit.test.ts`, existing composer tests

- [x] **Step 1: Write failing tests** for queued/accepted/running/needs-input/failed copy and local echo states.
- [x] **Step 2: Run tests red.**
- [x] **Step 3: Implement copy/state mapping and footer presentation.**
- [x] **Step 4: Run targeted tests and commit.**

### Task 3: Validation and changelog

**Files:**
- Modify: `CHANGELOG.md`

- [x] **Step 1: Update CHANGELOG.md** with user-facing behavior changes.
- [x] **Step 2: Run typecheck, targeted tests, lint where feasible, and browser screenshots at 320/768/1440.**
- [x] **Step 3: Verify no dead buttons via DOM/action checks.**
- [x] **Step 4: Commit validation docs/changelog if changed.**
