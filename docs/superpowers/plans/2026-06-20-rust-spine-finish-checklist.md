# Rust Spine Finish Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Janus Rust spine by turning the runtime-status diagnostics contract into a complete, tested Rust adapter boundary, then expand native runtime ownership only after parity, integration, SSH, cross-platform, and verification gates are green.

**Architecture:** TypeScript remains the product shell and current source of truth for UI and Electron behavior. Rust owns narrow runtime contract parsing and verification first. Tauri or deeper native shell work does not start until the Rust contract layer can prove exact parity with the checked-in TypeScript artifacts and samples.

**Tech Stack:** Rust, `serde_json`, Cargo, TypeScript, Vitest, pnpm verification scripts.

---

## Finished State Definition

- [x] Rust exposes typed accessors for every required runtime-status field in `src/shared/runtime-status-contract-artifact.json`.
- [x] Rust exposes full missing-field and invalid-field validation parity with `src/shared/runtime-status-contract-validation.ts`.
- [x] Rust validates the checked-in valid and invalid samples with the same field results as TypeScript.
- [x] Rust verifies artifact summary, JSON schema, sample manifest, enum fields, numeric constraints, nullable fields, array constraints, and string constraints.
- [ ] Runtime-status docs explain how non-TypeScript adapters should use the Rust crate and checked-in artifacts.
- [ ] Every Rust-spine slice has a red test first, a focused green check, broad verification, and a scoped commit.
- [ ] The branch has no unresolved Rust-spine TODOs, a clean worktree, and current verification evidence.
- [ ] Any later Electron/Tauri/native integration preserves SSH behavior, cross-platform behavior, and existing product workflows.

## Current Known State

- [x] Rust crate exists at `crates/runtime-status-contract`.
- [x] Rust verifies the checked-in runtime-status contract artifact and sample manifest.
- [x] Rust parses `graphStatus` and `hostPlatform` as typed enums.
- [x] Rust exposes primitive accessors for `runtimeId`, protocol versions, graph epoch, tab count, leaf count, and authoritative window id.
- [x] Rust exposes a public `capabilities` accessor.
- [x] Rust exposes public missing-field list parity.
- [x] Rust exposes public invalid-field list parity.
- [x] Rust exposes full validation result parity.
- [x] Rust exposes assert-style validation parity.

## Runtime-Status Contract Work

- [x] Add `runtime_status_capabilities(&Value)` with tests for valid string arrays, missing values, non-array values, and non-string items.
- [x] Add public missing-field list API that returns the required fields in contract order.
- [x] Add Rust invalid-field validation for versioned fields, enforcing integer values greater than or equal to `1`.
- [x] Add Rust invalid-field validation for `minCompatibleRuntimeClientVersion <= runtimeProtocolVersion`.
- [x] Add Rust invalid-field validation for non-negative integer fields.
- [x] Add Rust invalid-field validation for `capabilities` as a string array.
- [x] Add Rust invalid-field validation for `graphStatus` and `hostPlatform` enum values.
- [x] Add Rust invalid-field validation for non-empty trimmed `runtimeId`.
- [x] Add Rust invalid-field validation for nullable non-negative integer `authoritativeWindowId`.
- [x] Add Rust `validate_runtime_status_porting_contract(&Value)` result parity.
- [x] Add Rust `assert_runtime_status_porting_contract(&Value)` parity.
- [x] Add sample-driven parity tests that compare valid and invalid samples to the expected TypeScript contract results.

## Product And Integration Work

- [ ] Keep TypeScript/Electron as the product shell while the Rust crate proves parity.
- [ ] Add integration only through explicit adapter boundaries, not direct UI rewrites.
- [ ] Before any Tauri shell work, document what runtime ownership moves to Rust and what stays in TypeScript.
- [ ] Preserve existing Janus user workflows: chat, worktrees, terminals, project management, settings, and recovery surfaces.
- [ ] Validate SSH use cases before treating native runtime behavior as done.
- [ ] Validate macOS, Linux, and Windows assumptions in platform-sensitive runtime code.

## Per-Slice Loop

- [ ] Pick the smallest unchecked item.
- [ ] Write or extend a failing test first.
- [ ] Run the focused command and confirm the expected failure.
- [ ] Implement the minimal code needed for the test.
- [ ] Run `pnpm run verify:runtime-status-rust-samples`.
- [ ] Run `cargo fmt --manifest-path crates/runtime-status-contract/Cargo.toml -- --check`.
- [ ] Run `pnpm run verify:runtime-porting-summary-artifact`.
- [ ] Run `pnpm run verify:runtime-status-samples`.
- [ ] Run `pnpm run verify:runtime-status-contract-artifact`.
- [ ] Run `pnpm run tc`.
- [ ] Run `git diff --check -- <touched files>`.
- [ ] Stage only scoped files.
- [ ] Commit the slice.
- [ ] Repeat until all finished-state boxes are checked.

## Stop Conditions

- [ ] Stop and fix immediately if Rust and TypeScript validation results disagree.
- [ ] Stop and fix immediately if any product workflow verification regresses.
- [ ] Stop before shell migration work if runtime contract parity is incomplete.
- [ ] Stop before broad native rewrites unless the Rust spine shows measurable reliability, packaging, or maintenance value.
