import { describe, expect, it } from 'vitest'

import { makeProject } from './feature-user-story-status-test-project.mjs'
import { main as verifyFeatureUserStoryStatus } from './verify-feature-user-story-status.mjs'
import { COMPLETE_FIXTURE_IDS } from './feature-user-story-status-fixture-ids.mjs'

function makeRequiredCsvRow(id) {
  const kind = id.split(':')[0] ?? 'feature'
  return `${id},${kind},${id},"As a user, I can use ${id}.",The code-backed inventory includes ${id} and the app can expose it.,code,manual,Documented,2026-06-19,`
}

describe('verify-feature-user-story-status', () => {
  it('rejects missing rows for Cmd+J empty-state actions', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'cmd-j-empty-state-action:create-workspace'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for workspace creation sources', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'workspace-create-source:terminal_context_menu'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for workspace status colors', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'workspace-status-color:conductor-progress'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for workspace status icons', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'workspace-status-icon:conductor-progress'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for automation schedule presets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'automation-schedule-preset:custom').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for automation cron fields', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'automation-cron-field:weekday').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for repository badge colors', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'repo-badge-color:ec4899').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for repository local hooks', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'repository-local-hook:archive').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for repository setup run policies', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'repository-setup-run-policy:skip-by-default'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for repository command source policies', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'repository-command-source-policy:run-both'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for setup script import providers', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'setup-script-import-provider:package-manager'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for left sidebar appearance modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'left-sidebar-appearance:tinted').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for AI Vault agents', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'ai-vault-agent:codex').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent status states', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'agent-status-state:waiting').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent status plan step statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'agent-status-plan-step-status:in-progress'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent status tool event statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'agent-status-tool-event-status:failed'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent status failure sources', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'agent-status-failure-source:orchestration'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for agent status approval statuses', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'agent-status-approval-status:expired'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for execution host kinds', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'execution-host-kind:runtime').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for execution host health states', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'execution-host-health:available').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for runtime compatibility block reasons', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'runtime-compat-block-reason:server-too-old'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for desktop compatibility block reasons', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'desktop-compat-block-reason:desktop-too-old'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo telemetry surfaces', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'nested-repo-surface:sidebar').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo runtime kinds', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'nested-repo-runtime-kind:ssh').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo scan results', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'nested-repo-scan-result:scan_failed'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo import actions', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'nested-repo-import-action:back').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo import outcomes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'nested-repo-import-outcome:partial_failure'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for nested repo count buckets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'nested-repo-count-bucket:16+').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for star nag outcomes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'star-nag-outcome:star_failed').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for star nag prompt sources', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'star-nag-prompt-source:force_show').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for star nag prompt modes', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'star-nag-prompt-mode:web').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for star nag agent buckets', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'star-nag-agent-bucket:280+').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall tour depth steps', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'feature-wall-tour-depth-step:workbench_browser'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for feature wall exit actions', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'feature-wall-exit-action:onboarding_continue'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for supported UI locales', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'ui-locale:zh').map((id) =>
        makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for GitHub PR merge methods', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'github-pr-merge-method:merge').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for GitHub issue close reasons', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter(
        (id) => id !== 'github-issue-close-reason:not_planned'
      ).map((id) => makeRequiredCsvRow(id))
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })

  it('rejects missing rows for browser cookie import sources', async () => {
    const root = makeProject({
      csvRows: COMPLETE_FIXTURE_IDS.filter((id) => id !== 'browser-cookie-import-source:brave').map(
        (id) => makeRequiredCsvRow(id)
      )
    })

    await expect(verifyFeatureUserStoryStatus(root)).resolves.toBe(1)
  })
})
