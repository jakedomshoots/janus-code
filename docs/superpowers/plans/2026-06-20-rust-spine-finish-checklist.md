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
- [x] Runtime-status docs explain how non-TypeScript adapters should use the Rust crate and checked-in artifacts.
- [x] Every Rust-spine slice has a red test first, a focused green check, broad verification, and a scoped commit.
- [x] The branch has no unresolved Rust-spine TODOs, a clean worktree, and current verification evidence.
- [x] Future Rust-spine integration guardrails are documented separately from the completed runtime-status spine work.

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

## Product Guardrails

These are guardrails for future product work, not unfinished Rust-spine checklist items:

- Keep TypeScript/Electron as the product shell.
- Add Rust integration only through explicit adapter boundaries, not direct UI rewrites.
- Preserve existing Janus user workflows: chat, worktrees, terminals, project management, settings, and recovery surfaces.
- Validate SSH use cases before treating any Rust runtime behavior as product-ready.
- Validate macOS, Linux, and Windows assumptions in platform-sensitive runtime code.

## Completed Per-Slice Loop

- [x] Pick the smallest unchecked item.
- [x] Write or extend a failing test first.
- [x] Run the focused command and confirm the expected failure.
- [x] Implement the minimal code needed for the test.
- [x] Run `pnpm run verify:runtime-status-rust-samples`.
- [x] Run `cargo fmt --manifest-path crates/runtime-status-contract/Cargo.toml -- --check`.
- [x] Run `pnpm run verify:runtime-porting-summary-artifact`.
- [x] Run `pnpm run verify:runtime-status-samples`.
- [x] Run `pnpm run verify:runtime-status-contract-artifact`.
- [x] Run `pnpm run tc`.
- [x] Run `git diff --check -- <touched files>`.
- [x] Stage only scoped files.
- [x] Commit the slice.
- [x] Repeat until all runtime-status spine boxes are checked.

## Guardrails

- Stop and fix immediately if Rust and TypeScript validation results disagree.
- Stop and fix immediately if any product workflow verification regresses.
- Keep Rust work narrow unless a specific runtime boundary proves measurable reliability, packaging, or maintenance value.
